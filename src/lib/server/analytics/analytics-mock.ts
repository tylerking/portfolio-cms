import type { Analytics } from '$lib/types'
import { lastDays, lastMondays } from './calendar'

function mulberry32(seed: number) {
	return () => {
		seed |= 0
		seed = (seed + 0x6d2b79f5) | 0
		let state = Math.imul(seed ^ (seed >>> 15), 1 | seed)
		state = (state + Math.imul(state ^ (state >>> 7), 61 | state)) ^ state
		return ((state ^ (state >>> 14)) >>> 0) / 4294967296
	}
}

export function getMockAnalytics(reasons: string[], content: { path: string; title: string }[]): Analytics {
	const random = mulberry32(20260905)
	const pick = (max: number) => Math.floor(random() * (max + 1))

	const leadsByWeek = lastMondays(12).map((week) => {
		const counts: Record<string, number> = {
			...Object.fromEntries(reasons.map((reason, index) => [reason, pick(index === 0 ? 4 : 2)])),
			Other: 0
		}
		return { week, counts }
	})

	const intent = lastDays(30).map((day) => ({ day, resume: pick(3), outbound: pick(9) }))

	const topContent = content
		.map((item) => ({ ...item, views: 20 + pick(180) }))
		.sort((left, right) => right.views - left.views)
		.slice(0, 8)

	const sources = [
		{ host: 'linkedin.com', views: 240 + pick(120) },
		{ host: 'direct', views: 180 + pick(90) },
		{ host: 'google.com', views: 120 + pick(80) },
		{ host: 'github.com', views: 60 + pick(50) },
		{ host: 'news.ycombinator.com', views: 20 + pick(40) },
		{ host: 'twitter.com', views: 10 + pick(30) }
	].sort((left, right) => right.views - left.views)

	const pageviewsLast30Days = sources.reduce((sum, source) => sum + source.views, 0)
	const resumeDownloadsLast30Days = intent.reduce((sum, day) => sum + day.resume, 0)
	const leadsThisMonth = leadsByWeek
		.slice(-4)
		.reduce((sum, week) => sum + Object.values(week.counts).reduce((total, count) => total + count, 0), 0)

	return {
		source: 'mock',
		reasons,
		stats: {
			unanswered: 3,
			leadsThisMonth,
			resumeDownloadsLast30Days,
			pageviewsLast30Days,
			contactRateLast30Days: leadsThisMonth / pageviewsLast30Days
		},
		leadsByWeek,
		topContent,
		sources,
		intent
	}
}
