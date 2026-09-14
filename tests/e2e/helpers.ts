import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import { ADMIN } from './env'

const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

export async function expectAccessible(page: Page) {
	// Axe samples colours mid-transition, so a fade-in reads as a contrast failure until it settles.
	await page.evaluate(() =>
		Promise.allSettled(
			document
				.getAnimations()
				.filter((animation) => animation.effect?.getTiming().iterations !== Number.POSITIVE_INFINITY)
				.map((animation) => animation.finished)
		)
	)
	const { violations } = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze()
	expect(violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual(
		[]
	)
}

export async function expectNoSidewaysOverflow(page: Page, context: string) {
	const found = await page.evaluate(() => {
		const width = document.documentElement.clientWidth
		const visuallyHidden = (element: Element) => {
			for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
				const box = node.getBoundingClientRect()
				if ((box.width <= 1 && box.height <= 1) || getComputedStyle(node).clipPath !== 'none') return true
			}
			return false
		}
		const blockAround = (element: Element) => {
			let node: Element | null = element
			while (node && ['inline', 'contents'].includes(getComputedStyle(node).display)) node = node.parentElement
			return node ?? document.body
		}
		const problems: string[] = []
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
		for (let node = walker.nextNode(); node; node = walker.nextNode()) {
			const text = node.textContent?.trim() ?? ''
			const parent = node.parentElement
			if (!text || !parent || visuallyHidden(parent)) continue
			const range = document.createRange()
			range.selectNodeContents(node)
			const glyphs = range.getBoundingClientRect()
			if (glyphs.width === 0) continue
			const box = blockAround(parent).getBoundingClientRect()
			if (glyphs.right > width + 1) problems.push(`past the viewport: "${text.slice(0, 40)}"`)
			else if (glyphs.right > box.right + 1 || glyphs.left < box.left - 1)
				problems.push(`past its box: "${text.slice(0, 40)}"`)
		}
		return problems
	})
	expect(found, context).toEqual([])
}

export async function repeatedControlNames(page: Page) {
	const snapshot = await page.locator('main').ariaSnapshot()
	const INTERACTIVE = new Set(['button', 'textbox', 'combobox', 'checkbox', 'radio', 'slider', 'spinbutton'])
	const stack: { depth: number; name: string }[] = []
	const seen = new Map<string, number>()
	for (const line of snapshot.split('\n')) {
		const match = line.match(/^(\s*)- (\w+)(?: "((?:[^"\\]|\\.)*)")?/)
		if (!match) continue
		const depth = match[1]?.length ?? 0
		const role = match[2] ?? ''
		const name = match[3] ?? ''
		while (stack.length && (stack.at(-1)?.depth ?? 0) >= depth) stack.pop()
		if (role === 'group') stack.push({ depth, name })
		if (!INTERACTIVE.has(role)) continue
		const path = [...stack.map((group) => group.name), `${role} "${name}"`].join(' › ')
		seen.set(path, (seen.get(path) ?? 0) + 1)
	}
	return [...seen].filter(([, count]) => count > 1).map(([path, count]) => `${path} ×${count}`)
}

export async function signIn(page: Page, password = ADMIN.password) {
	await page.goto('/admin/login')
	await page.getByLabel('Email').fill(ADMIN.email)
	await page.getByLabel('Password').fill(password)
	await page.getByRole('button', { name: 'Sign in' }).click()
}
