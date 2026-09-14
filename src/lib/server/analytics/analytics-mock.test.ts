import { describe, expect, it } from 'vitest'
import { getMockAnalytics } from './analytics-mock'

const reasons = ['New Project', 'Consultation']
const content = Array.from({ length: 10 }, (_, index) => ({ path: `/case-studies/c${index}`, title: `Case ${index}` }))

describe('getMockAnalytics', () => {
	it('is deterministic, so the dashboard can be designed against it', () => {
		expect(getMockAnalytics(reasons, content)).toEqual(getMockAnalytics(reasons, content))
	})

	it('has the same shape as the real analytics', () => {
		const mock = getMockAnalytics(reasons, content)
		expect(mock.source).toBe('mock')
		expect(mock.leadsByWeek).toHaveLength(12)
		expect(Object.keys(mock.leadsByWeek[0]?.counts ?? {})).toEqual([...reasons, 'Other'])
		expect(mock.intent).toHaveLength(30)
		expect(mock.topContent.length).toBeLessThanOrEqual(8)
		expect(mock.topContent.map((item) => item.views)).toEqual(
			[...mock.topContent.map((item) => item.views)].sort((left, right) => right - left)
		)
		expect(mock.stats.contactRateLast30Days).toBeCloseTo(mock.stats.leadsThisMonth / mock.stats.pageviewsLast30Days)
	})
})
