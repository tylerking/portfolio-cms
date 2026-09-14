import { createHmac } from 'node:crypto'
import { eq, lt, sql } from 'drizzle-orm'
import { db } from '../db'
import { rateLimits } from '../db/schema'
import { env } from '../env'

export function clientKey(scope: string, address: string): string {
	const secret = env.appSecret()
	if (!secret.success) throw new Error('APP_SECRET must be set and at least 32 characters')
	return `${scope}:${createHmac('sha256', secret.data).update(address).digest('base64url')}`
}

export async function allow(key: string, limit: number, windowSeconds: number): Promise<boolean> {
	const expired = sql`${rateLimits.expiresAt} < now()`
	const [row] = await db
		.insert(rateLimits)
		.values({ key, count: 1, expiresAt: sql`now() + make_interval(secs => ${windowSeconds})` })
		.onConflictDoUpdate({
			target: rateLimits.key,
			set: {
				count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
				expiresAt: sql`case when ${expired} then excluded.expires_at else ${rateLimits.expiresAt} end`
			}
		})
		.returning({ count: rateLimits.count })
	if (row?.count === 1) await db.delete(rateLimits).where(lt(rateLimits.expiresAt, sql`now()`))
	return (row?.count ?? 0) <= limit
}

export async function reset(key: string): Promise<void> {
	await db.delete(rateLimits).where(eq(rateLimits.key, key))
}
