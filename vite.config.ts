import path from 'node:path'
import { sveltekit } from '@sveltejs/kit/vite'
import { svelteTesting } from '@testing-library/svelte/vite'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import { defineConfig } from 'vitest/config'
import { databaseUrl } from './tests/setup/databases.ts'

export default defineConfig(({ mode }) => {
	// SvelteKit bakes $env/dynamic/private from process.env when the config loads, so this must run first.
	if (mode === 'test') {
		Object.assign(process.env, {
			DATABASE_URL: databaseUrl('_test'),
			APP_SECRET: 'test-app-secret-at-least-thirty-two-characters',
			ADMIN_EMAIL: 'first-admin@example.com',
			ADMIN_PASSWORD: 'first-admin-password'
		})
	}

	return {
		plugins: [
			vanillaExtractPlugin({
				identifiers: process.env.NODE_ENV === 'production' ? 'short' : 'debug'
			}),
			sveltekit()
		],
		resolve: {
			// Vanilla Extract compiles .css.ts in a child compiler that never sees SvelteKit's $lib alias.
			alias: {
				$lib: path.resolve('./src/lib')
			}
		},
		test: {
			coverage: {
				provider: 'v8',
				include: ['src/**/*.{ts,svelte}'],
				exclude: [
					'src/**/*.css.ts',
					'src/lib/styles/**',
					'src/**/*.test.ts',
					'src/**/*.d.ts',
					'src/**/index.ts',
					'src/app.html'
				],
				thresholds: {
					'src/**/*.ts': { lines: 100, functions: 100, statements: 99, branches: 90 }
				}
			},
			projects: [
				{
					extends: true,
					test: {
						name: 'unit',
						environment: 'node',
						include: ['src/**/*.test.ts'],
						exclude: ['src/**/*.dom.test.ts']
					}
				},
				{
					extends: true,
					plugins: [svelteTesting()],
					test: {
						name: 'component',
						environment: 'jsdom',
						include: ['src/**/*.dom.test.ts', 'tests/component/**/*.test.ts'],
						setupFiles: ['tests/setup/component.ts']
					}
				},
				{
					extends: true,
					test: {
						name: 'integration',
						environment: 'node',
						include: ['tests/integration/**/*.test.ts'],
						globalSetup: ['tests/setup/database.ts'],
						setupFiles: ['tests/setup/integration.ts'],
						fileParallelism: false
					}
				}
			]
		}
	}
})
