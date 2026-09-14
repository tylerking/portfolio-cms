import { sql } from 'drizzle-orm'
import { beforeEach } from 'vitest'
import { db } from '$lib/server/db'

const tables = await db.execute<{ tablename: string }>(sql`select tablename from pg_tables where schemaname = 'public'`)
const everyTable = sql.raw(tables.rows.map((row) => `"${row.tablename}"`).join(', '))

beforeEach(async () => {
	await db.execute(sql`truncate table ${everyTable} restart identity cascade`)
})
