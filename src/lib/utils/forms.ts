import type { SubmitFunction } from '@sveltejs/kit'
import { holdFocus } from './focus'

// SvelteKit's enhance resets on success, and Svelte sets values as properties, so that blanks every field.
export const keepValues: SubmitFunction = ({ formElement, submitter }) => {
	const landFocus = holdFocus(submitter ?? formElement)
	return async ({ update }) => {
		await update({ reset: false })
		await landFocus()
	}
}

export const fieldError = (
	result: { success?: boolean; message?: string; field?: string } | null | undefined,
	name: string
) => (result?.field === name ? result.message : undefined)

const descriptionIds = (element: Element) => (element.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)

export function flagField(scope: Element, field: string | undefined, messageId: string): HTMLElement | null {
	for (const flagged of scope.querySelectorAll(`[aria-describedby~="${messageId}"]`)) {
		flagged.removeAttribute('aria-invalid')
		const rest = descriptionIds(flagged).filter((id) => id !== messageId)
		if (rest.length) flagged.setAttribute('aria-describedby', rest.join(' '))
		else flagged.removeAttribute('aria-describedby')
	}
	const target = field ? scope.querySelector<HTMLElement>(`[name="${CSS.escape(field)}"]`) : null
	if (!target) return null
	target.setAttribute('aria-invalid', 'true')
	target.setAttribute('aria-describedby', [...descriptionIds(target), messageId].join(' '))
	target.scrollIntoView?.({ block: 'center' })
	target.focus({ preventScroll: true })
	return target
}
