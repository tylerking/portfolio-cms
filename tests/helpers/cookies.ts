import type { Cookies } from '@sveltejs/kit'

type SetOptions = Parameters<Cookies['set']>[2]

export function cookieJar(initial: Record<string, string> = {}) {
	const jar = new Map<string, { value: string; options: SetOptions }>(
		Object.entries(initial).map(([name, value]) => [name, { value, options: { path: '/' } }])
	)
	const cookies: Cookies = {
		get: (name) => jar.get(name)?.value,
		getAll: () => [...jar].map(([name, { value }]) => ({ name, value })),
		set: (name, value, options) => {
			jar.set(name, { value, options })
		},
		delete: (name) => {
			jar.delete(name)
		},
		serialize: (name, value) => `${name}=${value}`
	}
	return { cookies, jar }
}
