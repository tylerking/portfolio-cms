import { fail } from '@sveltejs/kit'
import { messageStatusSchema } from '$lib/schemas'
import { readDataSource } from '$lib/server/analytics/data-source'
import { adminActions } from '$lib/server/auth/auth'
import { messages } from '$lib/server/db/collections'
import { deleteAction } from '$lib/server/http/actions'
import { parseId } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ cookies }) => ({
	messages: await messages.list(),
	mock: readDataSource(cookies) === 'mock'
})

export const actions: Actions = adminActions({
	setStatus: async ({ request }) => {
		const form = await request.formData()
		const id = parseId(form)
		const status = messageStatusSchema.safeParse(form.get('status'))
		if (!id.ok || !status.success) return fail(400, { message: 'Invalid status update' })
		await messages.update(id.value, { status: status.data })
		return { success: true }
	},
	delete: deleteAction(messages.remove)
})
