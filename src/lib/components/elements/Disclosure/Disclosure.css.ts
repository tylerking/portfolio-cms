import { style } from '@vanilla-extract/css'
import { button } from '$lib/styles/recipes.css'
import { below } from '$lib/styles/rules'
import { space, touch } from '$lib/styles/tokens'

// Doubled so it outranks the display every folded row sets for itself, whatever the chunk order.
export const folded = style({ selectors: { '&&': below('medium', { display: 'none' }) } })

export const toggle = style([
	button({ variant: 'outline' }),
	{
		display: 'none',
		marginTop: space[3],
		padding: `${space[2.5]} ${space[3.5]}`,
		minHeight: touch.min,
		...below('medium', { display: 'inline-flex' })
	}
])
