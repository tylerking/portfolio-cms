import { randomBytes, scryptSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
	it('writes the colon format and verifies only the right password', async () => {
		const hash = await hashPassword('correct horse battery')
		expect(hash).toMatch(/^scrypt:17:8:1:[\w-]{22}:[\w-]{43}$/)
		await expect(verifyPassword('correct horse battery', hash)).resolves.toBe(true)
		await expect(verifyPassword('correct horse batterY', hash)).resolves.toBe(false)
	})

	it('salts every hash', async () => {
		expect(await hashPassword('same')).not.toBe(await hashPassword('same'))
	})

	it('verifies with the cost recorded in the stored hash', async () => {
		const salt = randomBytes(16)
		const key = scryptSync('older', salt, 32, { N: 2 ** 14, r: 8, p: 1 })
		const stored = ['scrypt', 14, 8, 1, salt.toString('base64url'), key.toString('base64url')].join(':')
		await expect(verifyPassword('older', stored)).resolves.toBe(true)
	})

	it.each(['plain text', 'scrypt:17:8:1:salt', '$scrypt$17$8$1$salt$hash'])(
		'rejects the malformed value %s',
		async (stored) => {
			await expect(verifyPassword('anything', stored)).resolves.toBe(false)
		}
	)
})
