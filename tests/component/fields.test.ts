import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import SelectField from '$lib/components/elements/SelectField'
import TextareaField from '$lib/components/elements/TextareaField'
import TextField from '$lib/components/elements/TextField'

describe('TextField', () => {
	it('labels the input and derives its id from the name', () => {
		render(TextField, { label: 'Email', name: 'email', type: 'email', required: true })
		const input = screen.getByLabelText('Email')
		expect(input).toHaveAttribute('id', 'field-email')
		expect(input).toHaveAttribute('type', 'email')
		expect(input).toBeRequired()
		expect(input).not.toHaveAttribute('aria-invalid')
	})

	it('marks an error and links it as the description', () => {
		render(TextField, { label: 'Email', name: 'email', error: 'Enter a valid email address.' })
		const input = screen.getByLabelText('Email')
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(input).toHaveAccessibleDescription('Enter a valid email address.')
	})

	it('prefers an explicit id, for fields repeated on one page', () => {
		render(TextField, { label: 'Title', name: 'title', id: 'figure-title-3' })
		expect(screen.getByLabelText('Title')).toHaveAttribute('id', 'figure-title-3')
	})
})

describe('TextareaField', () => {
	it('describes the field by its error and its hint', () => {
		render(TextareaField, { label: 'Message', name: 'message', error: 'Too long.', hint: '4100 of 5000 characters' })
		expect(screen.getByLabelText('Message')).toHaveAccessibleDescription('Too long. 4100 of 5000 characters')
	})
})

describe('SelectField', () => {
	it('shows a placeholder and marks the empty state for styling', async () => {
		render(SelectField, {
			label: 'Reason',
			name: 'reason',
			placeholder: 'Choose a reason',
			options: [{ value: 'hire', label: 'Hire' }]
		})
		const select = screen.getByLabelText('Reason')
		expect(select).toHaveAttribute('data-empty', 'true')
		await userEvent.selectOptions(select, 'hire')
		expect(select).toHaveAttribute('data-empty', 'false')
	})
})
