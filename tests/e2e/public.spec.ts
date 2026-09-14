import { expect, type Page, test } from '@playwright/test'
import { expectAccessible, expectNoSidewaysOverflow } from './helpers'

const THEMES = ['dark', 'light'] as const

const PAGES = [
	{ name: 'home', path: '/', status: 200 },
	{ name: 'case study', path: '/case-studies/this-site', status: 200 },
	{ name: 'not found', path: '/no-such-page', status: 404 }
]
const WIDTHS = [320, 390, 768, 1024, 1440]
const TEXT_ZOOM_WIDTHS = [320, 390, 1440]

test.beforeEach(async ({ page }) => {
	await page.route('**/api/event', (route) => route.fulfill({ status: 204 }))
})

for (const { name, path, status } of PAGES) {
	test.describe(`${name} page`, () => {
		for (const theme of THEMES) {
			test.describe(`in the ${theme} theme`, () => {
				test.use({ reducedMotion: 'reduce' })

				test('passes axe', async ({ page }) => {
					expect((await page.goto(path))?.status()).toBe(status)
					await page.emulateMedia({ colorScheme: theme })
					await expect(page.locator('html')).toHaveCSS('color-scheme', theme)
					await expectAccessible(page)
				})
			})
		}

		test('never scrolls sideways', async ({ page }) => {
			await page.goto(path)
			for (const width of WIDTHS) {
				await page.setViewportSize({ width, height: 900 })
				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - document.documentElement.clientWidth
				)
				expect(overflow, `${width}px`).toBeLessThanOrEqual(0)
			}
		})

		test('keeps everything inside the screen at 200% text', async ({ page }) => {
			await page.goto(path)
			await page.evaluate(() => {
				document.documentElement.style.fontSize = '200%'
			})
			for (const width of TEXT_ZOOM_WIDTHS) {
				await page.setViewportSize({ width, height: 900 })
				await expectNoSidewaysOverflow(page, `${width}px at 200% text`)
			}
		})

		test('loads without console errors', async ({ page }) => {
			const errors: string[] = []
			page.on('console', (message) => {
				if (message.type() === 'error' && message.location().url !== page.url()) errors.push(message.text())
			})
			page.on('pageerror', (error) => errors.push(error.message))
			await page.goto(path)
			await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
			await page.waitForLoadState('networkidle')
			expect(errors).toEqual([])
		})
	})
}

test('a visit sends a pageview beacon', async ({ page }) => {
	const beacon = page.waitForRequest('**/api/event')
	await page.goto('/case-studies/this-site')
	expect((await beacon).method()).toBe('POST')
})

test('the theme follows the system setting as it changes', async ({ page }) => {
	await page.goto('/')
	const root = page.locator('html')
	await page.emulateMedia({ colorScheme: 'dark' })
	await expect(root).toHaveCSS('color-scheme', 'dark')
	await page.emulateMedia({ colorScheme: 'light' })
	await expect(root).toHaveCSS('color-scheme', 'light')
})

test('the skip link is the first stop and lands on the content', async ({ page }) => {
	await page.goto('/')
	const first = page.locator('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').first()
	await expect(first).toHaveAccessibleName('Skip to content')
	await first.focus()
	await expect(first).toBeInViewport()
	await page.keyboard.press('Enter')
	await expect(page).toHaveURL(/#main-content$/)
})

test('the mobile menu closes on Escape and after choosing a section', async ({ page }) => {
	await page.goto('/')
	const menu = page.getByRole('button', { name: 'Menu' })
	test.skip(!(await menu.isVisible()), 'the menu only exists below the lg breakpoint')
	const navigation = page.getByRole('navigation', { name: 'Mobile' })

	await menu.click()
	await expect(navigation).toBeVisible()
	await expect(menu).toHaveAttribute('aria-expanded', 'true')
	await page.keyboard.press('Escape')
	await expect(navigation).toBeHidden()
	await expect(menu).toBeFocused()

	await menu.click()
	const link = navigation.getByRole('link').last()
	const target = await link.getAttribute('href')
	await link.click()
	await expect(navigation).toBeHidden()
	await expect(page).toHaveURL(new RegExp(`${target}$`))
})

test('the contact form explains every missing field before sending', async ({ page }) => {
	await page.goto('/#contact')
	await page.getByRole('button', { name: /Send message/ }).click()
	const name = page.getByLabel('Name', { exact: true })
	await expect(name).toHaveAttribute('aria-invalid', 'true')
	await expect(name).toBeFocused()
	await expect(page.getByRole('link', { name: 'Email', exact: true })).toHaveAttribute('href', '#field-email')
})

test('exhibit rows below the fold reveal as they scroll in', async ({ page }) => {
	await page.goto('/')
	const hidden = page.locator('[data-reveal]')
	await expect(hidden.first()).toBeAttached()
	const before = await hidden.count()
	await hidden.first().scrollIntoViewIfNeeded()
	await expect.poll(() => hidden.count()).toBeLessThan(before)
})

test('reduced motion shows every exhibit row at once', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' })
	await page.goto('/')
	await expect(page.locator('[data-reveal]')).toHaveCount(0)
})

async function studyPaths(page: Page) {
	await page.goto('/')
	return page
		.locator('a[href^="/case-studies/"]')
		.evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href') ?? ''))])
}

test('the first study is stamped one of many and has no previous neighbour', async ({ page }) => {
	const [first] = await studyPaths(page)
	await page.goto(first ?? '')
	await expect(page.getByText(/^Case study 1 \/ \d+/)).toBeVisible()
	await expect(page.getByText('Previous study', { exact: true })).toBeHidden()
	await expect(page.getByText('Next study', { exact: true })).toBeVisible()
})

test('a study shows its figures block only when it has figures', async ({ page }) => {
	for (const path of await studyPaths(page)) {
		await page.goto(path)
		const heading = page.getByRole('heading', { name: 'Figures', level: 2 })
		const rows = page.getByRole('button', { name: /^Enlarge image/ })
		if (await rows.count()) await expect(heading).toBeVisible()
		else await expect(heading).toBeHidden()
	}
})

test('the pager walks from one study to the next by title', async ({ page }) => {
	const [first] = await studyPaths(page)
	await page.goto(first ?? '')
	const next = page.getByText('Next study', { exact: true }).locator('xpath=following-sibling::a')
	const title = await next.textContent()
	const href = await next.getAttribute('href')
	await next.scrollIntoViewIfNeeded()
	await page.waitForLoadState('networkidle')
	await next.click()
	await page.waitForURL(`**${href}`)
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title ?? '')
	await expect(page.getByText('Previous study', { exact: true })).toBeVisible()
})

test('the gallery opens on the row that was clicked and walks the set', async ({ page }) => {
	for (const path of await studyPaths(page)) {
		await page.goto(path)
		const rows = page.getByRole('button', { name: /^Enlarge image/ })
		if ((await rows.count()) < 2) continue
		const second = rows.nth(1)
		await second.click()
		const dialog = page.getByRole('dialog')
		await expect(dialog).toBeVisible()
		const title = (await dialog.getAttribute('aria-label')) ?? ''
		expect(title).not.toBe('')
		await expect(second).toContainText(title)
		const shown = dialog.getByRole('img')
		const secondSource = await shown.getAttribute('src')
		await page.keyboard.press('ArrowRight')
		await expect(shown).not.toHaveAttribute('src', secondSource ?? '')
		await page.keyboard.press('ArrowLeft')
		await expect(shown).toHaveAttribute('src', secondSource ?? '')
		await page.keyboard.press('Escape')
		await expect(dialog).toBeHidden()
		return
	}
	test.skip(true, 'no seeded study has two figures')
})

test('a case study figure opens full size from storage and closes on Escape', async ({ page }) => {
	await page.goto('/case-studies/this-site')
	await page
		.getByRole('button', { name: /^Enlarge image/ })
		.first()
		.click()
	const dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await expect
		.poll(() => dialog.getByRole('img').evaluate((image: HTMLImageElement) => image.naturalWidth))
		.toBeGreaterThan(0)
	await page.keyboard.press('Escape')
	await expect(dialog).toBeHidden()
})
