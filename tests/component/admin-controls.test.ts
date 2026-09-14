import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { createRawSnippet, flushSync } from 'svelte'
import { describe, expect, it, vi } from 'vitest'

vi.mock('$app/navigation', () => ({ beforeNavigate: vi.fn(), afterNavigate: vi.fn(), invalidateAll: vi.fn() }))

const {
	ChartCard,
	CheckField,
	ConfirmButton,
	FileField,
	foldSeries,
	HorizontalBars,
	MoveButtons,
	OTHER,
	StackedColumns,
	StatTile
} = await import('$lib/components/admin')
const { live } = await import('$lib/components/admin/announcer.svelte')
const { default: SaveBarHarness } = await import('./SaveBarHarness.svelte')

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }))

describe('ConfirmButton', () => {
	it('asks first, cancels on Escape and hands focus back to the trigger', async () => {
		const onconfirm = vi.fn()
		render(ConfirmButton, { label: 'Remove', confirmLabel: 'Remove this row', ariaLabel: 'Remove meta 1', onconfirm })
		await userEvent.click(screen.getByRole('button', { name: 'Remove meta 1' }))
		const confirm = screen.getByRole('button', { name: 'Remove this row: Remove meta 1' })
		expect(confirm).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		expect(screen.getByRole('button', { name: 'Remove meta 1' })).toHaveFocus()
		expect(onconfirm).not.toHaveBeenCalled()

		await userEvent.click(screen.getByRole('button', { name: 'Remove meta 1' }))
		await userEvent.click(screen.getByRole('button', { name: 'Remove this row: Remove meta 1' }))
		expect(onconfirm).toHaveBeenCalledOnce()
	})

	it('submits its form when there is no callback', async () => {
		render(ConfirmButton, { label: 'Delete', confirmLabel: 'Yes', formaction: '?/delete' })
		await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
		const confirm = screen.getByRole('button', { name: 'Yes: Delete' })
		expect(confirm).toHaveAttribute('type', 'submit')
		expect(confirm).toHaveAttribute('formaction', '?/delete')
		await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
		expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
	})
})

describe('MoveButtons', () => {
	it('names each button after its item and disables the impossible move', async () => {
		const onmove = vi.fn()
		render(MoveButtons, { index: 0, count: 3, name: 'Hero', onmove })
		expect(screen.getByRole('button', { name: 'Move Hero up' })).toBeDisabled()
		await userEvent.click(screen.getByRole('button', { name: 'Move Hero down' }))
		expect(onmove).toHaveBeenCalledWith(0, 1)
	})

	it('announces the new position once the row has moved', async () => {
		const { rerender } = render(MoveButtons, { index: 0, count: 3, name: 'Hero', onmove: () => {} })
		await userEvent.click(screen.getByRole('button', { name: 'Move Hero down' }))
		await rerender({ index: 1, count: 3, name: 'Hero', onmove: () => {} })
		await waitFor(() => expect(live.message).toBe('Moved Hero to position 2 of 3.'))
		await waitFor(() => expect(screen.getByRole('button', { name: 'Move Hero down' })).toHaveFocus())
	})

	it('ignores presses while a save is in flight', async () => {
		const onmove = vi.fn()
		render(MoveButtons, { index: 1, count: 3, name: 'Hero', busy: true, onmove })
		const down = screen.getByRole('button', { name: 'Move Hero down' })
		expect(down).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(down)
		expect(onmove).not.toHaveBeenCalled()
	})

	it('submits a direction in form mode', () => {
		render(MoveButtons, { index: 1, count: 3, name: 'Figure', submit: true })
		expect(screen.getByRole('button', { name: 'Move Figure up' })).toHaveAttribute('value', 'up')
		expect(screen.getByRole('button', { name: 'Move Figure down' })).toHaveAttribute('type', 'submit')
	})
})

describe('dashboard pieces', () => {
	it('ChartCard switches to its table and reports the pressed state', async () => {
		render(ChartCard, { heading: 'Leads by week', chart: snippet('<p>chart</p>'), table: snippet('<p>table</p>') })
		expect(screen.getByRole('region', { name: 'Leads by week' })).toHaveTextContent('chart')
		const toggle = screen.getByRole('button', { name: 'Table of Leads by week' })
		await userEvent.click(toggle)
		expect(toggle).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByText('table')).toBeInTheDocument()
	})

	it('StatTile describes its trend in words', () => {
		render(StatTile, {
			label: 'Resume downloads',
			value: '6',
			trend: [1, 2, 5],
			trendLabel: 'Downloads per day',
			href: '/admin/leads'
		})
		expect(screen.getByText('Downloads per day: 1 to 5.')).toBeInTheDocument()
		expect(screen.getByRole('link')).toHaveAttribute('href', '/admin/leads')
	})

	it('foldSeries keeps four named reasons and folds the rest into Other', () => {
		const weeks = [{ week: '2026-09-07', counts: { A: 1, B: 2, C: 3, D: 4, E: 5, Other: 6 } }]
		const folded = foldSeries(['A', 'B', 'C', 'D', 'E'], weeks)
		expect(folded.series).toEqual(['A', 'B', 'C', 'D', OTHER])
		expect(folded.data[0]?.counts).toEqual({ A: 1, B: 2, C: 3, D: 4, Other: 11 })
		expect(foldSeries(['A'], [{ week: '2026-09-07', counts: { A: 1, Other: 0 } }]).series).toEqual(['A'])
	})

	it('StackedColumns colours Other by its key, never by position', () => {
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			}
		)
		const { container } = render(StackedColumns, {
			data: [{ week: '2026-09-07', counts: { Other: 2, A: 1 } }],
			series: [OTHER, 'A'],
			other: OTHER,
			label: 'Leads'
		})
		const swatches = [...container.querySelectorAll<HTMLElement>('span > span')]
		expect(swatches.map((element) => element.parentElement?.textContent)).toEqual(['A', OTHER])
		expect(swatches.map((element) => element.style.background)).toEqual([
			'var(--visualization-series-1)',
			'var(--visualization-other)'
		])
		vi.unstubAllGlobals()
	})

	it('HorizontalBars shows an empty state and tolerates duplicate labels', () => {
		const { unmount } = render(HorizontalBars, { items: [], empty: 'Nothing yet.' })
		expect(screen.getByText('Nothing yet.')).toBeInTheDocument()
		unmount()
		render(HorizontalBars, {
			items: [
				{ label: 'Same', value: 1200 },
				{ label: 'Same', value: 3 }
			]
		})
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
		expect(screen.getByText('1.2K')).toBeInTheDocument()
	})
})

describe('form controls', () => {
	it('CheckField toggles from its label', async () => {
		render(CheckField, { label: 'Published', name: 'published' })
		await userEvent.click(screen.getByText('Published'))
		expect(screen.getByRole('checkbox', { name: 'Published' })).toBeChecked()
	})

	it('FileField blocks an oversized image before upload', async () => {
		render(FileField, { name: 'cover', label: 'Choose image', id: 'cover-file' })
		const input = screen.getByLabelText('Choose image') as HTMLInputElement
		const file = new File([new Uint8Array(5 * 1024 * 1024)], 'huge.png', { type: 'image/png' })
		// jsdom has no FileList setter, and Svelte's bind:files writes the list back to the input.
		Object.defineProperty(input, 'files', { configurable: true, get: () => [file], set: () => {} })
		await fireEvent.change(input)
		expect(screen.getByText('Image must be under 4 MB.')).toBeInTheDocument()
		expect(input.validationMessage).toBe('Image must be under 4 MB.')
	})
})

describe('SaveBar', () => {
	const unsaved = () => screen.queryByText('Unsaved changes · Ctrl+S saves')

	it('tracks unsaved changes in its own form only, outside the live region', async () => {
		render(SaveBarHarness, {})
		const status = screen.getByRole('status')
		await userEvent.type(screen.getByLabelText('Caption'), 'x')
		expect(unsaved()).toBeNull()
		await userEvent.type(screen.getByLabelText('Title'), 'x')
		expect(unsaved()).toBeInTheDocument()
		expect(status).toHaveTextContent('')
	})

	it('counts a change that fires no input event, such as a reorder', async () => {
		const { rerender } = render(SaveBarHarness, { snapshot: 'hero,about' })
		expect(unsaved()).toBeNull()
		await rerender({ snapshot: 'about,hero' })
		expect(unsaved()).toBeInTheDocument()
		await rerender({ snapshot: 'about,hero', result: { success: true } })
		expect(unsaved()).toBeNull()
		expect(screen.getByRole('status')).toHaveTextContent('Saved.')
	})

	it('reports a save, and focuses and describes a field the server rejected', async () => {
		const { rerender } = render(SaveBarHarness, {})
		await userEvent.type(screen.getByLabelText('Title'), 'x')
		await rerender({ result: { success: true } })
		expect(screen.getByRole('status')).toHaveTextContent('Saved.')

		await rerender({ result: { message: 'Slug is taken.', field: 'title' } })
		const title = screen.getByLabelText('Title')
		await waitFor(() => expect(title).toHaveFocus())
		expect(title).toHaveAttribute('aria-invalid', 'true')
		expect(title).toHaveAccessibleDescription('Slug is taken.')
	})

	it('lets a fresh edit replace an old error while the field keeps its description', async () => {
		const { rerender } = render(SaveBarHarness, {})
		await rerender({ result: { message: 'Slug is taken.', field: 'title' } })
		const title = screen.getByLabelText('Title')
		await waitFor(() => expect(title).toHaveFocus())
		await userEvent.type(title, 'x')
		expect(screen.getByRole('status')).toHaveTextContent('')
		expect(unsaved()).toBeInTheDocument()
		expect(title).toHaveAccessibleDescription('Slug is taken.')
	})

	it('shows a rejected save that arrives while changes are still unsaved', async () => {
		const { rerender } = render(SaveBarHarness, {})
		await userEvent.type(screen.getByLabelText('Title'), 'x')
		await rerender({ result: { message: 'Section order must list every section once.' } })
		expect(screen.getByRole('status')).toHaveTextContent('Section order must list every section once.')
		expect(unsaved()).toBeNull()
		await userEvent.type(screen.getByLabelText('Title'), 'y')
		expect(screen.getByRole('status')).toHaveTextContent('')
		expect(unsaved()).toBeInTheDocument()
	})

	it('saves with Ctrl+S, including with Caps Lock on', async () => {
		const submit = vi.spyOn(HTMLFormElement.prototype, 'requestSubmit').mockImplementation(() => {})
		render(SaveBarHarness, {})
		fireEvent.keyDown(window, { key: 's', ctrlKey: true })
		fireEvent.keyDown(window, { key: 'S', ctrlKey: true })
		flushSync()
		expect(submit).toHaveBeenCalledTimes(2)
		submit.mockRestore()
	})
})
