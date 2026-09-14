import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { asc, desc, eq, sql } from 'drizzle-orm'
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core'
import { db } from './'
import * as tables from './schema'

// Drizzle's insert and update types do not survive a generic table parameter, so the casts stay inside these factories.
type Keyed = PgTable & { id: PgColumn; sort: PgColumn }

function collection<Table extends PgTable>(table: Table, options: { touchesUpdatedAt?: boolean } = {}) {
	type Row = InferSelectModel<Table>
	type Insert = InferInsertModel<Table>
	const keyed = table as unknown as Keyed
	return {
		list: () => db.select().from(keyed).orderBy(asc(keyed.sort)) as unknown as Promise<Row[]>,
		get: async (id: number): Promise<Row | null> => {
			const rows = await db.select().from(keyed).where(eq(keyed.id, id)).limit(1)
			return (rows[0] as Row) ?? null
		},
		count: () => db.$count(keyed),
		nextSort: async (): Promise<number> => {
			const [row] = await db.select({ next: sql<number>`coalesce(max(${keyed.sort}), -1) + 1` }).from(keyed)
			return Number(row?.next ?? 0)
		},
		create: async (data: Insert): Promise<number> => {
			const [row] = await db
				.insert(keyed)
				.values(data as never)
				.returning({ id: keyed.id })
			if (!row) throw new Error('Insert returned no row')
			return row.id as number
		},
		update: (id: number, data: Partial<Insert>) =>
			db
				.update(keyed)
				.set((options.touchesUpdatedAt ? { ...data, updatedAt: new Date() } : data) as never)
				.where(eq(keyed.id, id)),
		remove: (id: number) => db.delete(keyed).where(eq(keyed.id, id)),
		reorder: (ids: number[]) =>
			db.transaction(async (transaction) => {
				const existing = new Set(
					(await transaction.select({ id: keyed.id }).from(keyed)).map((row) => row.id as number)
				)
				const exact = new Set(ids).size === ids.length && ids.length === existing.size
				if (!exact || !ids.every((id) => existing.has(id))) return false
				for (const [sort, id] of ids.entries()) {
					await transaction
						.update(keyed)
						.set({ sort } as never)
						.where(eq(keyed.id, id))
				}
				return true
			})
	}
}

export const skillGroups = collection(tables.skillGroups)
export const approachSteps = collection(tables.approachSteps)
export const projects = collection(tables.projects)
export const exhibits = collection(tables.exhibits, { touchesUpdatedAt: true })
export const caseStudies = collection(tables.caseStudies, { touchesUpdatedAt: true })

export const messages = {
	list: () => db.select().from(tables.messages).orderBy(desc(tables.messages.createdAt)),
	create: (data: typeof tables.messages.$inferInsert) => db.insert(tables.messages).values(data),
	update: (id: number, data: Partial<typeof tables.messages.$inferInsert>) =>
		db.update(tables.messages).set(data).where(eq(tables.messages.id, id)),
	remove: (id: number) => db.delete(tables.messages).where(eq(tables.messages.id, id))
}

export const events = {
	create: (data: typeof tables.events.$inferInsert) => db.insert(tables.events).values(data)
}

function singleton<Table extends PgTable>(table: Table) {
	const keyed = table as unknown as PgTable & { id: PgColumn }
	return async (data: Partial<InferInsertModel<Table>>) => {
		const [existing] = await db.select({ id: keyed.id }).from(keyed).limit(1)
		if (existing)
			await db
				.update(keyed)
				.set(data as never)
				.where(eq(keyed.id, existing.id))
		else await db.insert(keyed).values(data as never)
	}
}

export const saveSiteSettings = singleton(tables.siteSettings)
export const saveHomeContent = singleton(tables.homeContent)
