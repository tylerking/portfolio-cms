import { globalStyle, style } from '@vanilla-extract/css'
import { below, belowHeader, headerHeight } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { space, touch, zIndex } from '$lib/styles/tokens'

export const panel = style({
	position: 'fixed',
	top: headerHeight,
	insetInline: 0,
	zIndex: zIndex.mobileNavigation,
	flexDirection: 'column',
	background: theme.panel,
	borderBottom: `1px solid ${theme.line}`,
	display: 'none',
	maxHeight: `calc(100dvh - ${headerHeight})`,
	overflowY: 'auto',
	overscrollBehavior: 'contain'
})

globalStyle(`${panel} *`, { scrollMarginTop: `calc(-1 * ${belowHeader})` })

export const open = style(below('large', { display: 'flex' }))

export const link = style({
	padding: `${space[4]} ${space[5]}`,
	borderBottom: `1px solid ${theme.line}`,
	minHeight: touch.min,
	display: 'flex',
	alignItems: 'center',
	selectors: { '&:focus-visible': { outlineOffset: '-3px' }, '&:last-child': { borderBottom: 'none' } }
})
