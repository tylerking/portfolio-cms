import type { Handle, HandleServerError } from '@sveltejs/kit'
import { requireAdmin } from '$lib/server/auth/auth'
import { hasValidSession, SESSION_COOKIE } from '$lib/server/auth/sessions'
import { globalHeaders } from '$lib/server/http/headers'
import headersFile from '../_headers?raw'

// Netlify applies _headers to static files only; anything rendered here has to carry them itself.
const SECURITY_HEADERS = globalHeaders(headersFile)

export const handle: Handle = async ({ event, resolve }) => {
	// Guard on route.id, never url.pathname: the router matches the decoded path, so /%61dmin reaches /admin.
	const adminRoute = event.route.id?.startsWith('/admin') ?? false
	event.locals.admin = adminRoute && (await hasValidSession(event.cookies.get(SESSION_COOKIE)))
	if (adminRoute) requireAdmin(event)

	const response = await resolve(event)
	for (const [name, value] of SECURITY_HEADERS) response.headers.set(name, value)
	if (adminRoute) response.headers.set('X-Robots-Tag', 'noindex, nofollow')
	return response
}

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const id = crypto.randomUUID()
	if (status >= 500) console.error(`[${id}] ${event.request.method} ${event.url.pathname}`, error)
	return { message: status >= 500 ? 'Something went wrong on our side.' : message, id }
}
