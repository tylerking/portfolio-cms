import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'

type Suffix = '_test' | '_e2e'

export function databaseUrl(suffix: Suffix): string {
	const source = process.env.DATABASE_URL
	if (!source) throw new Error('Set DATABASE_URL so the test database can be derived from it')
	const url = new URL(source)
	if (!url.pathname.endsWith(suffix)) url.pathname = `${url.pathname}${suffix}`
	return url.toString()
}

export async function resetDatabase(connectionString: string): Promise<void> {
	const url = new URL(connectionString)
	const name = decodeURIComponent(url.pathname.slice(1))
	if (!/_(test|e2e)$/.test(name)) throw new Error(`Refusing to reset "${name}": its name must end in _test or _e2e`)

	const server = new URL(url)
	server.pathname = '/postgres'
	const admin = new pg.Client({ connectionString: server.toString() })
	await admin.connect()
	const found = await admin.query('select 1 from pg_database where datname = $1', [name])
	if (!found.rowCount) await admin.query(`create database "${name.replaceAll('"', '""')}"`)
	await admin.end()

	const pool = new pg.Pool({ connectionString })
	await pool.query('drop schema if exists drizzle cascade; drop schema public cascade; create schema public')
	await migrate(drizzle(pool), { migrationsFolder: 'drizzle' })
	await pool.end()
}
