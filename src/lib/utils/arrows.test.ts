import { describe, expect, it } from 'vitest'
import { splitArrows } from './arrows'

describe('splitArrows', () => {
	it('separates a trailing arrow from the words', () => {
		expect(splitArrows('View case studies →')).toEqual([
			{ text: 'View case studies ', arrow: false },
			{ text: '→', arrow: true }
		])
	})

	it('separates a leading arrow from the words', () => {
		expect(splitArrows('← Back home')).toEqual([
			{ text: '←', arrow: true },
			{ text: ' Back home', arrow: false }
		])
	})

	it('leaves a label without arrows whole', () => {
		expect(splitArrows('Get in touch')).toEqual([{ text: 'Get in touch', arrow: false }])
	})

	it('returns nothing for an empty label', () => {
		expect(splitArrows('')).toEqual([])
	})
})
