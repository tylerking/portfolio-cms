import { style } from '@vanilla-extract/css'
import { space } from '$lib/styles/tokens'

export const ramp = style({
	flex: 1,
	minHeight: 0,
	display: 'grid',
	gridAutoFlow: 'column',
	gridAutoColumns: '1fr',
	gap: space[1],
	overflow: 'hidden'
})

export const bar = style({ background: 'oklch(var(--figure-lightness) var(--figure-chroma) var(--figure-hue))' })
