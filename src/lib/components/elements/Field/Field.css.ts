import { style } from '@vanilla-extract/css'
import { coarseTouch } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { radius, space } from '$lib/styles/tokens'

export const label = style({ display: 'block', marginBottom: space[1.5] })

export const requiredMark = style({
	selectors: { '&::after': { content: ['"*"', '"*" / ""'], marginInlineStart: space[1], color: theme.muted } }
})

export const compact = style({ display: 'flex', flexDirection: 'column', gap: space[1.5], marginBottom: space[3.5] })

export const coarse = style(coarseTouch)

export const input = style({
	width: '100%',
	padding: `${space[3]} ${space[3.5]}`,
	border: `1px solid ${theme.control}`,
	borderRadius: radius.extraSmall,
	background: theme.raised,
	selectors: { '&[aria-invalid="true"]': { borderColor: theme.negative } }
})

export const inputCompact = style([input, { padding: `${space[2.5]} ${space[3]}`, background: theme.background }])

export const textarea = style([input, { resize: 'vertical' }])

export const textareaCompact = style([inputCompact, { resize: 'vertical', minHeight: '90px' }])

export const select = style([
	input,
	{
		appearance: 'none',
		paddingRight: space[8],
		selectors: { '&[data-empty="true"]': { color: theme.muted } }
	}
])

export const selectCompact = style([
	select,
	{ padding: `${space[2.5]} ${space[3]}`, paddingRight: space[8], background: theme.background }
])

export const selectWrap = style({
	position: 'relative',
	display: 'block',
	selectors: {
		'&::after': {
			content: '""',
			position: 'absolute',
			right: space[3.5],
			top: '50%',
			width: space[1.5],
			height: space[1.5],
			borderRight: `1px solid ${theme.muted}`,
			borderBottom: `1px solid ${theme.muted}`,
			transform: 'translateY(-75%) rotate(45deg)',
			pointerEvents: 'none'
		}
	}
})

export const error = style({ display: 'block', color: theme.negative, marginTop: space[1.5] })

export const hint = style({ display: 'block', marginTop: space[1.5], textAlign: 'right' })
