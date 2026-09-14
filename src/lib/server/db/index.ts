import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { env } from '../env'
import * as schema from './schema'

type Database = NodePgDatabase<typeof schema>

let instance: Database | null = null

function connect(): Database {
	if (!instance) {
		const url = env.databaseUrl()
		if (!url.success) throw new Error('DATABASE_URL is not set')
		const pool = new pg.Pool({
			connectionString: url.data,
			max: 5,
			idleTimeoutMillis: 10_000,
			connectionTimeoutMillis: 5_000
		})
		instance = drizzle(pool, { schema })
	}
	return instance
}

export const db = new Proxy({} as Database, {
	get(_target, property) {
		const real = connect() as unknown as Record<string | symbol, unknown>
		const value = real[property]
		return typeof value === 'function' ? value.bind(real) : value
	}
})
