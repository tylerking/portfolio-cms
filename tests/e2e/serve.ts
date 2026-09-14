import { execFileSync, spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getStore } from '@netlify/blobs'
import { BlobsServer } from '@netlify/blobs/server'
import { IMAGE_FORMATS } from '../../src/lib/uploads'
import { databaseUrl, resetDatabase } from '../setup/databases'
import { ADMIN, PORT } from './env'

const SEED_DIRECTORY = 'scripts/seed-assets'

const database = databaseUrl('_e2e')
await resetDatabase(database)
execFileSync('pnpm', ['exec', 'tsx', 'scripts/seed.ts'], {
	stdio: 'inherit',
	env: { ...process.env, DATABASE_URL: database }
})

const blobs = { siteID: 'e2e', token: randomBytes(16).toString('hex') }
const emulator = new BlobsServer({ directory: mkdtempSync(join(tmpdir(), 'portfolio-blobs-')), token: blobs.token })
const context = { ...blobs, edgeURL: `http://localhost:${(await emulator.start()).port}` }

const store = getStore('media', context)
for (const name of readdirSync(SEED_DIRECTORY)) {
	const contentType = IMAGE_FORMATS.find((format) => name.endsWith(`.${format.extension}`))?.type
	await store.set(`seed-${name}`, new Blob([readFileSync(join(SEED_DIRECTORY, name))]), { metadata: { contentType } })
}

const preview = spawn('pnpm', ['exec', 'vite', 'preview', '--port', String(PORT), '--strictPort'], {
	stdio: 'inherit',
	env: {
		...process.env,
		DATABASE_URL: database,
		NETLIFY_BLOBS_CONTEXT: Buffer.from(JSON.stringify(context)).toString('base64'),
		APP_SECRET: randomBytes(48).toString('base64'),
		ADMIN_EMAIL: ADMIN.email,
		ADMIN_PASSWORD: ADMIN.password
	}
})

const stop = () => {
	preview.kill()
	void emulator.stop()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
preview.on('exit', (code) => process.exit(code ?? 0))
