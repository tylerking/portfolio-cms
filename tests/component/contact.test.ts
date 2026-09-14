import { screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../helpers/enhance'
import { renderWithLabels } from '../helpers/labels'

vi.mock('$app/forms', () => import('../helpers/enhance'))

const { default: Contact } = await import('$lib/components/sections/Contact')

const props = {
	heading: 'Get in touch',
	lead: 'Say hello.',
	email: 'tk@example.com',
	phone: '',
	location: 'Portland, OR',
	reasons: ['New Project'],
	resumeUrl: '/resume.pdf'
}
const renderContact = (form?: Record<string, unknown>) => renderWithLabels(Contact, { ...props, form })
const send = () => userEvent.click(screen.getByRole('button', { name: /Send message/ }))

async function submitFilled(email = 'ada@example.com') {
	renderContact()
	await userEvent.type(screen.getByLabelText('Name'), 'Ada')
	await userEvent.type(screen.getByLabelText('Email'), email)
	await userEvent.type(screen.getByLabelText('Message'), 'Hello')
	await send()
}

beforeEach(() => {
	localStorage.clear()
	server.result = { type: 'success', status: 200 }
})

afterEach(() => {
	vi.useRealTimers()
})

describe('Contact validation', () => {
	it('summarises every missing field, links to each and focuses the first', async () => {
		renderContact()
		await send()
		const link = screen.getByRole('link', { name: 'Name' })
		expect(link).toHaveAttribute('href', '#field-name')
		expect(link.parentElement).toHaveTextContent('Complete these 3 fields: Name, Email, Message')
		const name = screen.getByLabelText('Name')
		expect(name).toHaveAttribute('aria-invalid', 'true')
		expect(name).toHaveAccessibleDescription('Enter your name.')
		await waitFor(() => expect(name).toHaveFocus())
	})

	it('flags a malformed email with its own message', async () => {
		await submitFilled('not-an-email')
		expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Enter a valid email address.')
	})

	it('puts a server field error on that field', async () => {
		server.result = { type: 'failure', status: 400, data: { field: 'email', message: 'Email: Invalid email address' } }
		await submitFilled()
		expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Email: Invalid email address')
	})

	it('puts a server error for an optional field on that field and names it in the summary', async () => {
		server.result = { type: 'failure', status: 400, data: { field: 'phone', message: 'Phone: Too long' } }
		await submitFilled()
		const phone = screen.getByRole('textbox', { name: /Phone/ })
		expect(phone).toHaveAttribute('aria-invalid', 'true')
		expect(phone).toHaveAccessibleDescription('Phone: Too long')
		await waitFor(() => expect(phone).toHaveFocus())
		expect(screen.getByRole('link', { name: /Phone/ })).toHaveAttribute('href', '#field-phone')

		server.result = { type: 'failure', status: 400, data: { field: 'reason', message: 'Reason: Too long' } }
		await send()
		expect(screen.getByRole('combobox')).toHaveAccessibleDescription('Reason: Too long')
	})

	it('re-checks only the field that focus leaves', async () => {
		renderContact()
		await send()
		await userEvent.type(screen.getByLabelText('Name'), 'Ada')
		await userEvent.tab()
		expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
		expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true')
		expect(screen.getByRole('link', { name: 'Email' }).parentElement).toHaveTextContent('Complete these 2 fields:')
	})

	it('shows a server error that belongs to no field in the summary', async () => {
		server.result = { type: 'failure', status: 429, data: { message: 'Too many messages.' } }
		await submitFilled()
		expect(screen.getByText('Too many messages.')).toBeInTheDocument()
	})

	it('honours a field error from a no-JavaScript round trip', () => {
		renderContact({ field: 'email', message: 'Email: Invalid email address', values: { email: 'nope' } })
		expect(screen.getByLabelText('Email')).toHaveValue('nope')
		expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
	})
})

describe('Contact success and drafts', () => {
	it('confirms a sent message and clears the form', async () => {
		await submitFilled()
		expect(screen.getByText('Thanks. I reply within two working days.')).toBeInTheDocument()
		expect(screen.getByLabelText('Name')).toHaveValue('')
		await userEvent.click(screen.getByRole('button', { name: 'Send another message' }))
		expect(screen.getByLabelText('Name')).toHaveFocus()
	})

	it('restores an unsent draft, and discards it only after confirmation, with undo', async () => {
		localStorage.setItem('contact-draft', JSON.stringify({ name: 'Ada', message: 'Half written', savedAt: Date.now() }))
		renderContact()
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Ada'))
		expect(screen.getByText(/Restored your unsent draft/)).toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Discard' }))
		await userEvent.click(screen.getByRole('button', { name: 'Discard for good?' }))
		expect(screen.getByLabelText('Name')).toHaveValue('')
		expect(localStorage.getItem('contact-draft')).toBeNull()
		await waitFor(() => expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus())

		await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
		expect(screen.getByLabelText('Message')).toHaveValue('Half written')
		expect(localStorage.getItem('contact-draft')).toContain('Half written')
		await waitFor(() => expect(screen.getByRole('button', { name: 'Discard' })).toHaveFocus())
	})

	it('keeps Undo while focus is on it, and clears it once focus leaves', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true })
		const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
		localStorage.setItem('contact-draft', JSON.stringify({ name: 'Ada', savedAt: Date.now() }))
		renderContact()
		await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Ada'))

		await user.click(screen.getByRole('button', { name: 'Discard' }))
		await user.click(screen.getByRole('button', { name: 'Discard for good?' }))
		await waitFor(() => expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus())
		await vi.advanceTimersByTimeAsync(5000)
		expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()

		await user.tab()
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull())
	})

	it('ignores a draft older than a week', async () => {
		localStorage.setItem('contact-draft', JSON.stringify({ name: 'Old', savedAt: Date.now() - 8 * 86_400_000 }))
		renderContact()
		await waitFor(() => expect(localStorage.getItem('contact-draft')).toBeNull())
		expect(screen.getByLabelText('Name')).toHaveValue('')
	})

	it('counts characters only near the limit, and links the count to the field', async () => {
		renderContact()
		const message = screen.getByLabelText('Message')
		await userEvent.click(message)
		await userEvent.paste('x'.repeat(4001))
		expect(message).toHaveAccessibleDescription('4001 of 5000 characters')
	})
})
