import type { ActionResult } from '@sveltejs/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fieldError, flagField, keepValues } from './forms'

afterEach(() => {
	document.body.innerHTML = ''
})

const submit = async (formElement: HTMLFormElement) => {
	const submission = { action: new URL('http://localhost/?/save'), formData: new FormData(formElement), formElement }
	const callback = await keepValues({
		...submission,
		controller: new AbortController(),
		submitter: null,
		cancel: () => {}
	})
	const update = vi.fn(async () => {})
	const result: ActionResult = { type: 'success', status: 200 }
	return { update, finish: () => callback?.({ ...submission, result, update }) }
}

describe('keepValues', () => {
	it('lets SvelteKit update the page without resetting the form', async () => {
		const { update, finish } = await submit(document.createElement('form'))
		await finish()
		expect(update).toHaveBeenCalledWith({ reset: false })
	})

	it('hands focus to the next row when the row that submitted is gone', async () => {
		document.body.innerHTML = `<main id="admin-main" tabindex="-1">
			<div data-row id="removed"><form><button>Remove</button></form></div>
			<div data-row><button>Next row</button></div>
		</main>`
		const form = document.querySelector('form') as HTMLFormElement
		form.querySelector('button')?.focus()
		const { finish } = await submit(form)
		document.getElementById('removed')?.remove()
		await finish()
		expect(document.activeElement).toHaveTextContent('Next row')
	})
})

describe('fieldError', () => {
	it('returns the message only for the field it names', () => {
		const result = { message: 'That slug is taken.', field: 'slug' }
		expect(fieldError(result, 'slug')).toBe('That slug is taken.')
		expect(fieldError(result, 'title')).toBeUndefined()
		expect(fieldError(null, 'slug')).toBeUndefined()
	})
})

describe('flagField', () => {
	const form = () => {
		document.body.innerHTML = `<form>
			<input aria-describedby="hint" name="title" />
			<input name="slug" />
		</form>`
		return document.querySelector('form') as HTMLFormElement
	}

	it('marks, describes and focuses the field the server named', () => {
		const scope = form()
		const title = flagField(scope, 'title', 'status')
		expect(title).toHaveAttribute('aria-invalid', 'true')
		expect(title).toHaveAttribute('aria-describedby', 'hint status')
		expect(title).toHaveFocus()
	})

	it('moves the mark to the next field, keeping each field’s own descriptions', () => {
		const scope = form()
		const title = flagField(scope, 'title', 'status')
		const slug = flagField(scope, 'slug', 'status')
		expect(title).not.toHaveAttribute('aria-invalid')
		expect(title).toHaveAttribute('aria-describedby', 'hint')
		expect(slug).toHaveAttribute('aria-describedby', 'status')
		flagField(scope, undefined, 'status')
		expect(slug).not.toHaveAttribute('aria-invalid')
		expect(slug).not.toHaveAttribute('aria-describedby')
	})

	it('returns nothing for a field that is not in the form', () => {
		expect(flagField(form(), 'missing', 'status')).toBeNull()
	})
})
