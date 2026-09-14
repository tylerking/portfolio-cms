import { expect, test } from '@playwright/test'

// Smooth scrolling restarts on every scroll-into-view, so Playwright never sees the button settle.
test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' })

test('without JavaScript, a rejected field keeps its value and carries the error', async ({ page }) => {
	await page.goto('/#contact')
	await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace')
	await page.getByLabel('Email', { exact: true }).fill('not-an-email')
	await page.getByLabel('Message', { exact: true }).fill('Hello from a browser with scripts off.')
	await page.getByRole('button', { name: /Send message/ }).click()

	const email = page.getByLabel('Email', { exact: true })
	await expect(email).toHaveValue('not-an-email')
	await expect(email).toHaveAttribute('aria-invalid', 'true')
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Ada Lovelace')
})
