import { exhibitSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { exhibits } from '$lib/server/db/collections'
import { collectionActions } from '$lib/server/http/actions'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ exhibits: await exhibits.list() })

export const actions: Actions = adminActions(collectionActions(exhibitSchema, exhibits, { slugFromTitle: true }))
