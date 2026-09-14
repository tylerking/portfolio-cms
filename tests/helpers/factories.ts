import { hashPassword } from '$lib/server/auth/password'
import { SESSION_COOKIE, startSession } from '$lib/server/auth/sessions'
import { db } from '$lib/server/db'
import * as tables from '$lib/server/db/schema'
import { cookieJar } from './cookies'

export const PASSWORD = 'correct-horse-battery'

export function onlyRow<Row>(rows: Row[]): Row {
	const [row] = rows
	if (!row) throw new Error('Expected a row')
	return row
}

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])
export const pngFile = (name = 'image.png') => new File([PNG], name, { type: 'image/png' })

export async function createUser(email = 'admin@example.com', password = PASSWORD) {
	const passwordHash = await hashPassword(password)
	return onlyRow(await db.insert(tables.users).values({ email, passwordHash }).returning())
}

export async function signedIn(userId?: number) {
	const id = userId ?? (await createUser()).id
	const { cookies, jar } = cookieJar()
	await startSession(cookies, id)
	const token = jar.get(SESSION_COOKIE)?.value
	if (!token) throw new Error('No session cookie was set')
	return { userId: id, token, cookies: { [SESSION_COOKIE]: token } }
}

export const insertCase = async (values: Partial<typeof tables.caseStudies.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.caseStudies)
			.values({ slug: 'case', title: 'Case', published: true, sort: 0, ...values })
			.returning()
	)

export const insertExhibit = async (values: Partial<typeof tables.exhibits.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.exhibits)
			.values({ slug: 'exhibit', title: 'Exhibit', published: true, sort: 0, ...values })
			.returning()
	)

export const insertProject = async (values: Partial<typeof tables.projects.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.projects)
			.values({ title: 'Project', sort: 0, ...values })
			.returning()
	)

export const insertSkill = async (values: Partial<typeof tables.skillGroups.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.skillGroups)
			.values({ title: 'Skill', description: 'Things', sort: 0, ...values })
			.returning()
	)

export const insertStep = async (values: Partial<typeof tables.approachSteps.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.approachSteps)
			.values({ title: 'Step', description: 'Body', sort: 0, ...values })
			.returning()
	)

export const insertMessage = async (values: Partial<typeof tables.messages.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.messages)
			.values({ name: 'Ada', email: 'ada@example.com', message: 'Hello', ...values })
			.returning()
	)

export const insertEvent = async (values: Partial<typeof tables.events.$inferInsert> = {}) =>
	onlyRow(
		await db
			.insert(tables.events)
			.values({ type: 'pageview', path: '/', ...values })
			.returning()
	)
