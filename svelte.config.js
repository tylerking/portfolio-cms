import adapter from '@sveltejs/adapter-netlify'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').KitConfig['csp']} */
const csp = {
	mode: 'hash',
	directives: {
		'default-src': ['self'],
		'script-src': ['self'],
		// 'unsafe-inline' stays for styles: inline style="" attributes cannot be hashed or nonced.
		'style-src': ['self', 'unsafe-inline'],
		'font-src': ['self'],
		'img-src': ['self', 'data:'],
		'connect-src': ['self'],
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
		inlineStyleThreshold: 4096,
		typescript: {
			config: (config) => ({ ...config, include: [...config.include, '../*.ts', '../*.js', '../scripts/**/*.ts'] })
		}
	}
}

export default config
