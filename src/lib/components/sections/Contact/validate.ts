import type { Labels } from '$lib/types'

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export function validate(form: HTMLFormElement, labels: Labels, names: Record<string, string>) {
	const errors: Record<string, string> = {}
	for (const control of form.querySelectorAll<Control>('[name][required], [name][type="email"]')) {
		if (control.validity.valueMissing)
			errors[control.name] = labels.formErrorRequired.replace(
				'{field}',
				(names[control.name] ?? control.name).toLowerCase()
			)
		else if (control.validity.typeMismatch) errors[control.name] = labels.formErrorEmail
	}
	return errors
}
