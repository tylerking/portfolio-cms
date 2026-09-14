import { fail } from '@sveltejs/kit'
import { homeContentSchema, sectionOrderSchema, sectionSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { saveHomeContent } from '$lib/server/db/collections'
import { getHomeContent } from '$lib/server/db/queries'
import { firstIssue, parseForm } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async () => ({ home: await getHomeContent() })

export const actions: Actions = adminActions({
	update: async ({ request }) => {
		const form = await request.formData()
		const parsed = parseForm(form, homeContentSchema)
		if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })

		const order = sectionOrderSchema.safeParse(form.get('sectionOrder'))
		if (!order.success) return fail(400, { message: 'Section order must list every section once.' })

		const sections = order.data.map((id) =>
			sectionSchema.safeParse({
				id,
				label: form.get(`section__${id}__label`),
				heading: form.get(`section__${id}__heading`) ?? ''
			})
		)
		const invalid = sections.find((result) => !result.success)
		if (invalid && !invalid.success) return fail(400, { message: `sections: ${firstIssue(invalid.error).message}` })

		await saveHomeContent({
			...parsed.data,
			sections: sections.flatMap((result) => (result.success ? [result.data] : []))
		})
		return { success: true }
	}
})
