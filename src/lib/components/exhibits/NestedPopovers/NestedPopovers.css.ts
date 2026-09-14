import { globalStyle, style, styleVariants } from '@vanilla-extract/css'
import { below, elevation, tint } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { radius, space } from '$lib/styles/tokens'
import { visualization } from '$lib/styles/visualization-theme.css'
import { action } from '../shared.css'

const SCALE = 0.75
const STEP = 0.18

export const mirror = style({
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	minHeight: 0,
	width: '100%',
	height: '100%',
	paddingBottom: space[1.5],
	overflow: 'hidden'
})

export const framed = style({
	background: theme.panel,
	border: `1px solid ${theme.line}`,
	borderRadius: radius.small
})

export const body = style({
	position: 'relative',
	flex: 1,
	minHeight: 0,
	containerType: 'inline-size'
})

export const skeleton = style({
	position: 'absolute',
	inset: 0,
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'flex-start',
	gap: '6%',
	padding: '9%'
})

export const dot = style({
	flexShrink: 0,
	width: 'max(5px, 5cqi)',
	height: 'max(5px, 5cqi)',
	borderRadius: radius.round,
	background: visualization.series2
})

const barBase = style({ flexShrink: 0, borderRadius: radius.extraSmall })

export const bar = styleVariants({
	title: [barBase, { width: '78%', height: 'max(5px, 16%)', background: tint(55, visualization.series2, theme.panel) }],
	text: [barBase, { width: '60%', height: 'max(4px, 10%)', background: tint(32, visualization.series2, theme.panel) }],
	textShort: [
		barBase,
		{ width: '43%', height: 'max(4px, 10%)', background: tint(32, visualization.series2, theme.panel) }
	]
})

export const readout = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	minHeight: '28px',
	padding: `${space[1]} ${space[1.5]}`,
	color: theme.muted,
	textAlign: 'center'
})

const popoverBase = style({
	position: 'absolute',
	left: 'var(--popover-center, 50%)',
	translate: '-50% 0',
	margin: 0,
	padding: 0,
	border: 'none',
	background: 'none',
	overflow: 'visible',
	borderRadius: radius.small,
	boxShadow: elevation.low,
	selectors: { '&:focus-visible': { outline: `3px solid ${theme.accent}`, outlineOffset: '3px' } }
})

export const level = [1, 2].map((levelNumber) =>
	style([
		popoverBase,
		{
			top: `calc(var(--popover-top, 40%) + var(--popover-height, 200px) * ${(STEP * levelNumber).toFixed(2)})`,
			width: `calc(var(--popover-width, 300px) * ${SCALE ** levelNumber})`,
			aspectRatio: '3 / 2'
		}
	])
)

globalStyle(level.map((levelClass) => `${levelClass}::backdrop`).join(', '), { background: 'transparent' })

const base = `${mirror}:has(+ ${level[0]}:popover-open)`
globalStyle(`${base} > ${body} > *`, { display: 'none' })
globalStyle(`${base} > ${action} > *`, { visibility: 'hidden' })

level.forEach((parent, index) => {
	const child = level[index + 1]
	if (!child) return
	const open = `${parent}:has(> ${child}:popover-open) > ${mirror}`
	// Levels are concentric: without this a parent shows as slivers around its open child.
	globalStyle(`${open} > ${body} > *`, { display: 'none' })
	// Visibility, not display: the action row must keep its reserved height.
	globalStyle(`${open} > ${action} > *`, { visibility: 'hidden' })
})

// Hiding the trigger that level 2 carries is the whole mobile cap: level 3 becomes unreachable.
export const cappedTrigger = style({ selectors: { '&&': below('medium', { display: 'none' }) } })

export const inset = style({
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '72%',
	aspectRatio: '3 / 2'
})

globalStyle(`${body}:has(> ${inset}) > ${skeleton}`, { display: 'none' })
