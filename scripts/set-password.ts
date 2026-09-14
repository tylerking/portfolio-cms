import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { hashPassword } from '../src/lib/server/auth/password'
import * as tables from '../src/lib/server/db/schema'

const MIN_LENGTH = 12
const CONTROL_C = String.fromCharCode(3)
const BACKSPACE = String.fromCharCode(127)

async function readPassword(): Promise<string> {
	if (!process.stdin.isTTY) {
		let piped = ''
		for await (const chunk of process.stdin) piped += chunk
		return piped.replace(/\r?\n$/, '')
	}
	process.stdout.write('New password: ')
	process.stdin.setRawMode(true)
	let typed = ''
	for await (const chunk of process.stdin) {
		for (const character of String(chunk)) {
			if (character === CONTROL_C) process.exit(130)
			if (character === '\r' || character === '\n') {
				process.stdin.setRawMode(false)
				process.stdout.write('\n')
				return typed
			}
			typed = character === BACKSPACE ? typed.slice(0, -1) : typed + character
		}
	}
	return typed
}

const url = process.env.DATABASE_URL
if (!url) throw new Error('Set DATABASE_URL first')

const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
if (!email) throw new Error('Usage: pnpm set-password <email>')

const password = await readPassword()
if (password.length < MIN_LENGTH) throw new Error(`Use at least ${MIN_LENGTH} characters.`)
const passwordHash = await hashPassword(password)

const pool = new pg.Pool({ connectionString: url })
try {
	const updated = await drizzle(pool).transaction(async (transaction) => {
		const [user] = await transaction
			.update(tables.users)
			.set({ passwordHash, updatedAt: new Date() })
			.where(eq(tables.users.email, email))
			.returning({ id: tables.users.id })
		if (user) await transaction.delete(tables.sessions).where(eq(tables.sessions.userId, user.id))
		return !!user
	})
	if (!updated) throw new Error(`No user with the email ${email} on ${new URL(url).hostname}.`)
	console.log(`Password set for ${email} on ${new URL(url).hostname}; that user's sessions are signed out.`)
} finally {
	await pool.end()
}
