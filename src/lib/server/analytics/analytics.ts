import { sql } from 'drizzle-orm'
import type { Analytics } from '$lib/types'
import { db } from '../db'
import { caseStudies } from '../db/collections'
import { lastDays, lastMondays } from './calendar'

type Row = Record<string, unknown>
const rows = async (query: ReturnType<typeof sql>) => (await db.execute<Row>(query)).rows
const toInteger = (value: unknown) => Number(value ?? 0) || 0

export async function getAnalytics(reasons: string[]): Promise<Analytics> {
	const [leads, statistics, content, sources, intent, caseList] = await Promise.all([
		rows(sql`
			select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week, reason, count(*)::int as total
			from messages where created_at >= now() - interval '12 weeks' group by 1, 2`),
		rows(sql`
			select
				(select count(*) from messages where status = 'new')::int as unanswered,
				(select count(*) from messages where created_at >= date_trunc('month', now()))::int as leads_this_month,
				(select count(*) from events where type = 'resume' and created_at >= now() - interval '30 days')::int as resume_last_30_days,
				(select count(*) from events where type = 'pageview' and created_at >= now() - interval '30 days')::int as pageviews_last_30_days,
				(select count(*) from events where type = 'contact' and created_at >= now() - interval '30 days')::int as contacts_last_30_days`),
		rows(sql`
			select path, count(*)::int as views from events
			where type = 'pageview' and created_at >= now() - interval '30 days'
				and path like '/case-studies/%'
			group by path order by views desc limit 8`),
		rows(sql`
			select coalesce(nullif(referrer, ''), 'direct') as host, count(*)::int as views from events
			where type = 'pageview' and created_at >= now() - interval '30 days'
			group by 1 order by 2 desc limit 8`),
		rows(sql`
			select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day, type, count(*)::int as total
			from events where type in ('resume', 'outbound') and created_at >= now() - interval '30 days'
			group by 1, 2`),
		caseStudies.list()
	])

	const bucket = (reason: unknown) => {
		const named = String(reason ?? '')
		return reasons.includes(named) ? named : 'Other'
	}
	const weeks = lastMondays(12)
	const leadsByWeek = weeks.map((week) => {
		const counts: Record<string, number> = Object.fromEntries([...reasons, 'Other'].map((reason) => [reason, 0]))
		for (const row of leads) {
			if (row.week !== week) continue
			const key = bucket(row.reason)
			counts[key] = (counts[key] ?? 0) + toInteger(row.total)
		}
		return { week, counts }
	})

	const titles = new Map(caseList.map((study) => [`/case-studies/${study.slug}`, study.title]))

	const days = lastDays(30)
	const intentByDay = days.map((day) => ({
		day,
		resume: intent
			.filter((row) => row.day === day && row.type === 'resume')
			.reduce((sum, row) => sum + toInteger(row.total), 0),
		outbound: intent
			.filter((row) => row.day === day && row.type === 'outbound')
			.reduce((sum, row) => sum + toInteger(row.total), 0)
	}))

	const totals = statistics[0] ?? {}
	const pageviewsLast30Days = toInteger(totals.pageviews_last_30_days)
	return {
		source: 'real',
		reasons,
		stats: {
			unanswered: toInteger(totals.unanswered),
			leadsThisMonth: toInteger(totals.leads_this_month),
			resumeDownloadsLast30Days: toInteger(totals.resume_last_30_days),
			pageviewsLast30Days: pageviewsLast30Days,
			contactRateLast30Days: pageviewsLast30Days ? toInteger(totals.contacts_last_30_days) / pageviewsLast30Days : 0
		},
		leadsByWeek,
		topContent: content.map((row) => ({
			path: String(row.path),
			title: titles.get(String(row.path)) ?? String(row.path),
			views: toInteger(row.views)
		})),
		sources: sources.map((row) => ({ host: String(row.host), views: toInteger(row.views) })),
		intent: intentByDay
	}
}
