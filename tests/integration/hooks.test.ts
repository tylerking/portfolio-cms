import { isRedirect } from '@sveltejs/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { handle, handleError } from '../../src/hooks.server'
import { requestEvent, thrown } from '../helpers/event'
import { signedIn } from '../helpers/factories'

const resolve = async () => new Response('page')

afterEach(() => {
	vi.restoreAllMocks()
})

describe('handle', () => {
	it('guards every admin route by its resolved id, whatever the raw path looked like', async () => {
		const { event } = requestEvent({ path: '/%61dmin/leads', routeId: '/admin/leads' })
		const error = await thrown(() => handle({ event, resolve }))
		expect(isRedirect(error) && error.location).toBe('/admin/login')
		expect(event.locals.admin).toBe(false)
	})

	it('lets a signed-in admin through and marks the page noindex', async () => {
		const { cookies } = await signedIn()
		const { event } = requestEvent({ path: '/admin/leads', routeId: '/admin/leads', cookies })
		const response = await handle({ event, resolve })
		expect(event.locals.admin).toBe(true)
		expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
	})

	it('adds the security headers to every response and never checks sessions on public routes', async () => {
		const { cookies } = await signedIn()
		const { event } = requestEvent({ path: '/', routeId: '/(site)', cookies })
		const response = await handle({ event, resolve })
		expect(event.locals.admin).toBe(false)
		expect(response.headers.get('x-robots-tag')).toBeNull()
		expect(response.headers.get('strict-transport-security')).toMatch(/max-age=\d+/)
		expect(response.headers.get('x-content-type-options')).toBe('nosniff')
		expect(response.headers.get('x-frame-options')).toBe('DENY')
		expect(response.headers.get('referrer-policy')).toBeTruthy()
		expect(response.headers.get('permissions-policy')).toBeTruthy()
		expect(response.headers.get('cross-origin-opener-policy')).toBe('same-origin')
	})

	it('treats a path that matches no route as public', async () => {
		const { event } = requestEvent({ path: '/nowhere' })
		const response = await handle({ event, resolve })
		expect(event.locals.admin).toBe(false)
		expect(response.headers.get('x-frame-options')).toBe('DENY')
	})
})

describe('handleError', () => {
	it('hides server errors behind a generic message with a reference id', () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {})
		const result = handleError({
			error: new Error('secret detail'),
			event: requestEvent().event,
			status: 500,
			message: 'Internal Error'
		})
		expect(result).toEqual({
			message: 'Something went wrong on our side.',
			id: expect.stringMatching(/^[0-9a-f-]{36}$/)
		})
		expect(log).toHaveBeenCalledOnce()
	})

	it('passes client errors through without logging', () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(handleError({ error: null, event: requestEvent().event, status: 404, message: 'Not Found' })).toMatchObject({
			message: 'Not Found'
		})
		expect(log).not.toHaveBeenCalled()
	})
})
