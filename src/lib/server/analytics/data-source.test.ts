import { describe, expect, it } from 'vitest'
import { cookieJar } from '../../../../tests/helpers/cookies'
import { readDataSource, writeDataSource } from './data-source'

describe('data source cookie', () => {
	it('reads mock only when the cookie says so', () => {
		expect(readDataSource(cookieJar().cookies)).toBe('real')
		expect(readDataSource(cookieJar({ admin_data_source: 'mock' }).cookies)).toBe('mock')
		expect(readDataSource(cookieJar({ admin_data_source: 'anything' }).cookies)).toBe('real')
	})

	it('writes a strict, admin-scoped cookie and never stores an unknown value', () => {
		const { cookies, jar } = cookieJar()
		writeDataSource(cookies, 'mock')
		expect(jar.get('admin_data_source')).toMatchObject({
			value: 'mock',
			options: { path: '/admin', httpOnly: true, sameSite: 'strict' }
		})
		writeDataSource(cookies, 'drop table')
		expect(jar.get('admin_data_source')?.value).toBe('real')
	})
})
