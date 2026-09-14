import { fireEvent, screen, within } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ImagePopover from '$lib/components/elements/ImagePopover'
import CaseFigures from '$lib/components/sections/CaseArticle/CaseFigures.svelte'
import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
import { caseFigures } from '../helpers/content'
import { renderWithLabels } from '../helpers/labels'

const RATIO = { width: 1600, height: 1000 }
const ITEMS = [
	{ src: '/media/one.png', name: 'First frame', alt: 'A list of demos.', caption: 'What the first one shows.' },
	{ src: '/media/two.png', name: 'Second frame', alt: 'A form in four steps.', caption: 'What the second one shows.' },
	{ src: '/media/three.png', name: 'Third frame', caption: 'What the third one shows.' }
]

beforeEach(() => {
	HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
		this.setAttribute('open', '')
	}
	HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
		this.removeAttribute('open')
		this.dispatchEvent(new Event('close'))
	}
})

afterEach(() => {
	Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
	Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

const panel = () => screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement
const shown = () => panel().querySelector('img') as HTMLImageElement
const caption = (text: string) => within(panel()).getByText(text)
const previous = () => screen.getByRole('button', { hidden: true, name: DEFAULT_LABELS.popoverPrevious })
const next = () => screen.getByRole('button', { hidden: true, name: DEFAULT_LABELS.popoverNext })

const gallery = (index = 0) => renderWithLabels(ImagePopover, { items: ITEMS, index, id: 'gallery', ...RATIO })

describe('the gallery dialog', () => {
	it('opens on the item it was asked for, alt text, caption, position and all', () => {
		gallery(1)
		expect(panel().tagName).toBe('DIALOG')
		expect(shown()).toHaveAttribute('src', '/media/two.png')
		expect(shown()).toHaveAttribute('alt', 'A form in four steps.')
		expect(panel()).toHaveAttribute('aria-label', 'Second frame')
		expect(caption('What the second one shows.')).toBeInTheDocument()
		expect(panel().querySelector('[aria-live="polite"]')).toHaveTextContent(/^Second frame · 2 of 3$/)
	})

	it('treats an image without alt text as decorative instead of repeating its title', async () => {
		gallery(2)
		expect(shown()).toHaveAttribute('alt', '')
	})

	it('closes through a dialog form, so it works before hydration', () => {
		gallery(0)
		const close = within(panel()).getByRole('button', { hidden: true, name: DEFAULT_LABELS.popoverClose })
		expect(close).toHaveAttribute('type', 'submit')
		expect(close.closest('form')).toHaveAttribute('method', 'dialog')
	})

	it('walks the set with the arrow keys, caption tracking the image', async () => {
		gallery(0)
		await fireEvent.keyDown(panel(), { key: 'ArrowRight' })
		expect(shown()).toHaveAttribute('src', '/media/two.png')
		expect(caption('What the second one shows.')).toBeInTheDocument()
		await fireEvent.keyDown(panel(), { key: 'ArrowRight' })
		expect(shown()).toHaveAttribute('src', '/media/three.png')
		await fireEvent.keyDown(panel(), { key: 'ArrowLeft' })
		expect(shown()).toHaveAttribute('src', '/media/two.png')
		expect(caption('What the second one shows.')).toBeInTheDocument()
	})

	it('ignores keys that are not the arrows', async () => {
		gallery(1)
		await fireEvent.keyDown(panel(), { key: 'a' })
		expect(shown()).toHaveAttribute('src', '/media/two.png')
	})

	it('walks the set with the buttons and stops at both ends, keeping the end button focusable', async () => {
		gallery(0)
		expect(previous()).toHaveAttribute('aria-disabled', 'true')
		expect(previous()).toBeEnabled()
		expect(next()).not.toHaveAttribute('aria-disabled')
		await fireEvent.click(next())
		expect(shown()).toHaveAttribute('src', '/media/two.png')
		expect(previous()).not.toHaveAttribute('aria-disabled')
		await fireEvent.click(next())
		expect(shown()).toHaveAttribute('src', '/media/three.png')
		expect(next()).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(next())
		expect(shown()).toHaveAttribute('src', '/media/three.png')
		await fireEvent.keyDown(panel(), { key: 'ArrowRight' })
		expect(shown()).toHaveAttribute('src', '/media/three.png')
		await fireEvent.click(previous())
		await fireEvent.click(previous())
		expect(shown()).toHaveAttribute('src', '/media/one.png')
		await fireEvent.keyDown(panel(), { key: 'ArrowLeft' })
		expect(shown()).toHaveAttribute('src', '/media/one.png')
	})

	it('opens modally at the row that was clicked and stays in step with it', async () => {
		renderWithLabels(CaseFigures, { figures: caseFigures(6), headingId: 'figures' })
		const rows = screen.getAllByRole('button', { name: /^Enlarge image/ })
		expect(panel()).not.toHaveAttribute('open')
		await fireEvent.click(rows[3] as HTMLElement)
		expect(panel()).toHaveAttribute('open')
		expect(shown()).toHaveAttribute('src', '/media/figure-4.png')
		expect(shown()).toHaveAttribute('alt', 'Screenshot 4.')
		expect(caption('What figure 4 shows.')).toBeInTheDocument()
		await fireEvent.keyDown(panel(), { key: 'ArrowRight' })
		expect(shown()).toHaveAttribute('src', '/media/figure-5.png')
		panel().close()
		await fireEvent.click(rows[0] as HTMLElement)
		expect(shown()).toHaveAttribute('src', '/media/figure-1.png')
	})

	it('closes on a click outside the panel but not on one inside it', async () => {
		gallery(0)
		const dialog = panel()
		dialog.showModal()
		dialog.getBoundingClientRect = () => ({ left: 100, right: 500, top: 100, bottom: 400 }) as DOMRect
		await fireEvent.click(dialog, { clientX: 300, clientY: 200 })
		expect(dialog).toHaveAttribute('open')
		await fireEvent.click(dialog, { clientX: 20, clientY: 20 })
		expect(dialog).not.toHaveAttribute('open')
	})
})

describe('a single image', () => {
	it('keeps its own trigger, opens it modally and shows no gallery controls', async () => {
		renderWithLabels(ImagePopover, {
			src: '/media/cover.png',
			name: 'A cover',
			alt: 'A map with one state in red.',
			caption: 'What the cover shows.',
			...RATIO
		})
		const trigger = screen.getByRole('button', { name: `${DEFAULT_LABELS.popoverOpen}: A cover` })
		expect(trigger).toHaveAttribute('command', 'show-modal')
		expect(trigger).toHaveAttribute('commandfor', panel().id)
		await fireEvent.click(trigger)
		expect(panel()).toHaveAttribute('open')
		expect(shown()).toHaveAttribute('src', '/media/cover.png')
		expect(shown()).toHaveAttribute('alt', 'A map with one state in red.')
		expect(caption('What the cover shows.')).toBeInTheDocument()
		expect(screen.queryByRole('button', { hidden: true, name: DEFAULT_LABELS.popoverPrevious })).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { hidden: true, name: DEFAULT_LABELS.popoverNext })).not.toBeInTheDocument()
	})

	it('ignores the arrow keys, since there is nowhere to go', async () => {
		renderWithLabels(ImagePopover, { src: '/media/cover.png', name: 'A cover', ...RATIO })
		await fireEvent.keyDown(panel(), { key: 'ArrowRight' })
		expect(shown()).toHaveAttribute('src', '/media/cover.png')
	})
})
