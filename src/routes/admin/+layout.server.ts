import { requireAdmin } from '$lib/server/auth/auth'
import { getSettings } from '$lib/server/db/queries'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async (event) => {
	requireAdmin(event)
	const { name } = await getSettings()
	return { admin: event.locals.admin, name }
}
