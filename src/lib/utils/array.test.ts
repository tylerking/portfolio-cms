import { describe, expect, it } from 'vitest'
import { moveItem } from './array'

describe('moveItem', () => {
	it('moves an item without mutating the input', () => {
		const items = ['a', 'b', 'c'] as const
		expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a'])
		expect(moveItem(items, 2, 0)).toEqual(['c', 'a', 'b'])
		expect(items).toEqual(['a', 'b', 'c'])
	})

	it('returns an unchanged copy for out-of-range positions', () => {
		expect(moveItem(['a', 'b'], 0, 2)).toEqual(['a', 'b'])
		expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b'])
	})
})
