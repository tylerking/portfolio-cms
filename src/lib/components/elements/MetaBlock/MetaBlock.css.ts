import { style } from '@vanilla-extract/css'
import { breakable } from '$lib/styles/patterns.css'
import { below } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, radius, space } from '$lib/styles/tokens'

export const block = style({
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small,
	background: theme.panel,
	margin: 0
})

export const row = style({
	display: 'grid',
	gridTemplateColumns: `${layout.gutterColumn} minmax(0, 1fr)`,
	gap: space[5],
	alignItems: 'baseline',
	padding: `${space[3]} ${space[5]}`,
	selectors: { '&:not(:first-child)': { borderTop: `1px solid ${theme.line}` } },
	...below('small', { gridTemplateColumns: 'minmax(0, 1fr)', gap: space[1] })
})

export const value = style([breakable, { color: theme.foregroundSecondary }])
