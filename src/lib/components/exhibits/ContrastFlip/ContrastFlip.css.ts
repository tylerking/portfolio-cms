import { style } from '@vanilla-extract/css'
import { space } from '$lib/styles/tokens'

export const grid = style({
	flex: 1,
	minHeight: 0,
	display: 'grid',
	gridTemplateColumns: 'repeat(3, 1fr)',
	gridTemplateRows: 'repeat(3, 1fr)',
	gap: space[1],
	overflow: 'hidden'
})

const SWATCH = 'oklch(var(--figure-lightness) var(--figure-chroma) calc(var(--figure-hue) + var(--figure-hue-offset)))'

const tileBase = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	background: SWATCH
})

export const tile = style([tileBase, { color: `contrast-color(${SWATCH})` }])

export const tileStatic = style([tileBase, { color: 'var(--figure-ink)' }])
