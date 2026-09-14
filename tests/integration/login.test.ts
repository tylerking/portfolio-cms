import { isRedirect } from '@sveltejs/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasValidSession, SESSION_COOKIE } from '$lib/server/auth/sessions'
import { env } from '$lib/server/env'
import { actions, load } from '../../src/routes/admin/login/+page.server'
import { POST as logout } from '../../src/routes/admin/logout/+server'
import { action, outcome } from '../helpers/actions'
import { requestEvent, thrown } from '../helpers/event'
import { createUser, PASSWORD, signedIn } from '../helpers/factories'

const signIn = action(actions, 'default')
const attempt = (form: Record<string, string>, ip = '198.51.100.7') =>
	requestEvent({ form, ip, routeId: '/admin/login' })

afterEach(() => {
	vi.restoreAllMocks()
})

describe('login page', () => {
	it('sends a signed-in admin straight to the dashboard', async () => {
		const error = await thrown(() => load(requestEvent({ admin: true }).event))
		expect(isRedirect(error) && error.location).toBe('/admin')
		expect(await load(requestEvent().event)).toEqual({ name: expect.any(String) })
	})

	it('signs in with the right email and password', async () => {
		const user = await createUser()
		const { event, jar } = attempt({ email: ' Admin@Example.com ', password: PASSWORD })
		const error = await thrown(() => signIn(event))
		expect(isRedirect(error) && error.location).toBe('/admin')
		const token = jar.get(SESSION_COOKIE)?.value
		expect(await hasValidSession(token)).toBe(true)
		expect(user.id).toBeGreaterThan(0)
	})

	it('explains each failure and keeps the email the visitor typed', async () => {
		vi.spyOn(env, 'firstAdmin').mockReturnValue(null)
		expect(outcome(await signIn(attempt({ email: 'admin@example.com', password: PASSWORD }).event))).toEqual({
			status: 503,
			message: 'Sign-in is not configured on this server.',
			email: 'admin@example.com'
		})
		await createUser()
		expect(outcome(await signIn(attempt({ email: 'admin@example.com', password: 'nope' }).event))).toMatchObject({
			status: 401,
			message: 'Incorrect email or password.',
			credentials: true
		})
		expect(outcome(await signIn(attempt({ email: 'not-an-email', password: 'x' }).event))).toEqual({
			status: 400,
			message: 'Enter your email and password.',
			email: 'not-an-email',
			credentials: true
		})
	})

	it('locks one client out after eight attempts without affecting another', async () => {
		await createUser()
		for (let index = 0; index < 8; index++) {
			expect(outcome(await signIn(attempt({ email: 'admin@example.com', password: 'wrong' }).event))).toMatchObject({
				status: 401
			})
		}
		expect(outcome(await signIn(attempt({ email: 'admin@example.com', password: PASSWORD }).event))).toMatchObject({
			status: 429
		})
		const other = attempt({ email: 'admin@example.com', password: PASSWORD }, '203.0.113.50')
		expect(isRedirect(await thrown(() => signIn(other.event)))).toBe(true)
	})
})

describe('logout', () => {
	it('ends the current session and returns to the login page', async () => {
		const first = await signedIn()
		const second = await signedIn(first.userId)
		const { event, jar } = requestEvent({ method: 'POST', form: {}, cookies: first.cookies })
		const error = await thrown(() => logout(event))
		expect(isRedirect(error) && error.location).toBe('/admin/login')
		expect(jar.has(SESSION_COOKIE)).toBe(false)
		expect(await hasValidSession(first.token)).toBe(false)
		expect(await hasValidSession(second.token)).toBe(true)
	})

	it('signs out everywhere when asked', async () => {
		const first = await signedIn()
		const second = await signedIn(first.userId)
		await thrown(() => logout(requestEvent({ form: { scope: 'all' }, cookies: first.cookies }).event))
		expect(await hasValidSession(second.token)).toBe(false)
	})
})
