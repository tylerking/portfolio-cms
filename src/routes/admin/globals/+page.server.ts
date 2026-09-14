import { fail } from '@sveltejs/kit'
import { labelsSchema, settingsSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { saveSiteSettings } from '$lib/server/db/collections'
import { getSettings } from '$lib/server/db/queries'
import { firstIssue, parseForm } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ settings: await getSettings() })

export const actions: Actions = adminActions({
	update: async ({ request }) => {
		const form = await request.formData()
		const parsed = parseForm(form, settingsSchema)
		if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })

		const raw: Record<string, string> = {}
		for (const [key, value] of form) {
			if (key.startsWith('label__') && typeof value === 'string') raw[key.slice(7)] = value
		}
		const labels = labelsSchema.safeParse(raw)
		if (!labels.success) return fail(400, { message: `labels: ${firstIssue(labels.error).message}` })

		await saveSiteSettings({ ...parsed.data, labels: labels.data })
		return { success: true }
	}
})
