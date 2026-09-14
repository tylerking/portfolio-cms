import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { containInStage, focusOnOpen } from './contain'

let resize: () => void = () => {}
let frames: FrameRequestCallback[] = []
const disconnect = vi.fn()

const nextFrame = () => {
	for (const callback of frames.splice(0)) callback(0)
}

beforeEach(() => {
	frames = []
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
	vi.stubGlobal('cancelAnimationFrame', () => {
		frames = []
	})
	vi.stubGlobal(
		'ResizeObserver',
		class {
			constructor(callback: typeof resize) {
				resize = callback
			}
			observe() {}
			disconnect = disconnect
		}
	)
	vi.stubGlobal('scrollX', 20)
	vi.stubGlobal('scrollY', 300)
})

afterEach(() => {
	disconnect.mockClear()
	vi.unstubAllGlobals()
})

const stageWith = (bounds: Partial<DOMRect>) => {
	const stage = document.createElement('div')
	stage.getBoundingClientRect = () => ({ left: 100, top: 50, width: 300, height: 200, ...bounds }) as DOMRect
	const level = document.createElement('div')
	level.setAttribute('popover', 'auto')
	stage.append(level)
	return { stage, level }
}

const attached = (level: HTMLElement) => {
	const cleanup = containInStage(level)
	resize()
	return cleanup
}

const read = (stage: HTMLElement) =>
	['--popover-center', '--popover-top', '--popover-width', '--popover-height'].map((name) =>
		stage.style.getPropertyValue(name)
	)

describe('containInStage', () => {
	it('leaves the first measurement to the observer, so attaching forces no layout', () => {
		const { stage, level } = stageWith({})
		const measure = vi.spyOn(stage, 'getBoundingClientRect')
		containInStage(level)
		expect(measure).not.toHaveBeenCalled()
		resize()
		expect(measure).toHaveBeenCalledOnce()
	})

	it('writes the stage box in document coordinates, so the levels scroll with it', () => {
		const { stage, level } = stageWith({})
		attached(level)
		expect(read(stage)).toEqual(['270px', '350px', '300px', '200px'])
	})

	it('measures again when the stage resizes', () => {
		const { stage, level } = stageWith({})
		attached(level)
		stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 267 }) as DOMRect
		resize()
		expect(read(stage)).toEqual(['220px', '300px', '400px', '267px'])
	})

	it('measures again on open, since anything above can push the stage down', () => {
		const { stage, level } = stageWith({})
		attached(level)
		stage.getBoundingClientRect = () => ({ left: 100, top: 400, width: 300, height: 200 }) as DOMRect
		level.dispatchEvent(new Event('beforetoggle'))
		expect(read(stage)).toEqual(['270px', '700px', '300px', '200px'])
	})

	it('measures again when the window resizes, since a centred stage can move without changing size', () => {
		const { stage, level } = stageWith({})
		attached(level)
		stage.getBoundingClientRect = () => ({ left: 180, top: 50, width: 300, height: 200 }) as DOMRect
		window.dispatchEvent(new Event('resize'))
		nextFrame()
		expect(read(stage)).toEqual(['350px', '350px', '300px', '200px'])
	})

	it('measures once per frame however many resize events arrive', () => {
		const { stage, level } = stageWith({})
		attached(level)
		const measure = vi.spyOn(stage, 'getBoundingClientRect')
		window.dispatchEvent(new Event('resize'))
		window.dispatchEvent(new Event('resize'))
		window.dispatchEvent(new Event('resize'))
		expect(measure).not.toHaveBeenCalled()
		nextFrame()
		expect(measure).toHaveBeenCalledOnce()
	})

	it('stops measuring once the level unmounts', () => {
		const { stage, level } = stageWith({})
		const cleanup = attached(level)
		cleanup?.()
		expect(disconnect).toHaveBeenCalledOnce()
		stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 267 }) as DOMRect
		level.dispatchEvent(new Event('beforetoggle'))
		window.dispatchEvent(new Event('resize'))
		nextFrame()
		expect(read(stage)).toEqual(['270px', '350px', '300px', '200px'])
	})

	it('leaves a nested level to inherit what the outermost one measured', () => {
		const { level } = stageWith({})
		const inner = document.createElement('div')
		level.append(inner)
		expect(containInStage(inner)).toBeUndefined()
		expect(level.style.getPropertyValue('--popover-width')).toBe('')
	})

	it('does nothing for a level with no stage around it', () => {
		expect(containInStage(document.createElement('div'))).toBeUndefined()
	})
})

describe('focusOnOpen', () => {
	const toggle = (level: HTMLElement, newState: string) =>
		level.dispatchEvent(Object.assign(new Event('toggle'), { newState }))

	const levelWith = (html: string) => {
		const level = document.createElement('div')
		level.setAttribute('popover', 'auto')
		level.tabIndex = -1
		level.innerHTML = html
		document.body.append(level)
		return level
	}

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('moves focus to the level’s own visible button when it opens', () => {
		const level = levelWith('<button>Open</button><div popover="auto"><button>Inner</button></div>')
		const own = level.querySelector('button') as HTMLButtonElement
		own.getClientRects = () => [{}] as unknown as DOMRectList
		focusOnOpen(level)
		toggle(level, 'open')
		expect(document.activeElement).toBe(own)
	})

	it('focuses the level itself when it has no button to offer', () => {
		const level = levelWith('<p>Last level</p>')
		focusOnOpen(level)
		toggle(level, 'open')
		expect(document.activeElement).toBe(level)
	})

	it('ignores closing, and stops listening once unmounted', () => {
		const level = levelWith('<p>Level</p>')
		const cleanup = focusOnOpen(level)
		toggle(level, 'closed')
		expect(document.activeElement).not.toBe(level)
		cleanup?.()
		level.dispatchEvent(new Event('toggle'))
		toggle(level, 'open')
		expect(document.activeElement).not.toBe(level)
	})
})
