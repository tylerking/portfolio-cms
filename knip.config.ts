import type { KnipConfig } from 'knip'
import { compile, parse } from 'svelte/compiler'

export default {
	entry: ['tests/e2e/serve.ts', 'tests/e2e/*.setup.ts', 'static/gtm.js'],
	compilers: {
		svelte: (text: string, filename: string) => {
			const ast = parse(text, { modern: true })
			const scripts = [ast.module, ast.instance]
				.flatMap((script) => {
					if (!script) return []
					const body = text.indexOf('>', script.attributes.at(-1)?.end ?? script.start) + 1
					return [text.slice(body, text.lastIndexOf('</script', script.end))]
				})
				.join('\n')
			const template = compile(text, { filename })
				.js.code.replace(/^import\b[^;]*;/gm, '')
				.replace(/^export (default )?/gm, '')
			return `${scripts}\n{\n${template}\n}`
		}
	}
} satisfies KnipConfig
