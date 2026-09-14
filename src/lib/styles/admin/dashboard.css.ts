import { style } from '@vanilla-extract/css'
import { below, coarseTouch, raisedSurface } from '../rules'
import { theme } from '../theme.css'
import { radius, space, touch } from '../tokens'

export const list = style({ display: 'flex', flexDirection: 'column', gap: space[0.5] })

export const listRow = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: space[3],
	padding: `${space[3]} ${space[3.5]}`,
	...raisedSurface,
	...coarseTouch
})

export const entryLink = style({
	display: 'inline-flex',
	alignItems: 'center',
	flexWrap: 'wrap',
	minHeight: touch.fine,
	...coarseTouch
})

export const filterRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: space[3],
	flexWrap: 'wrap',
	marginBottom: space[5]
})

export const segmented = style({
	display: 'inline-flex',
	border: `1px solid ${theme.control}`,
	borderRadius: radius.extraSmall
})

export const segment = style({
	padding: `${space[2]} ${space[3]}`,
	background: 'transparent',
	border: 'none',
	color: theme.foregroundSecondary,
	cursor: 'pointer',
	selectors: {
		'&[aria-pressed="true"]': { background: theme.accent, color: theme.accentInk },
		'&:not([aria-pressed="true"]):hover': { color: theme.foreground }
	}
})

export const statisticsRow = style([
	{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: space[3], marginBottom: space[4] },
	below('medium', { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }),
	below('small', { gridTemplateColumns: 'minmax(0, 1fr)' })
])

export const chartsRow = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: space[3],
	marginBottom: space[4],
	...below('medium', { gridTemplateColumns: '1fr' })
})

export const chartCard = style({
	...raisedSurface,
	padding: `${space[4.5]} ${space[5]} ${space[4]}`,
	marginBottom: space[3],
	minWidth: 0
})

export const chartHead = style({
	display: 'flex',
	alignItems: 'flex-start',
	justifyContent: 'space-between',
	gap: space[3],
	marginBottom: space[3.5]
})

export const chartTitle = style({ margin: 0 })

export const dashboardLists = style({ marginTop: space[2] })
