import { globalStyle, style } from '@vanilla-extract/css'
import { motion, radius, space } from '$lib/styles/tokens'

export const tiles = style({
	flex: 1,
	minHeight: 0,
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
	gap: space[1.5]
})

export const tile = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: space[1],
	minWidth: 0,
	minHeight: 0
})

export const swatch = style({
	flex: 1,
	alignSelf: 'stretch',
	minHeight: '8px',
	borderRadius: radius.extraSmall
})

// Must match the view-transition-name each tile sets inline.
const groups = [1, 2, 3, 4].map((tileNumber) => `::view-transition-group(fig-tile-${tileNumber})`).join(', ')

globalStyle(groups, {
	animationDuration: motion.slow,
	animationTimingFunction: motion.ease
})
