import { adminActions } from '$lib/server/auth/auth'
import { caseStudies } from '$lib/server/db/collections'
import { destroyCaseStudy } from '$lib/server/db/destroy'
import { deleteAction, newEntryAction, reorderAction } from '$lib/server/http/actions'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ cases: await caseStudies.list() })

export const actions: Actions = adminActions({
	create: newEntryAction('/admin/case-studies', caseStudies),
	reorder: reorderAction(caseStudies.reorder),
	delete: deleteAction(destroyCaseStudy)
})
