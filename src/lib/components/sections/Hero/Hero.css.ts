import { style } from '@vanilla-extract/css'
import { below, pageGutter, splitGrid } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, radius, space } from '$lib/styles/tokens'

export const hero = style([
	pageGutter,
	{
		paddingBlock: `${space[30]} ${space[20]}`,
		borderBottom: `1px solid ${theme.line}`,
		...below('medium', { paddingBlock: `${space[24]} ${space[16]}` })
	}
])

export const inner = style({ maxWidth: layout.maxWidth, margin: '0 auto' })

export const meta = style({
	display: 'flex',
	alignItems: 'center',
	gap: space[3.5],
	marginBottom: space[7],
	...below('small', { flexDirection: 'column', alignItems: 'flex-start', gap: space[2.5] })
})

export const avail = style({
	display: 'inline-flex',
	alignItems: 'center',
	gap: space[2],
	border: `1px solid ${theme.lineSecondary}`,
	borderRadius: radius.extraSmall,
	padding: `${space[1]} ${space[2.5]}`
})

export const availDot = style({
	width: '7px',
	height: '7px',
	borderRadius: radius.round,
	background: theme.positive
})

export const name = style({ marginBottom: space[9] })

export const columns = style([splitGrid('1.4fr 1fr', space[10]), { alignItems: 'start' }])

export const lead = style({ maxWidth: layout.leadWidth })

export const actions = style({ display: 'flex', flexDirection: 'column', gap: space[3.5] })

export const buttons = style({ display: 'flex', gap: space[3], flexWrap: 'wrap' })
