import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { sand, slate } from './tokens'

const page = readFileSync(new URL('../../error.html', import.meta.url), 'utf8')

const block = (selector: string) => {
	const start = page.indexOf(`${selector} {`)
	expect(start).toBeGreaterThan(-1)
	return page.slice(start, page.indexOf('}', start))
}

describe('the static error page', () => {
	it.each([
		[':root', slate[950], slate[150]],
		['@media (prefers-color-scheme: light)', sand[100], slate[850]]
	])('%s repeats the theme background and foreground', (selector, background, foreground) => {
		expect(block(selector)).toContain(`--background: ${background};`)
		expect(block(selector)).toContain(`--foreground: ${foreground};`)
	})

	it.each([
		['dark', slate[950]],
		['light', sand[100]]
	])('colours the %s browser chrome with the theme background', (scheme, background) => {
		expect(page).toContain(
			`<meta name='theme-color' content='${background}' media='(prefers-color-scheme: ${scheme})' />`
		)
	})
})
