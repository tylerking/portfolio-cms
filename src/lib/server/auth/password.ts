import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

type Cost = { costExponent: number; blockSize: number; parallelization: number }

const COST: Cost = { costExponent: 17, blockSize: 8, parallelization: 1 }
const KEY_BYTES = 32
const MAX_MEMORY = 256 * 1024 * 1024
// Colon-separated, never PHC-style `$`: Vite expands $NAME inside .env values and would corrupt the hash.
const FORMAT = /^scrypt:(\d+):(\d+):(\d+):([\w-]+):([\w-]+)$/

function derive(password: string, salt: Buffer, length: number, cost: Cost): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(
			password,
			salt,
			length,
			{ N: 2 ** cost.costExponent, r: cost.blockSize, p: cost.parallelization, maxmem: MAX_MEMORY },
			(error, key) => (error ? reject(error) : resolve(key))
		)
	})
}

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16)
	const key = await derive(password, salt, KEY_BYTES, COST)
	return [
		'scrypt',
		COST.costExponent,
		COST.blockSize,
		COST.parallelization,
		salt.toString('base64url'),
		key.toString('base64url')
	].join(':')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [, costExponent = '', blockSize = '', parallelization = '', salt = '', hash = ''] = FORMAT.exec(stored) ?? []
	if (!hash) return false
	const expected = Buffer.from(hash, 'base64url')
	const cost = {
		costExponent: Number(costExponent),
		blockSize: Number(blockSize),
		parallelization: Number(parallelization)
	}
	const actual = await derive(password, Buffer.from(salt, 'base64url'), expected.length, cost)
	return timingSafeEqual(actual, expected)
}
