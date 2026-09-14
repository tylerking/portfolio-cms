import { afterEach, describe, expect, it, vi } from 'vitest'
import { lastDays, lastMondays } from './calendar'

afterEach(() => {
	vi.useRealTimers()
})

describe('lastDays', () => {
	it('ends on today in UTC, oldest first', () => {
		vi.useFakeTimers({ now: new Date('2026-09-10T23:30:00Z') })
		expect(lastDays(3)).toEqual(['2026-09-08', '2026-09-09', '2026-09-10'])
	})
})

describe('lastMondays', () => {
	it.each([
		['a Thursday', '2026-09-10T12:00:00Z'],
		['the Monday itself', '2026-09-07T00:00:00Z'],
		['the following Sunday', '2026-09-13T23:59:00Z']
	])('counts back from the current ISO week on %s', (_day, now) => {
		vi.useFakeTimers({ now: new Date(now) })
		expect(lastMondays(2)).toEqual(['2026-08-31', '2026-09-07'])
	})
})
