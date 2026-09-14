import { notFoundLoad } from '$lib/server/http/notFound'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = notFoundLoad
