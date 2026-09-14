import type { Cookies } from '@sveltejs/kit'
import { dev } from '$app/environment'
import type { DataSource } from '$lib/types'

const COOKIE = 'admin_data_source'

export const readDataSource = (cookies: Cookies): DataSource => (cookies.get(COOKIE) === 'mock' ? 'mock' : 'real')

export function writeDataSource(cookies: Cookies, value: FormDataEntryValue | null): void {
	cookies.set(COOKIE, value === 'mock' ? 'mock' : 'real', {
		path: '/admin',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: 60 * 60 * 24 * 365
	})
}
