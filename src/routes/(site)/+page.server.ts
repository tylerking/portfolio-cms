import { fail } from '@sveltejs/kit'
import { contactSchema } from '$lib/schemas'
import { allow, clientKey } from '$lib/server/auth/rate-limit'
import { events, messages } from '$lib/server/db/collections'
import { getHomeLists, getSettings } from '$lib/server/db/queries'
import { PUBLIC_CACHE } from '$lib/server/http/cache'
import { parseForm } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

const RATE_LIMIT = 5
const RATE_WINDOW = 600

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders(PUBLIC_CACHE)
	return getHomeLists()
}

export const actions: Actions = {
	contact: async ({ request, getClientAddress }) => {
		const settings = await getSettings()
		const form = await request.formData()
		const text = (name: string) => {
			const value = form.get(name)
			return typeof value === 'string' ? value : ''
		}
		const values = {
			name: text('name'),
			email: text('email'),
			phone: text('phone'),
			reason: text('reason'),
			message: text('message')
		}
		if (!(await allow(clientKey('contact', getClientAddress()), RATE_LIMIT, RATE_WINDOW))) {
			const message = settings.labels.contactRateLimit.replace('{minutes}', String(Math.ceil(RATE_WINDOW / 60)))
			return fail(429, { message, values })
		}
		const parsed = parseForm(form, contactSchema)
		if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field, values })

		const { companyReference, reason, ...data } = parsed.data
		const clean = { ...data, reason: settings.contactReasons.includes(reason) ? reason : '' }

		// Autofill can trip the honeypot, so flag rather than drop: a false positive stays recoverable.
		if (companyReference.trim()) {
			await messages.create({ ...clean, status: 'needs-review' })
			return { success: true }
		}

		await messages.create(clean)
		await events.create({ type: 'contact', path: '/', referrer: '' })
		return { success: true }
	}
}
