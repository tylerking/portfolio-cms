import { expect, test } from '@playwright/test'
import { ADMIN_NAVIGATION } from '../../src/lib/components/admin/navigation'
import { ADMIN_STATE, BASE_URL } from './env'
import { expectAccessible, expectNoSidewaysOverflow, repeatedControlNames, signIn } from './helpers'

test.use({ storageState: ADMIN_STATE })

for (const { href, label } of ADMIN_NAVIGATION.flatMap((group) => group.links)) {
	for (const theme of ['dark', 'light'] as const) {
		test(`${label} passes axe in the ${theme} theme`, async ({ page }) => {
			await page.emulateMedia({ colorScheme: theme })
			await page.goto(href)
			await expect(page.locator('html')).toHaveCSS('color-scheme', theme)
			await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page')
			await expectAccessible(page)
		})
	}

	test(`${label} keeps everything inside the screen on a phone at 200% text`, async ({ page }) => {
		await page.goto(href)
		await page.evaluate(() => {
			document.documentElement.style.fontSize = '200%'
		})
		for (const width of [320, 390]) {
			await page.setViewportSize({ width, height: 900 })
			await expectNoSidewaysOverflow(page, `${width}px at 200% text`)
		}
	})

	test(`${label} gives every repeated control a distinct name`, async ({ page }) => {
		await page.goto(href)
		expect(await repeatedControlNames(page)).toEqual([])
	})
}

test('an edit to the hero copy goes live on the site', async ({ page }) => {
	const save = async (text: string) => {
		await page.goto('/admin/home')
		await page.getByLabel('Hero lead').fill(text)
		await page.getByRole('button', { name: 'Save Home' }).click()
		await expect(page.getByText('Saved.', { exact: true })).toBeVisible()
	}
	await page.goto('/admin/home')
	const original = await page.getByLabel('Hero lead').inputValue()
	const edited = `Hero copy edited at ${Date.now()}`

	await save(edited)
	await page.goto('/')
	await expect(page.getByText(edited)).toBeVisible()
	await save(original)
})

test('a case study goes from draft to published to deleted', async ({ page, request }) => {
	const status = async (slug: string) => (await request.get(`/case-studies/${slug}`)).status()
	await page.goto('/admin/case-studies')
	await page.getByLabel('Title', { exact: true }).fill(`Draft study ${Date.now()}`)
	await page.getByRole('button', { name: 'Create Case Study' }).click()
	await expect(page.locator('#admin-main').getByText(/^Created\./)).toBeVisible()
	await expect(page.getByRole('status').filter({ hasText: /^Created\./ })).toBeAttached()
	const slug = await page.getByLabel('Slug', { exact: true }).inputValue()
	expect(await status(slug)).toBe(404)

	await page.getByLabel('Year').fill('2026')
	await page.getByLabel('Published').check()
	await page.getByRole('button', { name: 'Save Details' }).click()
	await expect(page.getByText('Saved.', { exact: true })).toBeVisible()
	expect(await status(slug)).toBe(200)

	await page.getByRole('button', { name: 'Delete this case study' }).click()
	await page.getByRole('button', { name: 'Yes, delete it: Delete this case study' }).click()
	await expect(page).toHaveURL(/\/admin\/case-studies$/)
	expect(await status(slug)).toBe(404)
})

test('a cover uploads to blob storage and is served back, and a disguised file is refused', async ({
	page,
	request
}) => {
	await page.goto('/admin/projects')
	const form = page.locator('form[action="?/update"]').first()
	const thumbnail = page.locator('img[src^="/media/"]').first()
	const before = await thumbnail.getAttribute('src')

	await form.locator('input[type="file"]').setInputFiles('scripts/seed-assets/fogline.png')
	await form.getByRole('button', { name: 'Upload' }).click()
	await expect(thumbnail).not.toHaveAttribute('src', before ?? '')
	const image = await request.get((await thumbnail.getAttribute('src')) ?? '')
	expect(image.headers()['content-type']).toBe('image/png')

	await form
		.locator('input[type="file"]')
		.setInputFiles({ name: 'page.png', mimeType: 'image/png', buffer: Buffer.from('<html></html>') })
	await form.getByRole('button', { name: 'Upload' }).click()
	await expect(form.getByText('Only PNG, JPEG, WebP, GIF, or AVIF images are allowed.')).toBeVisible()
})

test('a message from the site lands in the inbox and can be triaged', async ({ page }) => {
	const name = `Lead ${Date.now()}`
	await page.goto('/#contact')
	await page.getByLabel('Name', { exact: true }).fill(name)
	await page.getByLabel('Email', { exact: true }).fill('lead@example.com')
	await page.getByLabel('Message', { exact: true }).fill('Can we talk about a project?')
	await page.getByRole('button', { name: /Send message/ }).click()
	await expect(page.getByText('Thanks. I reply within two working days.')).toBeVisible()

	await page.goto('/admin/leads')
	await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible()
	const card = page
		.locator('div')
		.filter({ has: page.getByText(name, { exact: true }) })
		.filter({ has: page.locator('form[action="?/setStatus"]') })
		.last()
	const status = card.getByRole('combobox', { name: `Status for ${name}`, exact: true })
	await status.selectOption('replied')
	await card.getByRole('button', { name: `Save status for ${name}`, exact: true }).click()
	await expect(status).toHaveValue('replied')
})

test.describe('signing in and out', () => {
	test.use({ storageState: { cookies: [], origins: [] } })

	test('a wrong password is refused on the field', async ({ page }) => {
		await signIn(page, 'not-the-password')
		await expect(page.getByLabel('Password')).toHaveAccessibleDescription('Incorrect email or password.')
	})

	test('signing out revokes the old session cookie', async ({ page, browser }) => {
		await signIn(page)
		await expect(page).toHaveURL(/\/admin$/)
		const cookies = await page.context().cookies()
		await page.getByRole('button', { name: 'Sign out', exact: true }).click()
		await expect(page).toHaveURL(/\/admin\/login$/)

		const replay = await browser.newContext({ baseURL: BASE_URL })
		await replay.addCookies(cookies)
		const stale = await replay.newPage()
		await stale.goto('/admin')
		await expect(stale).toHaveURL(/\/admin\/login$/)
		await replay.close()
	})
})
