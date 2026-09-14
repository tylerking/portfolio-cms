import { describe, expect, it } from 'vitest'
import { getAnalytics } from '$lib/server/analytics/analytics'
import { lastDays, lastMondays } from '$lib/server/analytics/calendar'
import { insertCase, insertEvent, insertMessage } from '../helpers/factories'

const reasons = ['New Project', 'Consultation']

describe('getAnalytics', () => {
	it('reports zeros and empty lists with no data', async () => {
		const analytics = await getAnalytics(reasons)
		expect(analytics.source).toBe('real')
		expect(analytics.stats).toEqual({
			unanswered: 0,
			leadsThisMonth: 0,
			resumeDownloadsLast30Days: 0,
			pageviewsLast30Days: 0,
			contactRateLast30Days: 0
		})
		expect(analytics.leadsByWeek.map((week) => week.week)).toEqual(lastMondays(12))
		expect(analytics.intent.map((day) => day.day)).toEqual(lastDays(30))
		expect(analytics.topContent).toEqual([])
		expect(analytics.sources).toEqual([])
	})

	it('buckets leads by reason, folding unknown reasons into Other', async () => {
		await insertMessage({ reason: 'New Project' })
		await insertMessage({ reason: 'Something else', status: 'replied' })
		await insertMessage({ reason: '' })
		const analytics = await getAnalytics(reasons)
		expect(analytics.leadsByWeek.at(-1)?.counts).toEqual({ 'New Project': 1, Consultation: 0, Other: 2 })
		expect(analytics.stats.unanswered).toBe(2)
		expect(analytics.stats.leadsThisMonth).toBe(3)
	})

	it('counts pageviews, sources, resume downloads and the contact rate', async () => {
		await insertCase({ slug: 'this-site', title: 'This Site' })
		for (const referrer of ['linkedin.com', 'linkedin.com', '', ''])
			await insertEvent({ path: '/case-studies/this-site', referrer })
		await insertEvent({ path: '/case-studies/gone' })
		await insertEvent({ type: 'resume', path: '/resume.pdf' })
		await insertEvent({ type: 'outbound', path: 'https://github.com/example' })
		await insertEvent({ type: 'contact', path: '/' })
		await insertEvent({ path: '/case-studies/this-site', createdAt: new Date(Date.now() - 40 * 86_400_000) })

		const analytics = await getAnalytics(reasons)
		expect(analytics.stats.pageviewsLast30Days).toBe(5)
		expect(analytics.stats.resumeDownloadsLast30Days).toBe(1)
		expect(analytics.stats.contactRateLast30Days).toBeCloseTo(1 / 5)
		expect(analytics.topContent).toEqual([
			{ path: '/case-studies/this-site', title: 'This Site', views: 4 },
			{ path: '/case-studies/gone', title: '/case-studies/gone', views: 1 }
		])
		expect(analytics.sources).toEqual([
			{ host: 'direct', views: 3 },
			{ host: 'linkedin.com', views: 2 }
		])
		expect(analytics.intent.at(-1)).toMatchObject({ resume: 1, outbound: 1 })
	})
})
