import { afterEach, describe, expect, it, vi } from 'vitest'
import {
	supportsContrastColor,
	supportsOklch,
	supportsPopover,
	supportsViewTransitions,
	supportsWebAnimations
} from './detect'

const domFeatures = () => [supportsPopover(), supportsWebAnimations(), supportsViewTransitions()]

afterEach(() => {
	vi.restoreAllMocks()
	Reflect.deleteProperty(HTMLElement.prototype, 'popover')
	Reflect.deleteProperty(Element.prototype, 'animate')
	Reflect.deleteProperty(document, 'startViewTransition')
})

describe('feature detection', () => {
	it('asks CSS.supports about each colour function', () => {
		vi.spyOn(CSS, 'supports').mockImplementation((_property: string, value?: string) => !!value?.startsWith('oklch'))
		expect(supportsOklch()).toBe(true)
		expect(supportsContrastColor()).toBe(false)
	})

	it('finds DOM features where browsers define them', () => {
		expect(domFeatures()).toEqual([false, false, false])
		Object.defineProperty(HTMLElement.prototype, 'popover', { value: null, configurable: true })
		Object.defineProperty(Element.prototype, 'animate', { value: () => {}, configurable: true })
		Object.defineProperty(document, 'startViewTransition', { value: () => {}, configurable: true })
		expect(domFeatures()).toEqual([true, true, true])
	})
})
