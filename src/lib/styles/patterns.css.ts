import { style } from '@vanilla-extract/css'
import { below, currentLocation } from './rules'
import { theme } from './theme.css'
import { radius, space } from './tokens'

export const measure = '64ch'

export const pageSurface = style({
	background: theme.background,
	color: theme.foreground,
	minHeight: '100svh',
	containerType: 'inline-size'
})

export const hairlineGrid = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
	gap: '1px',
	background: theme.line,
	border: `1px solid ${theme.line}`,
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)' })
})

export const hairlineCell = style({ background: theme.background, minWidth: 0, overflowWrap: 'anywhere' })

export const ledgerList = style({ borderTop: `1px solid ${theme.line}` })

export const balanced = style({ textWrap: 'balance' })

export const breakable = style({ minWidth: 0, overflowWrap: 'anywhere' })

export const sectionIntro = style({
	maxWidth: measure,
	margin: `0 0 ${space[9]}`
})

export const figureFrame = style({
	background: theme.panel,
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small,
	overflow: 'hidden'
})

export const captionGrid = style({
	display: 'grid',
	columnGap: space[3.5],
	rowGap: space[1],
	alignItems: 'baseline'
})

export const navigationLinkCurrent = style(currentLocation)
