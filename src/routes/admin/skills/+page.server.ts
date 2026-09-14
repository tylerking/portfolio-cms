import { skillSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { skillGroups } from '$lib/server/db/collections'
import { collectionActions } from '$lib/server/http/actions'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ skills: await skillGroups.list() })

export const actions: Actions = adminActions(collectionActions(skillSchema, skillGroups))
