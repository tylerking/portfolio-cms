import { globalStyle, style } from '@vanilla-extract/css'
import { balanced, measure, sectionIntro } from '$lib/styles/patterns.css'
import { theme } from '$lib/styles/theme.css'
import { space } from '$lib/styles/tokens'

export const intro = style([sectionIntro, { marginBottom: space[10] }])

export const list = style({ counterReset: 'approach' })

export const cell = style({
	position: 'relative',
	padding: `${space[14]} ${space[6]} ${space[6]}`,
	counterIncrement: 'approach'
})

globalStyle(`${list} > li::before`, {
	content: ['counter(approach, decimal-leading-zero)', 'counter(approach, decimal-leading-zero) / ""'],
	position: 'absolute',
	top: space[6],
	left: space[6],
	color: theme.muted
})

export const title = style([balanced, { marginBottom: space[2] }])

export const body = style({ maxWidth: measure })
