import { randomUUID } from 'node:crypto'
import { isActionFailure, isRedirect, type RequestEvent, redirect } from '@sveltejs/kit'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { env } from '../env'
import { purgeTags } from '../http/cache'
import { hashPassword, verifyPassword } from './password'

export const LOGIN_PATH = '/admin/login'

async function ensureFirstAdmin(): Promise<void> {
	const admin = env.firstAdmin()
	if (!admin) return
	if (!admin.success) {
		console.error('ADMIN_EMAIL / ADMIN_PASSWORD are set but invalid; no admin was created.', admin.error.issues)
		return
	}
	if ((await db.$count(users)) > 0) return
	const passwordHash = await hashPassword(admin.data.password)
	await db.insert(users).values({ email: admin.data.email, passwordHash, role: 'admin' }).onConflictDoNothing()
}

// Unknown emails still pay for one scrypt run, so response time does not reveal which addresses exist.
let decoy: Promise<string> | undefined

function decoyHash(): Promise<string> {
	decoy ??= hashPassword(randomUUID())
	return decoy
}

async function findAdmin(email: string) {
	const [user] = await db
		.select({ id: users.id, hash: users.passwordHash })
		.from(users)
		.where(and(eq(users.email, email), eq(users.role, 'admin')))
		.limit(1)
	return user
}

export async function verifyLogin(
	email: string,
	password: string
): Promise<{ userId: number } | 'wrong' | 'unconfigured'> {
	let user = await findAdmin(email)
	if (!user && (await db.$count(users)) === 0) {
		await ensureFirstAdmin()
		user = await findAdmin(email)
	}
	if (!user) {
		await verifyPassword(password, await decoyHash())
		return (await db.$count(users)) > 0 ? 'wrong' : 'unconfigured'
	}
	return (await verifyPassword(password, user.hash)) ? { userId: user.id } : 'wrong'
}

export function requireAdmin({ locals, route }: Pick<RequestEvent, 'locals' | 'route'>): void {
	if (!locals.admin && route.id !== LOGIN_PATH) throw redirect(303, LOGIN_PATH)
}

async function purgeAfterSuccess<Result>(run: () => Promise<Result> | Result): Promise<Result> {
	try {
		const result = await run()
		if (!isActionFailure(result)) await purgeTags(['content'])
		return result
	} catch (error) {
		if (isRedirect(error)) await purgeTags(['content'])
		throw error
	}
}

type GuardedAction = (event: RequestEvent) => unknown

export function adminActions<ActionMap extends Record<string, (event: never) => unknown>>(
	actions: ActionMap
): ActionMap {
	const guarded = Object.entries(actions).map(([name, action]) => [
		name,
		(event: RequestEvent) => {
			requireAdmin(event)
			return purgeAfterSuccess(() => (action as GuardedAction)(event))
		}
	])
	return Object.fromEntries(guarded) as ActionMap
}
