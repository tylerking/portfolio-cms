import { redirect } from '@sveltejs/kit'
import { getAnalytics } from '$lib/server/analytics/analytics'
import { getMockAnalytics } from '$lib/server/analytics/analytics-mock'
import { readDataSource, writeDataSource } from '$lib/server/analytics/data-source'
import { adminActions } from '$lib/server/auth/auth'
import { approachSteps, caseStudies, exhibits, projects, skillGroups } from '$lib/server/db/collections'
import { getSettings } from '$lib/server/db/queries'
import type { Actions, PageServerLoad } from './$types'

async function mockAnalytics(reasons: string[]) {
	const cases = await caseStudies.list()
	return getMockAnalytics(
		reasons,
		cases.map((study) => ({ path: `/case-studies/${study.slug}`, title: study.title }))
	)
}

export const load: PageServerLoad = async ({ cookies }) => {
	const source = readDataSource(cookies)
	const [analytics, exhibitCount, caseCount, skillCount, stepCount, projectCount] = await Promise.all([
		getSettings().then(({ contactReasons }) =>
			source === 'mock' ? mockAnalytics(contactReasons) : getAnalytics(contactReasons)
		),
		exhibits.count(),
		caseStudies.count(),
		skillGroups.count(),
		approachSteps.count(),
		projects.count()
	])
	return {
		analytics,
		counts: {
			exhibits: exhibitCount,
			cases: caseCount,
			skills: skillCount,
			approach: stepCount,
			projects: projectCount
		}
	}
}

export const actions: Actions = adminActions({
	setSource: async ({ request, cookies }) => {
		writeDataSource(cookies, (await request.formData()).get('source'))
		throw redirect(303, '/admin')
	}
})
