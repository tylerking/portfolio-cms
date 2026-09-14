import { error } from '@sveltejs/kit'
import { getCaseBySlug, getCaseNavigation } from '$lib/server/db/queries'
import { PUBLIC_CACHE } from '$lib/server/http/cache'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const [study, navigation] = await Promise.all([getCaseBySlug(params.slug), getCaseNavigation(params.slug)])
	if (!study) throw error(404, 'Case study not found')
	setHeaders(PUBLIC_CACHE)
	return { study, navigation }
}
