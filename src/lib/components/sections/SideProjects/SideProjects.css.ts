import { style } from '@vanilla-extract/css'
import { measure } from '$lib/styles/patterns.css'
import { splitGrid } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { motion, radius, space } from '$lib/styles/tokens'

export const grid = style(splitGrid('repeat(2, minmax(0, 1fr))', space[6]))

export const panel = style({
	display: 'flex',
	flexDirection: 'column',
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small,
	background: theme.panel,
	overflow: 'hidden',
	transition: `border-color ${motion.slow}`,
	selectors: { '&:hover': { borderColor: theme.lineSecondary } }
})

export const cover = style({
	display: 'block',
	aspectRatio: '16 / 10',
	background: theme.panelSecondary,
	borderBottom: `1px solid ${theme.line}`,
	overflow: 'hidden'
})

export const coverImage = style({
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	objectPosition: 'top'
})

export const coverPending = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center'
})

export const pendingLabel = style({
	border: `1px dashed ${theme.lineSecondary}`,
	padding: `${space[2]} ${space[3]}`,
	borderRadius: radius.extraSmall,
	background: theme.panel
})

export const coverTrigger = style({ display: 'block', width: '100%', height: '100%' })

export const body = style({
	padding: `${space[5]} ${space[6]} ${space[6]}`,
	display: 'flex',
	flexDirection: 'column',
	flex: 1
})

export const header = style({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'baseline',
	gap: space[4],
	flexWrap: 'wrap',
	marginBottom: space[2.5]
})

export const description = style({
	maxWidth: measure,
	marginBottom: space[4.5],
	flex: 1
})

export const tags = style({ display: 'flex', flexWrap: 'wrap', gap: space[1.5] })
