import { approachSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { approachSteps } from '$lib/server/db/collections'
import { collectionActions } from '$lib/server/http/actions'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ steps: await approachSteps.list() })

export const actions: Actions = adminActions(collectionActions(approachSchema, approachSteps))
