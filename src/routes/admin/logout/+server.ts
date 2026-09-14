import { redirect } from '@sveltejs/kit'
import { LOGIN_PATH } from '$lib/server/auth/auth'
import { endSession } from '$lib/server/auth/sessions'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ cookies, request }) => {
	const everywhere = (await request.formData()).get('scope') === 'all'
	await endSession(cookies, everywhere)
	throw redirect(303, LOGIN_PATH)
}
