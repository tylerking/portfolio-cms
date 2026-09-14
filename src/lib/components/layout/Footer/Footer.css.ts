import { style } from '@vanilla-extract/css'
import { pageGutter } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, space } from '$lib/styles/tokens'

export const footer = style([pageGutter, { paddingBlock: space[6], borderTop: `1px solid ${theme.line}` }])

export const inner = style({
	maxWidth: layout.maxWidth,
	margin: '0 auto',
	display: 'flex',
	flexWrap: 'wrap',
	gap: space[4],
	justifyContent: 'space-between',
	alignItems: 'center'
})
