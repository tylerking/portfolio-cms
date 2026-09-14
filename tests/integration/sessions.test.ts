import { createHash } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { endSession, hasValidSession, SESSION_COOKIE, startSession } from '$lib/server/auth/sessions'
import { db } from '$lib/server/db'
import { sessions } from '$lib/server/db/schema'
import { cookieJar } from '../helpers/cookies'
import { createUser, onlyRow, signedIn } from '../helpers/factories'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')
const sessionFor = async (token: string) =>
	onlyRow(
		await db
			.select()
			.from(sessions)
			.where(eq(sessions.id, digest(token)))
	)

describe('startSession', () => {
	it('sets an HTTP-only strict cookie and stores only the token digest', async () => {
		const user = await createUser()
		const { cookies, jar } = cookieJar()
		await startSession(cookies, user.id)
		const cookie = jar.get(SESSION_COOKIE)
		expect(cookie?.options).toMatchObject({ path: '/', httpOnly: true, sameSite: 'strict' })
		const token = cookie?.value ?? ''
		expect(token).toMatch(/^[\w-]{43}$/)
		const row = await sessionFor(token)
		expect(row.id).not.toBe(token)
		expect(row.userId).toBe(user.id)
	})

	it('clears expired sessions as it starts a new one', async () => {
		const { token } = await signedIn()
		await db.update(sessions).set({ expiresAt: sql`now() - interval '1 minute'` })
		const user = await createUser('second@example.com')
		await startSession(cookieJar().cookies, user.id)
		expect(
			await db
				.select()
				.from(sessions)
				.where(eq(sessions.id, digest(token)))
		).toEqual([])
	})
})

describe('hasValidSession', () => {
	it('rejects a missing or unknown token', async () => {
		expect(await hasValidSession(undefined)).toBe(false)
		expect(await hasValidSession('forged')).toBe(false)
	})

	it('accepts a live session', async () => {
		const { token } = await signedIn()
		expect(await hasValidSession(token)).toBe(true)
	})

	it('ends an idle session and deletes it', async () => {
		const { token } = await signedIn()
		await db.update(sessions).set({ expiresAt: sql`now() - interval '1 second'` })
		expect(await hasValidSession(token)).toBe(false)
		expect(await db.select().from(sessions)).toEqual([])
	})

	it('ends a session past its absolute limit even while active', async () => {
		const { token } = await signedIn()
		await db.update(sessions).set({ createdAt: sql`now() - interval '8 days'` })
		expect(await hasValidSession(token)).toBe(false)
	})

	it('extends the idle window at most every five minutes', async () => {
		const { token } = await signedIn()
		const fresh = await sessionFor(token)
		await hasValidSession(token)
		expect((await sessionFor(token)).expiresAt).toEqual(fresh.expiresAt)

		await db.update(sessions).set({ lastSeenAt: sql`now() - interval '6 minutes'` })
		await hasValidSession(token)
		const touched = await sessionFor(token)
		expect(touched.lastSeenAt.getTime()).toBeGreaterThan(Date.now() - 60_000)
		expect(touched.expiresAt.getTime()).toBeGreaterThanOrEqual(fresh.expiresAt.getTime())
	})
})

describe('endSession', () => {
	it('signs out only the current session by default', async () => {
		const first = await signedIn()
		const second = await signedIn(first.userId)
		const { cookies, jar } = cookieJar(first.cookies)
		await endSession(cookies, false)
		expect(jar.has(SESSION_COOKIE)).toBe(false)
		expect(await hasValidSession(first.token)).toBe(false)
		expect(await hasValidSession(second.token)).toBe(true)
	})

	it('signs out every session of that user, and no one else', async () => {
		const first = await signedIn()
		const second = await signedIn(first.userId)
		const other = await signedIn((await createUser('other@example.com')).id)
		await endSession(cookieJar(first.cookies).cookies, true)
		expect(await hasValidSession(second.token)).toBe(false)
		expect(await hasValidSession(other.token)).toBe(true)
	})

	it('still clears the cookie when the session is already gone', async () => {
		const { cookies, jar } = cookieJar({ [SESSION_COOKIE]: 'stale' })
		await endSession(cookies, true)
		expect(jar.has(SESSION_COOKIE)).toBe(false)
	})
})
