import { style } from '@vanilla-extract/css'
import { below, visuallyHidden } from '$lib/styles/rules'
import { space } from '$lib/styles/tokens'

export const header = style({
	display: 'flex',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	marginBottom: space[2]
})

export const count = style(below('medium', visuallyHidden))
