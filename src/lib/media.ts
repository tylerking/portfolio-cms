const WIDTHS = [320, 640, 960, 1280, 1920] as const

export interface Picture {
	src: string
	srcset?: string
	href: string
}

export const mediaUrl = (key: string) => `/media/${key}`

const resized = (key: string, width: number) => `/.netlify/images?url=${encodeURIComponent(mediaUrl(key))}&w=${width}`

export function picture(key: string, largest: number): Picture {
	const href = mediaUrl(key)
	if (import.meta.env.VITE_IMAGE_CDN !== 'true') return { src: href, href }
	const widths = WIDTHS.filter((width) => width < largest)
	return {
		href,
		src: resized(key, largest),
		srcset: [...widths, largest].map((width) => `${resized(key, width)} ${width}w`).join(', ')
	}
}
