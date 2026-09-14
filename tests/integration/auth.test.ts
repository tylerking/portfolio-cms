import { fail, isRedirect } from '@sveltejs/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { action } from '../helpers/actions'

const purgeTags = vi.hoisted(() => vi.fn())
vi.mock('$lib/server/http/cache', async (original) => ({ ...(await original<object>()), purgeTags }))

const { adminActions, LOGIN_PATH, requireAdmin, verifyLogin } = await import('$lib/server/auth/auth')
const { db } = await import('$lib/server/db')
const { users } = await import('$lib/server/db/schema')
const { env } = await import('$lib/server/env')
const { createUser, PASSWORD } = await import('../helpers/factories')
const { requestEvent, thrown } = await import('../helpers/event')

afterEach(() => {
	vi.restoreAllMocks()
	purgeTags.mockReset()
})

describe('verifyLogin', () => {
	const firstAdmin = (value: ReturnType<typeof env.firstAdmin>) => vi.spyOn(env, 'firstAdmin').mockReturnValue(value)
	const owner = { email: 'owner@example.com', password: 'a-long-password' }

	it('creates the first admin from the environment on the first sign-in', async () => {
		firstAdmin({ success: true, data: owner })
		const result = await verifyLogin(owner.email, owner.password)
		const [created] = await db.select().from(users)
		expect(created).toMatchObject({ email: owner.email, role: 'admin' })
		expect(result).toEqual({ userId: created?.id })
	})

	it('accepts the right password and rejects everything else', async () => {
		const user = await createUser()
		expect(await verifyLogin('admin@example.com', PASSWORD)).toEqual({ userId: user.id })
		expect(await verifyLogin('admin@example.com', 'wrong-password')).toBe('wrong')
		expect(await verifyLogin('nobody@example.com', PASSWORD)).toBe('wrong')
	})

	it('never adds a second user once one exists', async () => {
		await createUser()
		firstAdmin({ success: true, data: owner })
		expect(await verifyLogin(owner.email, owner.password)).toBe('wrong')
		expect(await db.$count(users)).toBe(1)
	})

	it('reports an unconfigured site when there is no user to sign in and none to create', async () => {
		firstAdmin(null)
		expect(await verifyLogin('admin@example.com', PASSWORD)).toBe('unconfigured')
		const log = vi.spyOn(console, 'error').mockImplementation(() => {})
		firstAdmin(z.object({ email: z.email(), password: z.string() }).safeParse({ email: 'nope' }))
		expect(await verifyLogin('admin@example.com', PASSWORD)).toBe('unconfigured')
		expect(log).toHaveBeenCalled()
		expect(await db.$count(users)).toBe(0)
	})
})

describe('requireAdmin', () => {
	it('sends a signed-out visitor to the login page', async () => {
		const error = await thrown(() => requireAdmin(requestEvent({ routeId: '/admin/leads' }).event))
		expect(isRedirect(error) && error.location).toBe(LOGIN_PATH)
	})

	it('lets an admin and the login page itself through', () => {
		expect(() => requireAdmin(requestEvent({ routeId: '/admin/leads', admin: true }).event)).not.toThrow()
		expect(() => requireAdmin(requestEvent({ routeId: LOGIN_PATH }).event)).not.toThrow()
	})
})

describe('adminActions', () => {
	const actions = adminActions({
		save: () => ({ success: true }),
		reject: () => fail(400, { message: 'no' }),
		leave: () => {
			throw new Error('boom')
		}
	})

	it('refuses every action to a signed-out visitor', async () => {
		const error = await thrown(() => action(actions, 'save')(requestEvent({ routeId: '/admin' }).event))
		expect(isRedirect(error)).toBe(true)
		expect(purgeTags).not.toHaveBeenCalled()
	})

	it('purges the public cache only after a successful change', async () => {
		const { event } = requestEvent({ routeId: '/admin', admin: true })
		await action(actions, 'save')(event)
		expect(purgeTags).toHaveBeenCalledWith(['content'])
		purgeTags.mockReset()
		await action(actions, 'reject')(event)
		expect(purgeTags).not.toHaveBeenCalled()
		await expect(action(actions, 'leave')(event)).rejects.toThrow('boom')
		expect(purgeTags).not.toHaveBeenCalled()
	})

	it('purges when a successful action redirects', async () => {
		const redirecting = adminActions({
			go: async () => {
				const { redirect } = await import('@sveltejs/kit')
				throw redirect(303, '/admin')
			}
		})
		const error = await thrown(() => action(redirecting, 'go')(requestEvent({ routeId: '/admin', admin: true }).event))
		expect(isRedirect(error)).toBe(true)
		expect(purgeTags).toHaveBeenCalledWith(['content'])
	})
})
