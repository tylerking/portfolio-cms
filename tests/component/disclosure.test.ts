import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import DisclosureHarness from './DisclosureHarness.svelte'

const folded = () => screen.getAllByRole('listitem').filter((item) => item.dataset.folded === 'true').length

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn()
})

describe('Disclosure', () => {
	it('folds the rows past the preview behind a button that controls the list', async () => {
		render(DisclosureHarness, { total: 5, preview: 3 })
		const button = screen.getByRole('button', { name: 'Show all' })
		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(button).toHaveAttribute('aria-controls', screen.getByRole('list').id)
		expect(folded()).toBe(2)

		await userEvent.click(button)
		expect(button).toHaveAttribute('aria-expanded', 'true')
		expect(button).toHaveAccessibleName('Show fewer')
		expect(folded()).toBe(0)

		await userEvent.click(button)
		expect(folded()).toBe(2)
		expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
	})

	it('moves focus to the first revealed row, since it appears above the button', async () => {
		render(DisclosureHarness, { total: 5, preview: 3 })
		const button = screen.getByRole('button', { name: 'Show all' })
		await userEvent.click(button)
		const first = screen.getAllByRole('listitem')[3]
		expect(first).toHaveFocus()
		expect(first).toHaveAttribute('tabindex', '-1')

		await userEvent.click(button)
		expect(button).toHaveFocus()
	})

	it('focuses the link inside the first revealed row rather than the row', async () => {
		render(DisclosureHarness, { total: 5, preview: 3, linked: true })
		await userEvent.click(screen.getByRole('button', { name: 'Show all' }))
		expect(screen.getByRole('link', { name: 'Item 3' })).toHaveFocus()
		expect(screen.getAllByRole('listitem')[3]).not.toHaveAttribute('tabindex')
	})

	it('shows no button when everything fits in the preview', () => {
		render(DisclosureHarness, { total: 3, preview: 3 })
		expect(screen.queryByRole('button')).toBeNull()
		expect(folded()).toBe(0)
	})
})
