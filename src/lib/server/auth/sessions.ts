import { createHash, randomBytes } from 'node:crypto'
import type { Cookies } from '@sveltejs/kit'
import { eq, lt } from 'drizzle-orm'
import { dev } from '$app/environment'
import { db } from '../db'
import { sessions } from '../db/schema'

const IDLE_MILLISECONDS = 12 * 60 * 60 * 1000
const ABSOLUTE_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const TOUCH_MILLISECONDS = 5 * 60 * 1000

// Browsers reject the __Host- prefix without Secure, and Secure cookies cannot be set over plain-http dev.
export const SESSION_COOKIE = dev ? 'admin_session' : '__Host-admin_session'

const digest = (token: string) => createHash('sha256').update(token).digest('hex')

export async function startSession(cookies: Cookies, userId: number): Promise<void> {
	const token = randomBytes(32).toString('base64url')
	const now = new Date()
	await db.delete(sessions).where(lt(sessions.expiresAt, now))
	await db.insert(sessions).values({
		id: digest(token),
		userId,
		createdAt: now,
		lastSeenAt: now,
		expiresAt: new Date(now.getTime() + IDLE_MILLISECONDS)
	})
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: ABSOLUTE_MILLISECONDS / 1000
	})
}

export async function hasValidSession(token: string | undefined): Promise<boolean> {
	if (!token) return false
	const id = digest(token)
	const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1)
	if (!row) return false

	const now = Date.now()
	const hardLimit = row.createdAt.getTime() + ABSOLUTE_MILLISECONDS
	if (row.expiresAt.getTime() <= now || hardLimit <= now) {
		await db.delete(sessions).where(eq(sessions.id, id))
		return false
	}
	if (now - row.lastSeenAt.getTime() > TOUCH_MILLISECONDS) {
		await db
			.update(sessions)
			.set({ lastSeenAt: new Date(now), expiresAt: new Date(Math.min(now + IDLE_MILLISECONDS, hardLimit)) })
			.where(eq(sessions.id, id))
	}
	return true
}

export async function endSession(cookies: Cookies, everywhere: boolean): Promise<void> {
	const token = cookies.get(SESSION_COOKIE)
	if (token) {
		const id = digest(token)
		const [row] = await db.select({ userId: sessions.userId }).from(sessions).where(eq(sessions.id, id)).limit(1)
		if (row) await db.delete(sessions).where(everywhere ? eq(sessions.userId, row.userId) : eq(sessions.id, id))
	}
	cookies.delete(SESSION_COOKIE, { path: '/' })
}
