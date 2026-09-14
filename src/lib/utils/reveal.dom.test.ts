import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { revealOnScroll } from './reveal'

let reduced = false
let notify: (entries: { isIntersecting: boolean; boundingClientRect: { top: number } }[]) => void = () => {}
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

const BELOW = window.innerHeight + 200

const report = (top: number, isIntersecting = false) => notify([{ isIntersecting, boundingClientRect: { top } }])

describe('revealOnScroll', () => {
	it('hides a row below the fold until it scrolls into view', () => {
		const element = document.createElement('div')
		revealOnScroll(element)
		report(BELOW)
		expect(element.dataset.reveal).toBe('')
		report(BELOW - 100)
		expect(element.hasAttribute('data-reveal')).toBe(true)
		report(100, true)
		expect(element.hasAttribute('data-reveal')).toBe(false)
		expect(disconnect).toHaveBeenCalled()
	})

	it('reads position from the observer, so hydrating the rows forces no layout', () => {
		const element = document.createElement('div')
		const measure = vi.spyOn(element, 'getBoundingClientRect')
		revealOnScroll(element)
		report(BELOW)
		expect(measure).not.toHaveBeenCalled()
		expect(element.dataset.reveal).toBe('')
	})

	it('stops observing a row that unmounts before it is revealed', () => {
		const element = document.createElement('div')
		const cleanup = revealOnScroll(element)
		report(BELOW)
		cleanup?.()
		expect(disconnect).toHaveBeenCalledOnce()
	})

	it('never hides a row that unmounts before its first report', () => {
		const element = document.createElement('div')
		revealOnScroll(element)?.()
		expect(disconnect).toHaveBeenCalledOnce()
		expect(element.hasAttribute('data-reveal')).toBe(false)
	})

	it('never hides a row that is already on screen, and stops watching it', () => {
		const element = document.createElement('div')
		revealOnScroll(element)
		report(10, true)
		expect(element.hasAttribute('data-reveal')).toBe(false)
		expect(disconnect).toHaveBeenCalledOnce()
	})

	it('never hides anything under reduced motion', () => {
		reduced = true
		const element = document.createElement('div')
		expect(revealOnScroll(element)).toBeUndefined()
		expect(element.hasAttribute('data-reveal')).toBe(false)
	})
})
