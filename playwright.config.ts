import { defineConfig, devices } from '@playwright/test'
import { BASE_URL } from './tests/e2e/env'

const CI = !!process.env.CI
const PUBLIC = /public\.spec\.ts/

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: CI,
	retries: CI ? 2 : 0,
	workers: CI ? 2 : undefined,
	reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
	webServer: {
		command: 'tsx tests/e2e/serve.ts',
		url: BASE_URL,
		reuseExistingServer: false,
		timeout: 120_000
	},
	projects: [
		{ name: 'setup', testMatch: /\.setup\.ts/, use: devices['Desktop Chrome'] },
		{ name: 'chromium', use: devices['Desktop Chrome'], dependencies: ['setup'] },
		{ name: 'firefox', testMatch: PUBLIC, use: devices['Desktop Firefox'] },
		{ name: 'webkit', testMatch: PUBLIC, use: devices['Desktop Safari'] },
		{ name: 'pixel-7', testMatch: PUBLIC, use: devices['Pixel 7'] },
		{ name: 'iphone-14', testMatch: PUBLIC, use: devices['iPhone 14'] }
	]
})
