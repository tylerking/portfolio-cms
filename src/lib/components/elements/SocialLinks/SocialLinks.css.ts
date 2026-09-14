import { globalStyle, style, styleVariants } from '@vanilla-extract/css'
import { coarse } from '$lib/styles/rules'
import { space, touch } from '$lib/styles/tokens'

export const list = style({
	display: 'flex',
	flexWrap: 'wrap',
	rowGap: space[2]
})

export const spacing = styleVariants({
	hero: { columnGap: space[5] },
	footer: { columnGap: space[6] }
})

globalStyle(
	`${list} a`,
	coarse({
		minWidth: touch.min,
		minHeight: touch.min,
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center'
	})
)
