import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { revealOnScroll } from './reveal'

let reduced = false
let notify: (entries: { isIntersecting: boolean }[]) => void = () => {}
const disconnect = vi.fn()

beforeEach(() => {
	vi.stubGlobal('matchMedia', () => ({ matches: reduced }))
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			constructor(callback: typeof notify) {
				notify = callback
			}
			observe() {}
			disconnect = disconnect
		}
	)
})

afterEach(() => {
	reduced = false
	disconnect.mockClear()
	vi.unstubAllGlobals()
})

const row = (top: number) => {
	const element = document.createElement('div')
	element.getBoundingClientRect = () => ({ top }) as DOMRect
	return element
}

const measured = () => new Promise<void>((resolve) => queueMicrotask(resolve))

describe('revealOnScroll', () => {
	it('hides a row below the fold until it scrolls into view', async () => {
		const element = row(window.innerHeight + 200)
		revealOnScroll(element)
		await measured()
		expect(element.dataset.reveal).toBe('')
		notify([{ isIntersecting: false }])
		expect(element.hasAttribute('data-reveal')).toBe(true)
		notify([{ isIntersecting: true }])
		expect(element.hasAttribute('data-reveal')).toBe(false)
		expect(disconnect).toHaveBeenCalled()
	})

	it('measures every row before hiding any, so the rows cost one layout between them', async () => {
		const rows = [1, 2, 3].map(() => row(window.innerHeight + 200))
		const hiddenAtRead: boolean[] = []
		for (const element of rows) {
			element.getBoundingClientRect = () => {
				hiddenAtRead.push(rows.some((candidate) => candidate.hasAttribute('data-reveal')))
				return { top: window.innerHeight + 200 } as DOMRect
			}
			revealOnScroll(element)
		}
		await measured()
		expect(hiddenAtRead).toEqual([false, false, false])
		expect(rows.every((element) => element.dataset.reveal === '')).toBe(true)
	})

	it('stops observing a row that unmounts before it is revealed', async () => {
		const cleanup = revealOnScroll(row(window.innerHeight + 200))
		await measured()
		cleanup?.()
		expect(disconnect).toHaveBeenCalledOnce()
	})

	it('never measures or hides a row that unmounts before the batch runs', async () => {
		const element = row(window.innerHeight + 200)
		const measure = vi.spyOn(element, 'getBoundingClientRect')
		revealOnScroll(element)?.()
		await measured()
		expect(measure).not.toHaveBeenCalled()
		expect(element.hasAttribute('data-reveal')).toBe(false)
	})

	it('never hides a row that is already on screen', async () => {
		const element = row(10)
		revealOnScroll(element)
		await measured()
		expect(element.hasAttribute('data-reveal')).toBe(false)
	})

	it('never hides anything under reduced motion', async () => {
		reduced = true
		const element = row(window.innerHeight + 200)
		expect(revealOnScroll(element)).toBeUndefined()
		await measured()
		expect(element.hasAttribute('data-reveal')).toBe(false)
	})
})
