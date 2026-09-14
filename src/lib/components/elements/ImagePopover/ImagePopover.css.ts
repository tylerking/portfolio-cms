import { globalStyle, style } from '@vanilla-extract/css'
import { below, coarseSquare } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { motion, radius, space } from '$lib/styles/tokens'

const PANEL_CHROME = '160px'
const PANEL_CHROME_STACKED = '220px'

export const trigger = style({
	position: 'relative',
	display: 'block',
	width: '100%',
	padding: 0,
	border: 'none',
	background: 'none',
	cursor: 'zoom-in',
	font: 'inherit',
	color: 'inherit',
	selectors: {
		'&:focus-visible': { outlineOffset: '-3px' },
		'&:focus-visible::after': {
			content: '""',
			position: 'absolute',
			inset: '3px',
			border: `2px solid ${theme.background}`,
			pointerEvents: 'none'
		}
	}
})

globalStyle(`${trigger} > img`, { transition: `transform ${motion.reveal} ${motion.ease}` })
globalStyle(`${trigger}:hover > img`, { transform: 'scale(1.03)' })

export const panel = style({
	padding: space[5],
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small,
	background: theme.panel,
	color: theme.foreground,
	maxWidth: 'min(92vw, 1100px)',
	maxHeight: '90dvh',
	overflow: 'auto',
	selectors: { '&:focus-visible': { outlineOffset: '-3px' } }
})

globalStyle(`${panel}::backdrop`, { background: theme.scrim })

export const stage = style({ display: 'block' })

export const gallery = style({
	display: 'grid',
	gridTemplateColumns: 'auto minmax(0, 1fr) auto',
	gridTemplateAreas: '"previous image next"',
	alignItems: 'center',
	gap: space[3],
	...below('small', { gridTemplateColumns: '1fr 1fr', gridTemplateAreas: '"image image" "previous next"' })
})

export const image = style({
	display: 'block',
	width: '100%',
	minWidth: 0,
	height: 'auto',
	maxHeight: `calc(90dvh - ${PANEL_CHROME})`,
	objectFit: 'contain',
	background: theme.panelSecondary,
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small
})

export const galleryImage = style({
	gridArea: 'image',
	...below('small', { maxHeight: `calc(90dvh - ${PANEL_CHROME_STACKED})` })
})

export const step = style([
	coarseSquare,
	{
		flex: 'none',
		selectors: { '&[aria-disabled="true"]': { opacity: 0.35, cursor: 'default' } }
	}
])

export const previous = style({ gridArea: 'previous', justifySelf: 'start' })

export const next = style({ gridArea: 'next', justifySelf: 'end' })

export const bar = style({
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: space[5],
	marginBottom: space[3]
})

export const position = style({ whiteSpace: 'nowrap' })

export const caption = style({ marginTop: space[3], maxWidth: '70ch', textWrap: 'pretty' })

export const close = style({
	transition: `border-color ${motion.quick}`,
	selectors: { '&:hover': { borderColor: theme.lineSecondary } }
})
