import { expect, test as setup } from '@playwright/test'
import { ADMIN_STATE } from './env'
import { signIn } from './helpers'

setup('sign in as the first admin', async ({ page }) => {
	await signIn(page)
	await expect(page).toHaveURL(/\/admin$/)
	await page.context().storageState({ path: ADMIN_STATE })
})
