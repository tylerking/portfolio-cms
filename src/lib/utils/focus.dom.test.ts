import { afterEach, describe, expect, it } from 'vitest'
import { focusables, holdFocus } from './focus'

afterEach(() => {
	document.body.innerHTML = ''
})

const rows = (...names: string[]) => {
	document.body.innerHTML = `<main id="admin-main" tabindex="-1"><ul>${names
		.map((name) => `<li data-row id="${name}"><button>${name}</button></li>`)
		.join('')}</ul></main>`
	return (name: string) => document.querySelector<HTMLButtonElement>(`#${name} button`) as HTMLButtonElement
}

describe('focusables', () => {
	it('lists only what Tab can reach, in document order', () => {
		document.body.innerHTML = `<div id="root">
			<a href="#">link</a><a>anchor without href</a>
			<button>button</button><button disabled>off</button>
			<input type="hidden" /><input aria-label="input" />
			<div tabindex="0">tabbable</div><div tabindex="-1">skipped</div>
			<div hidden><button>hidden</button></div>
		</div>`
		const found = focusables(document.getElementById('root') as HTMLElement)
		expect(found.map((element) => element.getAttribute('aria-label') ?? element.textContent)).toEqual([
			'link',
			'button',
			'input',
			'tabbable'
		])
	})
})

describe('holdFocus', () => {
	it('moves to the next row when the focused row is removed', async () => {
		const button = rows('one', 'two', 'three')
		button('two').focus()
		const land = holdFocus(button('two'))
		document.getElementById('two')?.remove()
		await land()
		expect(document.activeElement).toBe(button('three'))
	})

	it('moves to the previous row when the last row is removed', async () => {
		const button = rows('one', 'two')
		button('two').focus()
		const land = holdFocus(button('two'))
		document.getElementById('two')?.remove()
		await land()
		expect(document.activeElement).toBe(button('one'))
	})

	it('leaves focus where it is when the control survived', async () => {
		const button = rows('one', 'two')
		button('one').focus()
		const land = holdFocus(button('one'))
		await land()
		expect(document.activeElement).toBe(button('one'))
	})

	it('stays in the row when only the control is removed from it', async () => {
		document.body.innerHTML = `<main id="admin-main" tabindex="-1"><ul>
			<li data-row id="one"><button>Move one</button><div><div id="cover"><button>Remove cover</button></div><input /></div></li>
			<li data-row id="two"><button>Move two</button></li>
		</ul></main>`
		const remove = document.querySelector('#cover button') as HTMLButtonElement
		remove.focus()
		const land = holdFocus(remove)
		document.getElementById('cover')?.remove()
		await land()
		expect(document.activeElement).toBe(document.querySelector('#one input'))
	})

	it('falls back to the page when nothing near the control is left', async () => {
		const button = rows('only')
		button('only').focus()
		const land = holdFocus(button('only'))
		document.querySelector('ul')?.remove()
		await land()
		expect(document.activeElement).toBe(document.getElementById('admin-main'))
	})
})
