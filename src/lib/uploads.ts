export const IMAGE_FORMATS = [
	{ type: 'image/png', extension: 'png' },
	{ type: 'image/jpeg', extension: 'jpg' },
	{ type: 'image/webp', extension: 'webp' },
	{ type: 'image/gif', extension: 'gif' },
	{ type: 'image/avif', extension: 'avif' }
] as const

export type ImageType = (typeof IMAGE_FORMATS)[number]['type']

export const IMAGE_ACCEPT = IMAGE_FORMATS.map((format) => format.type).join(',')

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

export const IMAGE_TOO_LARGE = `Image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)} MB.`
