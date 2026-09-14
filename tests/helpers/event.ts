import type { ServerLoadEvent } from '@sveltejs/kit'
import { cookieJar } from './cookies'

interface EventInit {
	path?: string
	method?: string
	form?: Record<string, string | Blob>
	body?: BodyInit
	headers?: Record<string, string>
	params?: Record<string, string>
	routeId?: string | null
	cookies?: Record<string, string>
	admin?: boolean
	ip?: string
}

export const ORIGIN = 'http://localhost:5173'

export function requestEvent(init: EventInit = {}) {
	const url = new URL(init.path ?? '/', ORIGIN)
	let body = init.body
	if (init.form) {
		const data = new FormData()
		for (const [key, value] of Object.entries(init.form)) data.append(key, value)
		body = data
	}
	const { cookies, jar } = cookieJar(init.cookies)
	const responseHeaders: Record<string, string> = {}
	const event = {
		request: new Request(url, {
			method: init.method ?? (body === undefined ? 'GET' : 'POST'),
			body,
			headers: init.headers
		}),
		url,
		params: init.params ?? {},
		route: { id: init.routeId ?? null },
		cookies,
		locals: { admin: init.admin ?? false },
		getClientAddress: () => init.ip ?? '198.51.100.7',
		setHeaders: (headers: Record<string, string>) => {
			Object.assign(responseHeaders, headers)
		},
		fetch,
		platform: undefined,
		isDataRequest: false,
		isSubRequest: false,
		isRemoteRequest: false,
		parent: async () => ({}),
		depends: () => {},
		untrack: <Result>(run: () => Result) => run()
	}
	// Route-specific event types narrow params, parent data and route.id; never is assignable to each.
	return { event: event as unknown as ServerLoadEvent<never, never, never>, jar, responseHeaders }
}

export async function loaded<LoadedData>(data: LoadedData): Promise<Awaited<LoadedData> & object> {
	const value = await data
	if (typeof value !== 'object' || value === null) throw new Error('The load returned no data')
	return value
}

export async function thrown(run: () => unknown): Promise<unknown> {
	try {
		await run()
	} catch (error) {
		return error
	}
	throw new Error('Expected the call to throw')
}
