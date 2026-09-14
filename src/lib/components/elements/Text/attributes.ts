import type {
	HTMLAnchorAttributes,
	HTMLAttributes,
	HTMLButtonAttributes,
	HTMLLabelAttributes,
	HTMLThAttributes
} from 'svelte/elements'

export type TextAttributes = Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> &
	Pick<HTMLAnchorAttributes, 'href' | 'target' | 'rel'> &
	Pick<HTMLLabelAttributes, 'for'> &
	Pick<
		HTMLButtonAttributes,
		| 'type'
		| 'disabled'
		| 'popovertarget'
		| 'popovertargetaction'
		| 'formaction'
		| 'formnovalidate'
		| 'form'
		| 'name'
		| 'value'
	> &
	Pick<HTMLThAttributes, 'scope'>
