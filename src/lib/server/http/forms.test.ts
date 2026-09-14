import { isHttpError } from '@sveltejs/kit'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { beaconSchema, caseSchema, contactSchema } from '$lib/schemas'
import { outcome } from '../../../../tests/helpers/actions'
import { firstIssue, parseForm, parseId, routeId, uniqueSlug } from './forms'

const form = (entries: Record<string, string | Blob>) => {
	const data = new FormData()
	for (const [key, value] of Object.entries(entries)) data.append(key, value)
	return data
}

describe('parseForm', () => {
	it('returns the parsed data', () => {
		expect(parseForm(form({ name: 'Ada', email: 'ada@example.com', message: 'Hi' }), contactSchema)).toMatchObject({
			ok: true,
			data: { name: 'Ada' }
		})
	})

	it('puts our own messages after the field label', () => {
		expect(parseForm(form({ email: 'ada@example.com', message: 'Hi' }), contactSchema)).toEqual({
			ok: false,
			field: 'name',
			message: 'Name is required.'
		})
	})

	it("puts Zod's own messages after a colon", () => {
		const result = parseForm(form({ name: 'Ada', email: 'nope', message: 'Hi' }), contactSchema)
		expect(result).toMatchObject({ ok: false, field: 'email' })
		expect(!result.ok && result.message).toMatch(/^Email: /)
	})

	it('numbers nested rows from one', () => {
		const result = parseForm(
			form({
				slug: 'x',
				title: 'X',
				year: '',
				summary: '',
				tags: '',
				sections: '[]',
				meta: '[{"label":"Role","value":""}]'
			}),
			caseSchema
		)
		expect(result).toEqual({ ok: false, field: 'meta', message: 'Meta 1 value is required.' })
	})

	it('ignores file entries', () => {
		expect(
			parseForm(form({ name: new Blob(['x']), email: 'ada@example.com', message: 'Hi' }), contactSchema)
		).toMatchObject({
			ok: false,
			field: 'name'
		})
	})

	it('reports an object-level issue without a field', () => {
		expect(parseForm(form({ type: 'outbound', path: '/relative' }), beaconSchema)).toEqual({
			ok: false,
			message: 'invalid path'
		})
	})
})

describe('firstIssue', () => {
	it('falls back when Zod reports no issue', () => {
		expect(firstIssue(new z.ZodError([]))).toEqual({ message: 'Invalid input', path: [] })
	})
})

describe('parseId and routeId', () => {
	it('reads a positive id from a form', () => {
		expect(parseId(form({ id: '4' }))).toEqual({ ok: true, value: 4 })
		expect(parseId(form({ id: 'x' }))).toEqual({ ok: false, message: 'Missing id' })
	})

	it('turns a bad route id into a 404', () => {
		expect(routeId('7')).toBe(7)
		try {
			routeId('abc')
			expect.unreachable()
		} catch (error) {
			expect(isHttpError(error, 404)).toBe(true)
		}
	})
})

describe('uniqueSlug', () => {
	it('passes a successful save through', async () => {
		await expect(uniqueSlug(async () => 12)).resolves.toBe(12)
	})

	it('turns a unique violation into a slug field error', async () => {
		const result = await uniqueSlug(() => Promise.reject({ code: '23505' }))
		expect(outcome(result)).toEqual({
			status: 400,
			message: 'That slug is already used by another entry.',
			field: 'slug'
		})
	})

	it('rethrows anything else', async () => {
		await expect(uniqueSlug(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom')
	})
})
