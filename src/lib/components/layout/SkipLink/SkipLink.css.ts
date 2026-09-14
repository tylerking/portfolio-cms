import { style } from '@vanilla-extract/css'
import { theme } from '$lib/styles/theme.css'
import { motion, radius, space, touch, zIndex } from '$lib/styles/tokens'

export const skip = style({
	position: 'absolute',
	left: space[3],
	top: space[3],
	zIndex: zIndex.skip,
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: touch.min,
	background: theme.accent,
	color: theme.accentInk,
	padding: `${space[3]} ${space[4.5]}`,
	borderRadius: radius.extraSmall,
	translate: `0 calc(-100% - ${space[6]})`,
	transition: `translate ${motion.base} ${motion.ease}`,
	selectors: { '&:focus': { translate: 'none' } }
})
