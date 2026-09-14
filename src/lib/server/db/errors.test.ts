import { describe, expect, it } from 'vitest'
import { isUniqueViolation } from './errors'

describe('isUniqueViolation', () => {
	it.each([
		[{ code: '23505' }, true],
		[{ cause: { code: '23505' } }, true],
		[{ code: '23503' }, false],
		[new Error('plain'), false],
		['23505', false],
		[null, false]
	])('%o is a unique violation: %s', (error, expected) => {
		expect(isUniqueViolation(error)).toBe(expected)
	})
})
