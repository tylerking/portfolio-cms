import { createVar, fallbackVar, style } from '@vanilla-extract/css'
import { elevation, raisedSurface } from './rules'
import { theme } from './theme.css'
import { font, motion, radius, space } from './tokens'
import { visualization } from './visualization-theme.css'

export const chartBody = style({ position: 'relative' })

export const svg = style({ display: 'block', width: '100%', height: 'auto', overflow: 'visible' })

const axisScale = createVar()

export const axisScaleProperty = axisScale.slice(4, -1)

export const axisFontRem = 0.6875

export const axisText = style({
	fill: theme.muted,
	fontFamily: font.monospace,
	fontSize: `calc(${axisFontRem}rem * ${fallbackVar(axisScale, '1')})`,
	fontWeight: 430,
	fontVariationSettings: '"MONO" 1, "CASL" 0, "CRSV" 0'
})

export const gridLine = style({ stroke: visualization.grid, strokeWidth: 1 })

export const segment = style({
	transition: `opacity ${motion.fast}`,
	selectors: { '&[data-dim="true"]': { opacity: 0.45 } }
})

export const legend = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: space[3.5],
	marginTop: space[3],
	color: theme.foregroundSecondary
})

export const legendItem = style({ display: 'inline-flex', alignItems: 'center', gap: space[2] })

export const swatch = style({ width: '10px', height: '10px', borderRadius: radius.extraSmall, flex: 'none' })

export const tooltip = style({
	position: 'absolute',
	pointerEvents: 'none',
	...raisedSurface,
	borderColor: theme.lineSecondary,
	padding: `${space[2.5]} ${space[3]}`,
	minWidth: '150px',
	color: theme.foreground,
	boxShadow: elevation.high,
	zIndex: 5
})

export const tooltipTitle = style({
	color: theme.muted,
	marginBottom: space[1.5]
})

export const tooltipRow = style({
	display: 'flex',
	alignItems: 'center',
	gap: space[2]
})

export const tooltipKey = style({ width: '12px', height: '2px', borderRadius: radius.extraSmall, flex: 'none' })

export const tooltipValue = style({ marginLeft: 'auto' })

export const tooltipLabel = style({ color: theme.foregroundSecondary })

export const tableScroll = style({ maxWidth: '100%', overflowX: 'auto' })

export const table = style({
	width: '100%',
	borderCollapse: 'collapse',
	marginTop: space[3]
})

export const tableHeader = style({
	textAlign: 'left',
	color: theme.muted,
	padding: `${space[1.5]} ${space[2]}`,
	borderBottom: `1px solid ${theme.line}`
})

export const tableHeaderNumeric = style([tableHeader, { textAlign: 'right' }])

const tableCell = style({
	padding: `${space[1.5]} ${space[2]}`,
	borderBottom: `1px solid ${theme.line}`
})

export const rowHeader = style([tableCell, { textAlign: 'left', fontWeight: 'inherit' }])

export const tableCellNumeric = style([tableCell, { textAlign: 'right' }])

export const horizontalBarRow = style({
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	gap: `${space[1.5]} ${space[3]}`,
	alignItems: 'center',
	padding: `${space[2]} 0`
})

export const horizontalBarLabel = style({
	color: theme.foregroundSecondary,
	minWidth: 0,
	overflowWrap: 'anywhere'
})

export const horizontalBarValue = style({
	color: theme.foreground
})

export const horizontalBarTrack = style({
	gridColumn: '1 / -1',
	height: '12px',
	background: visualization.track,
	borderRadius: `0 ${radius.medium} ${radius.medium} 0`
})

export const horizontalBarFill = style({
	width: '100%',
	height: '100%',
	background: visualization.series2,
	transition: `clip-path ${motion.reveal}`
})

export const tile = style({
	...raisedSurface,
	padding: `${space[4]} ${space[4.5]}`,
	display: 'flex',
	flexDirection: 'column',
	gap: space[1.5],
	minWidth: 0,
	overflowWrap: 'anywhere'
})

export const tileLabel = style({ color: theme.foregroundSecondary })

export const tileValue = style({
	color: theme.foreground,
	fontSize: '1.9rem',
	lineHeight: 1.1
})

export const tileDelta = style({ color: theme.muted })

export const tileTrend = style({ marginTop: space[1], width: '100%', height: '32px' })

export const tileLink = style({
	color: 'inherit',
	textDecoration: 'none',
	transition: `border-color ${motion.quick}`,
	selectors: { '&:hover': { borderColor: theme.accent } }
})
