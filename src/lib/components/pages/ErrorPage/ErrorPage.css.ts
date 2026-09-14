import { style } from '@vanilla-extract/css'
import { balanced } from '$lib/styles/patterns.css'
import { below, pageGutter } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, space, touch } from '$lib/styles/tokens'

export const main = style([
	pageGutter,
	{
		maxWidth: layout.readWidth,
		margin: '0 auto',
		paddingBlock: `${space[30]} ${space[35]}`,
		...below('medium', { paddingBlock: `${space[20]} ${space[24]}` })
	}
])

export const code = style({ color: theme.accentText, marginBottom: space[4.5] })

export const heading = style([balanced, { marginBottom: space[3.5] }])

export const lead = style({ color: theme.foregroundSecondary, marginBottom: space[8] })

export const routes = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: space[5],
	marginTop: space[7]
})

export const route = style({
	color: theme.muted,
	borderBottom: `1px solid ${theme.lineSecondary}`,
	paddingBottom: space[0.5],
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: touch.min,
	selectors: { '&:hover': { color: theme.foreground } }
})
