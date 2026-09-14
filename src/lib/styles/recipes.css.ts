import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { below, coarseTouch, visuallyHidden } from './rules'
import { theme } from './theme.css'
import { motion, radius, space, touch } from './tokens'

export const button = recipe({
	base: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: radius.extraSmall,
		border: 'none',
		cursor: 'pointer',
		textDecoration: 'none',
		textAlign: 'center',
		maxWidth: '100%',
		transition: `transform ${motion.fast}, opacity ${motion.quick}`,
		selectors: { '&:active': { transform: 'translateY(1px)' } },
		...coarseTouch
	},
	variants: {
		variant: {
			primary: { background: theme.accent, color: theme.accentInk },
			outline: { background: 'transparent', border: `1px solid ${theme.control}`, color: theme.foreground },
			danger: { background: 'transparent', border: `1px solid ${theme.negative}`, color: theme.negative }
		},
		size: {
			navigation: { padding: `${space[2]} ${space[3.5]}`, minHeight: touch.control },
			hero: { padding: `${space[3]} ${space[5]}`, minHeight: touch.min },
			submit: { padding: `${space[3]} ${space[6]}`, alignSelf: 'flex-start', minHeight: touch.min },
			back: { padding: `${space[3]} ${space[4.5]}` },
			admin: { padding: `${space[2]} ${space[4]}` },
			small: { padding: `${space[1.5]} ${space[2.5]}` },
			icon: {
				padding: `${space[0.5]} ${space[2]}`,
				minWidth: touch.fine,
				minHeight: touch.fine,
				selectors: { '&:disabled': { opacity: 0.35, cursor: 'default' } }
			}
		}
	},
	defaultVariants: { variant: 'primary', size: 'navigation' }
})

export const chip = recipe({
	base: {
		display: 'inline-flex',
		alignItems: 'center',
		minWidth: 0,
		maxWidth: '100%',
		overflowWrap: 'anywhere',
		border: `1px solid ${theme.lineSecondary}`,
		borderRadius: radius.extraSmall,
		color: theme.foregroundSecondary
	},
	variants: {
		size: {
			extraSmall: { padding: `${space[0.5]} ${space[2]}` },
			medium: { padding: `${space[1]} ${space[2]}` }
		}
	},
	defaultVariants: { size: 'extraSmall' }
})

export const underline = style({
	position: 'relative',
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: touch.fine,
	...below('medium', { minHeight: touch.min }),
	...coarseTouch,
	selectors: {
		'&::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			top: 'calc(50% + 1.1em)',
			width: '100%',
			height: '1px',
			background: theme.accent,
			transform: 'scaleX(0)',
			transformOrigin: 'left',
			transition: `transform ${motion.slower} ${motion.ease}`
		},
		'&:hover::after': { transform: 'scaleX(1)' }
	}
})

export const navigationLink = style({
	color: theme.foregroundSecondary,
	transition: `color ${motion.quick}`,
	selectors: { '&:hover': { color: theme.foreground } }
})

export const rowHover = style({
	transition: `background ${motion.base}`,
	selectors: { '&:hover': { background: theme.panelSecondary } }
})

export const screenReaderOnly = style(visuallyHidden)
