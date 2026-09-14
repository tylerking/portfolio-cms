import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MAX_IMAGE_BYTES } from '$lib/uploads'

const store = vi.hoisted(() => ({
	set: vi.fn(),
	getWithMetadata: vi.fn(),
	delete: vi.fn()
}))
vi.mock('@netlify/blobs', () => ({ getStore: () => store }))

const { deleteImages, getImage, storeUpload } = await import('./blobs')

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]
const file = (bytes: number[], name = 'image.png', type = 'image/png') =>
	new File([new Uint8Array(bytes)], name, { type })

afterEach(() => {
	delete process.env.NETLIFY
	vi.clearAllMocks()
})

describe('storeUpload', () => {
	it.each([
		['nothing', null, 'Choose an image to upload.'],
		['a text field', 'hello', 'Choose an image to upload.'],
		['an empty file', file([]), 'Choose an image to upload.'],
		[
			'HTML renamed to .png',
			file([...new TextEncoder().encode('<html>')]),
			'Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.'
		]
	])('rejects %s', async (_case, value, error) => {
		await expect(storeUpload(value)).resolves.toEqual({ error })
	})

	it('rejects a file over the size limit before reading it', async () => {
		const huge = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'huge.png')
		await expect(storeUpload(huge)).resolves.toEqual({ error: 'Image must be under 4 MB.' })
	})

	it('stores by sniffed type under a random key, whatever the client claimed', async () => {
		const stored = await storeUpload(file(PNG, 'photo.gif', 'image/gif'))
		expect(stored).toEqual({ key: expect.stringMatching(/^[0-9a-f-]{36}\.png$/) })
		const key = 'key' in stored ? stored.key : ''
		const read = await getImage(key)
		expect(read?.contentType).toBe('image/png')
		expect(new Uint8Array(read?.data ?? new ArrayBuffer(0))).toEqual(new Uint8Array(PNG))
	})
})

describe('getImage', () => {
	it.each(['../.env', 'nested/key.png', 'key.svg', 'key'])('refuses the key %s', async (key) => {
		await expect(getImage(key)).resolves.toBeNull()
	})

	it('returns null for a missing image', async () => {
		await expect(getImage('missing.png')).resolves.toBeNull()
	})

	it('serves a seed key straight from the seed assets', async () => {
		const read = await getImage('seed-fogline.png')
		expect(read?.contentType).toBe('image/png')
		expect(new Uint8Array(read?.data ?? new ArrayBuffer(0))).toEqual(
			new Uint8Array(readFileSync('scripts/seed-assets/fogline.png'))
		)
	})
})

describe('deleteImages', () => {
	it('removes stored images and skips empty keys', async () => {
		const stored = await storeUpload(file(PNG))
		const key = 'key' in stored ? stored.key : ''
		await deleteImages([key, null, undefined])
		await expect(getImage(key)).resolves.toBeNull()
	})

	it('never removes a seed asset', async () => {
		await deleteImages(['seed-fogline.png'])
		await expect(getImage('seed-fogline.png')).resolves.not.toBeNull()
	})
})

describe('on Netlify', () => {
	it('stores, reads and deletes through the blob store', async () => {
		process.env.NETLIFY = 'true'
		const stored = await storeUpload(file(PNG))
		const key = 'key' in stored ? stored.key : ''
		expect(store.set).toHaveBeenCalledWith(key, expect.any(ArrayBuffer), { metadata: { contentType: 'image/png' } })

		store.getWithMetadata.mockResolvedValueOnce({ data: new ArrayBuffer(1), metadata: { contentType: 'image/png' } })
		await expect(getImage(key)).resolves.toMatchObject({ contentType: 'image/png' })

		await deleteImages([key])
		expect(store.delete).toHaveBeenCalledWith(key)
	})

	it('never serves back a stored type that is not an image', async () => {
		process.env.NETLIFY = 'true'
		store.getWithMetadata.mockResolvedValueOnce({ data: new ArrayBuffer(1), metadata: { contentType: 'text/html' } })
		await expect(getImage('a.png')).resolves.toMatchObject({ contentType: 'application/octet-stream' })
		store.getWithMetadata.mockResolvedValueOnce(null)
		await expect(getImage('b.png')).resolves.toBeNull()
	})

	it('logs a failed delete instead of failing the request', async () => {
		process.env.NETLIFY = 'true'
		const log = vi.spyOn(console, 'error').mockImplementation(() => {})
		store.delete.mockRejectedValueOnce(new Error('gone'))
		await expect(deleteImages(['a.png'])).resolves.toBeUndefined()
		expect(log).toHaveBeenCalledWith('Could not delete media "a.png"', expect.any(Error))
		log.mockRestore()
	})
})
