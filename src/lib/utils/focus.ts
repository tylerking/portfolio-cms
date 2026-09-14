import { tick } from 'svelte'

const FOCUSABLE = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(', ')

export const focusables = (root: Element) =>
	[...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.closest('[hidden]'))

const focusLost = () => {
	const active = document.activeElement
	return !active || active === document.body || !active.isConnected
}

export function holdFocus(from: Element, fallbackId = 'admin-main'): () => Promise<void> {
	const row = from.closest('[data-row]')
	const siblings = [row?.nextElementSibling, row?.previousElementSibling]
	const ancestors: Element[] = []
	for (
		let node = from.parentElement;
		node && node !== document.body && node.id !== fallbackId;
		node = node.parentElement
	)
		ancestors.push(node)
	return async () => {
		await tick()
		if (!focusLost()) return
		const nearby = row?.isConnected ? ancestors : [...siblings, ...ancestors]
		for (const candidate of nearby) {
			const target = candidate?.isConnected ? focusables(candidate)[0] : undefined
			if (target) {
				target.focus()
				return
			}
		}
		document.getElementById(fallbackId)?.focus()
	}
}
