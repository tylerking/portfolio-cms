import { describe, expect, it } from 'vitest'
import { formatCompact, formatPercent, formatShortDate, padTwoDigits, slugify } from './format'

describe('formatCompact', () => {
	it.each([
		[0, '0'],
		[999, '999'],
		[1000, '1K'],
		[1500, '1.5K'],
		[12_345, '12.3K'],
		[999_999, '1M'],
		[2_340_000, '2.3M']
	])('%i reads as %s', (value, expected) => {
		expect(formatCompact(value)).toBe(expected)
	})
})

describe('formatPercent', () => {
	it('keeps one decimal place', () => {
		expect(formatPercent(0)).toBe('0.0%')
		expect(formatPercent(0.1234)).toBe('12.3%')
	})
})

describe('formatShortDate', () => {
	it('drops the year and leading zeros', () => {
		expect(formatShortDate('2026-09-07')).toBe('9/7')
	})
})

describe('padTwoDigits', () => {
	it('pads single digits only', () => {
		expect(padTwoDigits(3)).toBe('03')
		expect(padTwoDigits(12)).toBe('12')
	})
})

describe('slugify', () => {
	it.each([
		['  Hello, World!  ', 'hello-world'],
		['Café au lait', 'cafe-au-lait'],
		['Already-a-slug', 'already-a-slug'],
		['!!!', '']
	])('%s becomes "%s"', (input, expected) => {
		expect(slugify(input)).toBe(expected)
	})
})
