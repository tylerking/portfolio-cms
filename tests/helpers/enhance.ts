import type { ActionResult, SubmitFunction } from '@sveltejs/kit'

export const server: { result: ActionResult } = { result: { type: 'success', status: 200 } }

export function enhance(form: HTMLFormElement, submit: SubmitFunction) {
	const onSubmit = async (event: SubmitEvent) => {
		event.preventDefault()
		let cancelled = false
		const formData = new FormData(form)
		const action = new URL(form.action || 'http://localhost/')
		const callback = await submit({
			action,
			formData,
			formElement: form,
			controller: new AbortController(),
			submitter: event.submitter,
			cancel: () => {
				cancelled = true
			}
		})
		if (cancelled || typeof callback !== 'function') return
		await callback({ action, formData, formElement: form, result: server.result, update: async () => {} })
	}
	form.addEventListener('submit', onSubmit)
	return { destroy: () => form.removeEventListener('submit', onSubmit) }
}
