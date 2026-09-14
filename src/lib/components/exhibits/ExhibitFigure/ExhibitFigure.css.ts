import { style } from '@vanilla-extract/css'
import { captionGrid, figureFrame } from '$lib/styles/patterns.css'
import { theme } from '$lib/styles/theme.css'
import { space } from '$lib/styles/tokens'

export const figure = style({ margin: 0 })

export const frame = figureFrame

export const band = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: space[0.5],
	minHeight: '46px',
	padding: `${space[1.5]} ${space[3]}`,
	borderBottom: `1px solid ${theme.line}`,
	color: theme.muted,
	textAlign: 'center'
})

export const bandFallback = style({ background: theme.panelSecondary })

export const stage = style({
	aspectRatio: '3 / 2',
	display: 'flex',
	flexDirection: 'column',
	padding: space[3]
})

export const caption = style([
	captionGrid,
	{ gridTemplateColumns: 'auto auto', justifyContent: 'center', marginTop: space[1.5] }
])
