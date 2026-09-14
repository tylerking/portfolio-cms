import type { StyleRule } from '@vanilla-extract/css'
import { theme } from './theme.css'
import { breakpoint, layout, radius, space, touch } from './tokens'

// Builders live here rather than in a .css.ts file, which may only export serialisable values.

export const below = (size: keyof typeof breakpoint, rule: StyleRule): StyleRule => ({
	'@container': { [`(max-width: ${breakpoint[size]})`]: rule }
})

const coarsePointer = '(any-pointer: coarse)'

export const pageGutter: StyleRule = { paddingInline: space[8], ...below('medium', { paddingInline: space[5] }) }

export const headerHeightProperty = '--header-height'

export const headerHeight = `var(${headerHeightProperty}, ${layout.headerHeight})`

export const belowHeader = `calc(${headerHeight} + ${space[4]})`

export const elevation = {
	low: `0 ${space[1]} ${space[3.5]} ${theme.shadow}`,
	high: `0 ${space[2]} ${space[6]} ${theme.shadow}`
} as const

export const splitGrid = (columns: string, gap: string): StyleRule => ({
	display: 'grid',
	gridTemplateColumns: columns,
	gap,
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)' })
})

export const currentLocation: StyleRule = {
	color: theme.foreground,
	textDecoration: 'underline',
	textUnderlineOffset: space[1.5],
	textDecorationColor: theme.accent
}

export const raisedSurface: StyleRule = {
	background: theme.raised,
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small
}

export const coarse = (rule: StyleRule): StyleRule => ({ '@media': { [coarsePointer]: rule } })

export const coarseTouch: StyleRule = coarse({ minHeight: touch.min })

export const coarseSquare: StyleRule = coarse({ minWidth: touch.min, minHeight: touch.min })

export const visuallyHidden: StyleRule = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	padding: 0,
	margin: '-1px',
	overflow: 'hidden',
	clipPath: 'inset(50%)',
	whiteSpace: 'nowrap',
	border: 0
}

export const tint = (percent: number, base: string, surface: string) =>
	`color-mix(in oklab, ${base} ${percent}%, ${surface})`
