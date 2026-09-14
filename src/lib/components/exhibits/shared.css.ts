import { style } from '@vanilla-extract/css'
import { space } from '$lib/styles/tokens'

export const action = style({
	flex: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	marginTop: space[1.5]
})
