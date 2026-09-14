import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaUrl, picture } from './media'

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('picture', () => {
	it('serves the stored original where there is no image CDN', () => {
		vi.stubEnv('VITE_IMAGE_CDN', '')
		expect(picture('cover.png', 1280)).toEqual({ src: '/media/cover.png', href: '/media/cover.png' })
	})

	it('offers resized widths up to the largest the slot needs, and keeps the original for links', () => {
		vi.stubEnv('VITE_IMAGE_CDN', 'true')
		const image = picture('cover.png', 960)
		const at = (width: number) => `/.netlify/images?url=%2Fmedia%2Fcover.png&w=${width}`
		expect(image.href).toBe('/media/cover.png')
		expect(image.src).toBe(at(960))
		expect(image.srcset).toBe(`${at(320)} 320w, ${at(640)} 640w, ${at(960)} 960w`)
	})

	it('allows a largest width between the standard steps', () => {
		vi.stubEnv('VITE_IMAGE_CDN', 'true')
		expect(picture('thumbnail.png', 400).srcset).toMatch(/w=320 320w, .*w=400 400w$/)
	})
})

describe('mediaUrl', () => {
	it('points at the media route', () => {
		expect(mediaUrl('a.webp')).toBe('/media/a.webp')
	})
})
