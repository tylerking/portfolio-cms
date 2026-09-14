import { fail, redirect } from '@sveltejs/kit'
import { loginSchema } from '$lib/schemas'
import { verifyLogin } from '$lib/server/auth/auth'
import { allow, clientKey, reset } from '$lib/server/auth/rate-limit'
import { startSession } from '$lib/server/auth/sessions'
import { getSettings } from '$lib/server/db/queries'
import { parseForm } from '$lib/server/http/forms'
import type { Actions, PageServerLoad } from './$types'

const WINDOW_SECONDS = 900
const PER_CLIENT = 8
const OVERALL = 50

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.admin) throw redirect(303, '/admin')
	return { name: (await getSettings()).name }
}

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const form = await request.formData()
		const email = String(form.get('email') ?? '')

		const key = clientKey('login', getClientAddress())
		const allowed =
			(await allow(key, PER_CLIENT, WINDOW_SECONDS)) && (await allow('login:all', OVERALL, WINDOW_SECONDS))
		if (!allowed) return fail(429, { message: 'Too many attempts. Try again in a few minutes.', email })

		const parsed = parseForm(form, loginSchema)
		if (!parsed.ok) return fail(400, { message: 'Enter your email and password.', email, credentials: true })

		const result = await verifyLogin(parsed.data.email, parsed.data.password)
		if (result === 'unconfigured') return fail(503, { message: 'Sign-in is not configured on this server.', email })
		if (result === 'wrong') return fail(401, { message: 'Incorrect email or password.', email, credentials: true })

		await reset(key)
		await startSession(cookies, result.userId)
		throw redirect(303, '/admin')
	}
}
