import { eq, sql } from 'drizzle-orm'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { allow, clientKey, reset } from '$lib/server/auth/rate-limit'
import { db } from '$lib/server/db'
import { rateLimits } from '$lib/server/db/schema'
import { env } from '$lib/server/env'

describe('clientKey', () => {
	it('scopes the key and never stores the raw address', () => {
		const key = clientKey('login', '203.0.113.9')
		expect(key).toMatch(/^login:[\w-]{43}$/)
		expect(key).not.toContain('203.0.113.9')
		expect(clientKey('login', '203.0.113.9')).toBe(key)
		expect(clientKey('contact', '203.0.113.9')).not.toBe(key)
	})

	it('refuses to run without a usable APP_SECRET', () => {
		const secret = vi.spyOn(env, 'appSecret').mockReturnValue(z.string().min(32).safeParse('too-short'))
		expect(() => clientKey('login', '203.0.113.9')).toThrow('APP_SECRET')
		secret.mockRestore()
	})
})

describe('allow', () => {
	it('allows up to the limit inside the window', async () => {
		const results = []
		for (let attempt = 0; attempt < 4; attempt++) results.push(await allow('test:a', 3, 60))
		expect(results).toEqual([true, true, true, false])
	})

	it('counts concurrent requests atomically', async () => {
		const results = await Promise.all(Array.from({ length: 20 }, () => allow('test:burst', 5, 60)))
		expect(results.filter(Boolean)).toHaveLength(5)
	})

	it('starts a fresh window once the old one expires', async () => {
		await allow('test:b', 1, 60)
		expect(await allow('test:b', 1, 60)).toBe(false)
		await db.update(rateLimits).set({ expiresAt: sql`now() - interval '1 second'` }).where(eq(rateLimits.key, 'test:b'))
		expect(await allow('test:b', 1, 60)).toBe(true)
	})

	it('clears expired rows from other keys when a window starts', async () => {
		await allow('test:old', 1, 60)
		await db.update(rateLimits).set({ expiresAt: sql`now() - interval '1 second'` })
		await allow('test:new', 1, 60)
		expect((await db.select().from(rateLimits)).map((row) => row.key)).toEqual(['test:new'])
	})
})

describe('reset', () => {
	it('forgets a key', async () => {
		await allow('test:c', 1, 60)
		await reset('test:c')
		expect(await allow('test:c', 1, 60)).toBe(true)
	})
})
