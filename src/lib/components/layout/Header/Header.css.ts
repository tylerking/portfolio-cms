import { globalStyle, style } from '@vanilla-extract/css'
import { button } from '$lib/styles/recipes.css'
import { below, belowHeader, coarse, coarseTouch, pageGutter } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, space, touch, zIndex } from '$lib/styles/tokens'

export const bar = style([
	pageGutter,
	{
		position: 'sticky',
		top: 0,
		zIndex: zIndex.header,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		// min-height, not height: a fixed bar scrolls sideways at large browser font sizes.
		minHeight: layout.headerHeight,
		flexWrap: 'wrap',
		background: `color-mix(in oklab, ${theme.background} 82%, transparent)`,
		backdropFilter: 'blur(14px)',
		borderBottom: `1px solid ${theme.line}`
	},
	below('medium', { background: theme.background, backdropFilter: 'none' }),
	below('extraSmall', { paddingInline: space[4] })
])

globalStyle(`${bar} *`, { scrollMarginTop: `calc(-1 * ${belowHeader})` })

export const logo = style({
	display: 'flex',
	alignItems: 'baseline',
	gap: space[2.5],
	minWidth: 0,
	minHeight: touch.fine,
	...coarse({ minHeight: touch.min, alignItems: 'center' })
})

export const logoName = style({ minWidth: 0, overflowWrap: 'anywhere' })

export const logoMeta = style({ whiteSpace: 'nowrap', ...below('small', { display: 'none' }) })

export const navigationLinks = style({
	display: 'flex',
	gap: space[6],
	alignItems: 'center',
	...below('large', { display: 'none' })
})

export const link = style({
	whiteSpace: 'nowrap',
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: touch.fine,
	...coarseTouch
})

export const menuButton = style([
	button({ variant: 'outline' }),
	{
		display: 'none',
		gap: space[2],
		padding: `${space[2]} ${space[3]}`,
		minHeight: touch.min,
		minWidth: touch.min,
		...below('large', { display: 'flex' })
	}
])

export const mobileActions = style([
	below('large', { display: 'flex' }),
	below('extraSmall', { gap: space[2] }),
	{ display: 'none', alignItems: 'center', gap: space[2.5] }
])

export const contact = style({ selectors: { '&&': { borderColor: theme.accent, color: theme.accentText } } })
