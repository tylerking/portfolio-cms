import { describe, expect, it } from 'vitest'
import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
import { validate } from './validate'

const names = { name: 'Name', email: 'Email', message: 'Message' }

function form(values: { name?: string; email?: string; message?: string }) {
	const element = document.createElement('form')
	element.innerHTML = `
		<input name="name" required value="${values.name ?? ''}" />
		<input name="email" type="email" required value="${values.email ?? ''}" />
		<input name="phone" value="" />
		<textarea name="message" required>${values.message ?? ''}</textarea>`
	return element
}

describe('validate', () => {
	it('names each missing required field in its own words', () => {
		expect(validate(form({}), DEFAULT_LABELS, names)).toEqual({
			name: 'Enter your name.',
			email: 'Enter your email.',
			message: 'Enter your message.'
		})
	})

	it('flags a malformed email and passes a complete form', () => {
		expect(validate(form({ name: 'Ada', email: 'nope', message: 'Hi' }), DEFAULT_LABELS, names)).toEqual({
			email: DEFAULT_LABELS.formErrorEmail
		})
		expect(validate(form({ name: 'Ada', email: 'ada@example.com', message: 'Hi' }), DEFAULT_LABELS, names)).toEqual({})
	})

	it('falls back to the field name when it has no label', () => {
		expect(validate(form({ email: 'ada@example.com', message: 'Hi' }), DEFAULT_LABELS, {}).name).toBe(
			'Enter your name.'
		)
	})
})
