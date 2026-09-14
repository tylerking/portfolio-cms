import adapter from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').KitConfig['csp']} */
const csp = {
	mode: 'hash',
	directives: {
		'default-src': ['self'],
		'script-src': ['self', 'https://www.googletagmanager.com'],
		// 'unsafe-inline' stays for styles: inline style="" attributes cannot be hashed or nonced.
		'style-src': ['self', 'unsafe-inline'],
		'font-src': ['self'],
		'img-src': ['self', 'data:', 'https://*.google-analytics.com', 'https://*.googletagmanager.com'],
		'connect-src': [
			'self',
			'https://*.google-analytics.com',
			'https://*.analytics.google.com',
			'https://*.googletagmanager.com'
		],
		'frame-src': ['https://www.googletagmanager.com'],
		'base-uri': ['self'],
		'form-action': ['self'],
		'frame-ancestors': ['none'],
		'object-src': ['none']
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csp,
		inlineStyleThreshold: 13000,
		typescript: {
			config: (config) => ({ ...config, include: [...config.include, '../*.ts', '../*.js', '../scripts/**/*.ts'] })
		}
	}
}

export default config
