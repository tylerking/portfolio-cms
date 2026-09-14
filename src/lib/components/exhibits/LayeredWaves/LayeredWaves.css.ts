import { style, styleVariants } from '@vanilla-extract/css'
import { tint } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { visualization } from '$lib/styles/visualization-theme.css'

export const waves = style({
	flex: 1,
	minHeight: 0,
	position: 'relative',
	overflow: 'hidden'
})

const animating = `${waves}[data-animating] &`

const layerBase = style({
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	transformOrigin: 'bottom center',
	selectors: { [animating]: { willChange: 'transform' } }
})

export const layer = styleVariants({
	back: [layerBase, { height: '85%', color: tint(30, visualization.series2, theme.panel) }],
	middle: [layerBase, { height: '68%', color: tint(55, visualization.series2, theme.panel) }],
	front: [layerBase, { height: '52%', color: tint(82, visualization.series2, theme.panel) }]
})

// Twice the tile width, because the drift keyframe translates by exactly -50%.
export const track = style({
	display: 'flex',
	width: '200%',
	height: '100%',
	selectors: { [animating]: { willChange: 'transform' } }
})

// Tiles overlap by a pixel. Meeting exactly leaves the two antialiased path edges visible
// as a vertical seam every time the track wraps.
export const tile = style({
	width: 'calc(50% + 1px)',
	marginRight: '-1px',
	height: '100%',
	display: 'block',
	fill: 'currentColor'
})
