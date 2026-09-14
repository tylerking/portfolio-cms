import { eq, sql } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { db } from '$lib/server/db'
import { exhibits, messages, saveSiteSettings, skillGroups } from '$lib/server/db/collections'
import * as tables from '$lib/server/db/schema'
import { insertExhibit, insertMessage, insertSkill } from '../helpers/factories'

describe('collection store', () => {
	it('lists by sort order and reads single rows', async () => {
		const second = await insertSkill({ title: 'B', sort: 1 })
		const first = await insertSkill({ title: 'A', sort: 0 })
		expect((await skillGroups.list()).map((row) => row.title)).toEqual(['A', 'B'])
		expect(await skillGroups.get(second.id)).toMatchObject({ title: 'B' })
		expect(await skillGroups.get(9999)).toBeNull()
		expect(await skillGroups.count()).toBe(2)
		expect(first.id).not.toBe(second.id)
	})

	it('puts new rows after the last one', async () => {
		expect(await skillGroups.nextSort()).toBe(0)
		await insertSkill({ sort: 4 })
		expect(await skillGroups.nextSort()).toBe(5)
	})

	it('creates, updates and removes rows', async () => {
		const id = await skillGroups.create({ title: 'New', description: 'x', sort: 0 })
		await skillGroups.update(id, { title: 'Renamed' })
		expect(await skillGroups.get(id)).toMatchObject({ title: 'Renamed' })
		await skillGroups.remove(id)
		expect(await skillGroups.get(id)).toBeNull()
	})

	it('stamps updatedAt on tables that track it', async () => {
		const exhibit = await insertExhibit()
		await db
			.update(tables.exhibits)
			.set({ updatedAt: sql`now() - interval '1 day'` })
			.where(eq(tables.exhibits.id, exhibit.id))
		await exhibits.update(exhibit.id, { title: 'Edited' })
		const edited = await exhibits.get(exhibit.id)
		expect(edited?.updatedAt.getTime()).toBeGreaterThan(Date.now() - 60_000)
	})
})

describe('reorder', () => {
	it('applies an order that names every row exactly once', async () => {
		const first = await insertSkill({ title: 'A', sort: 0 })
		const second = await insertSkill({ title: 'B', sort: 1 })
		const third = await insertSkill({ title: 'C', sort: 2 })
		expect(await skillGroups.reorder([third.id, first.id, second.id])).toBe(true)
		expect((await skillGroups.list()).map((row) => row.title)).toEqual(['C', 'A', 'B'])
	})

	it.each([
		['a missing row', (ids: number[]) => ids.slice(1)],
		['a duplicate', (ids: number[]) => [ids[0] ?? 0, ids[0] ?? 0, ids[1] ?? 0]],
		['an unknown id', (ids: number[]) => [...ids.slice(1), 9999]]
	])('rejects %s and leaves the order alone', async (_case, mangle) => {
		const rows = [
			await insertSkill({ title: 'A', sort: 0 }),
			await insertSkill({ title: 'B', sort: 1 }),
			await insertSkill({ title: 'C', sort: 2 })
		]
		expect(await skillGroups.reorder(mangle(rows.map((row) => row.id)))).toBe(false)
		expect((await skillGroups.list()).map((row) => row.title)).toEqual(['A', 'B', 'C'])
	})
})

describe('messages and singletons', () => {
	it('lists messages newest first and updates their status', async () => {
		await insertMessage({ name: 'Old', createdAt: new Date(Date.now() - 60_000) })
		const fresh = await insertMessage({ name: 'New' })
		expect((await messages.list()).map((row) => row.name)).toEqual(['New', 'Old'])
		await messages.update(fresh.id, { status: 'replied' })
		expect((await messages.list())[0]?.status).toBe('replied')
		await messages.remove(fresh.id)
		expect(await messages.list()).toHaveLength(1)
	})

	it('keeps a singleton to one row across saves', async () => {
		await saveSiteSettings({ name: 'First' })
		await saveSiteSettings({ name: 'Second' })
		const rows = await db.select().from(tables.siteSettings)
		expect(rows).toHaveLength(1)
		expect(rows[0]?.name).toBe('Second')
	})
})
