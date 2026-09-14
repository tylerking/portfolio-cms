import { beforeEach, describe, expect, it, vi } from 'vitest'

const fake = vi.hoisted(() => ({}) as Record<string, string | undefined>)
vi.mock('$env/dynamic/private', () => ({ env: fake }))

const { env } = await import('./env')

beforeEach(() => {
	for (const key of Object.keys(fake)) delete fake[key]
})

describe('env', () => {
	it('requires DATABASE_URL', () => {
		expect(env.databaseUrl().success).toBe(false)
		fake.DATABASE_URL = 'postgres://database'
		expect(env.databaseUrl()).toMatchObject({ success: true, data: 'postgres://database' })
	})

	it('requires a 32-character APP_SECRET', () => {
		fake.APP_SECRET = 'short'
		expect(env.appSecret().success).toBe(false)
		fake.APP_SECRET = 'x'.repeat(32)
		expect(env.appSecret().success).toBe(true)
	})

	it('only reads the first admin when one of its variables is set', () => {
		expect(env.firstAdmin()).toBeNull()
		fake.ADMIN_EMAIL = ' Ada@Example.com '
		expect(env.firstAdmin()?.success).toBe(false)
		fake.ADMIN_PASSWORD = 'long-enough-password'
		expect(env.firstAdmin()).toMatchObject({
			success: true,
			data: { email: 'ada@example.com', password: 'long-enough-password' }
		})
	})
})
