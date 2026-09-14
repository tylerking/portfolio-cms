import { fail, type RequestEvent } from '@sveltejs/kit'
import { projectSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { projects } from '$lib/server/db/collections'
import { destroyProject } from '$lib/server/db/destroy'
import { collectionActions, coverActions } from '$lib/server/http/actions'
import { parseId } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ projects: await projects.list() })

const collection = collectionActions(projectSchema, { ...projects, remove: destroyProject })

export const actions: Actions = adminActions({
	...collection,
	update: async (event: RequestEvent) => {
		const form = await event.request.clone().formData()
		const id = parseId(form)
		const project = id.ok ? await projects.get(id.value) : null
		if (project?.coverKey && !String(form.get('coverAlt') ?? '').trim())
			return fail(400, { message: 'Cover alt text is required.', field: 'coverAlt' })
		return collection.update(event)
	},
	...coverActions({
		locate: async (_event, form) => {
			const id = parseId(form)
			return id.ok ? projects.get(id.value) : null
		},
		save: (id, cover) => projects.update(id, cover)
	})
})
