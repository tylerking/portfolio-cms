import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { getStore } from '@netlify/blobs'
import { dev } from '$app/environment'
import { IMAGE_FORMATS, IMAGE_TOO_LARGE, type ImageType, MAX_IMAGE_BYTES } from '$lib/uploads'
import { purgeTags } from '../http/cache'

const STORE = 'media'
const LOCAL_DIRECTORY = join(tmpdir(), 'portfolio-cms-media')
const SEED_DIRECTORY = resolve('scripts/seed-assets')
const SEED_PREFIX = 'seed-'

const codes = (text: string) => [...text].map((character) => character.charCodeAt(0))
const at = (data: Uint8Array, offset: number, expected: number[]) =>
	expected.every((byte, index) => data[offset + index] === byte)

const SIGNATURES: Record<ImageType, (data: Uint8Array) => boolean> = {
	'image/png': (data) => at(data, 0, [0x89, ...codes('PNG\r\n'), 0x1a, 0x0a]),
	'image/jpeg': (data) => at(data, 0, [0xff, 0xd8, 0xff]),
	'image/webp': (data) => at(data, 0, codes('RIFF')) && at(data, 8, codes('WEBP')),
	'image/gif': (data) => at(data, 0, codes('GIF8')),
	'image/avif': (data) => at(data, 4, codes('ftypavif')) || at(data, 4, codes('ftypavis'))
}

const IMAGE_KEY = new RegExp(`^[\\w-]+\\.(?:${IMAGE_FORMATS.map((format) => format.extension).join('|')})$`)
const sniff = (data: Uint8Array) => IMAGE_FORMATS.find((format) => SIGNATURES[format.type](data))
const isImageType = (type: string): type is ImageType => IMAGE_FORMATS.some((format) => format.type === type)

const onNetlify = () => !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT)
const useLocal = () => dev && !onNetlify()
const localPath = (key: string) => join(LOCAL_DIRECTORY, key)
const readablePath = (key: string) =>
	key.startsWith(SEED_PREFIX) ? join(SEED_DIRECTORY, key.slice(SEED_PREFIX.length)) : localPath(key)

async function putImage(key: string, data: ArrayBuffer, contentType: ImageType): Promise<void> {
	if (useLocal()) {
		await mkdir(LOCAL_DIRECTORY, { recursive: true })
		await writeFile(localPath(key), Buffer.from(data))
		return
	}
	await getStore(STORE).set(key, data, { metadata: { contentType } })
}

export async function getImage(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
	if (!IMAGE_KEY.test(key)) return null
	if (useLocal()) {
		const buffer = await readFile(readablePath(key)).catch(() => null)
		if (!buffer) return null
		const extension = key.split('.').pop()
		return {
			data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
			contentType: IMAGE_FORMATS.find((format) => format.extension === extension)?.type ?? 'application/octet-stream'
		}
	}
	const blob = await getStore(STORE).getWithMetadata(key, { type: 'arrayBuffer' })
	if (!blob) return null
	const stored = String(blob.metadata?.contentType ?? '')
	// Only ever serve back a known image type, never a user-influenced content type.
	return { data: blob.data, contentType: isImageType(stored) ? stored : 'application/octet-stream' }
}

async function deleteImage(key: string): Promise<void> {
	if (useLocal()) {
		// Seed keys resolve into the repo's seed assets; only uploads may be removed from disk.
		await rm(localPath(key), { force: true })
		return
	}
	await getStore(STORE).delete(key)
}

export async function deleteImages(keys: (string | null | undefined)[]): Promise<void> {
	const present = keys.filter((key): key is string => !!key)
	if (!present.length) return
	await Promise.all(
		present.map((key) =>
			deleteImage(key).catch((error: unknown) => console.error(`Could not delete media "${key}"`, error))
		)
	)
	await purgeTags(['media'])
}

export async function storeUpload(file: FormDataEntryValue | null): Promise<{ key: string } | { error: string }> {
	if (!(file instanceof File) || file.size === 0) return { error: 'Choose an image to upload.' }
	if (file.size > MAX_IMAGE_BYTES) return { error: IMAGE_TOO_LARGE }
	const data = await file.arrayBuffer()
	const format = sniff(new Uint8Array(data))
	if (!format) return { error: 'Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.' }
	const key = `${randomUUID()}.${format.extension}`
	await putImage(key, data, format.type)
	return { key }
}
