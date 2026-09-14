import { globalStyle, style } from '@vanilla-extract/css'
import { rowHover } from '$lib/styles/recipes.css'
import { below } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, motion, space, touch } from '$lib/styles/tokens'

export const row = style({
	position: 'relative',
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) auto',
	gap: space[7],
	alignItems: 'center',
	padding: `${space[6]} ${space[4]}`,
	borderBottom: `1px solid ${theme.line}`,
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)', gap: space[2.5], padding: `${space[5]} 0` })
})

export const link = style({
	color: 'inherit',
	display: 'inline-block',
	minHeight: touch.fine,
	textDecorationLine: 'underline',
	textDecorationColor: theme.control,
	textDecorationThickness: '1px',
	textUnderlineOffset: '3px',
	transition: `text-decoration-color ${motion.quick}, color ${motion.quick}`,
	selectors: {
		'&::after': { content: '""', position: 'absolute', inset: 0 },
		'&:hover, &:focus-visible': { color: theme.accentText, textDecorationColor: theme.accent }
	}
})

globalStyle(`${rowHover}:hover ${link}`, {
	color: theme.accentText,
	textDecorationColor: theme.accent
})

export const outcome = style({
	maxWidth: layout.summaryWidth,
	marginTop: space[1]
})

export const meta = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
	gap: space[2],
	...below('medium', { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space[3] })
})

export const tags = style({
	display: 'flex',
	gap: space[1.5],
	flexWrap: 'wrap',
	justifyContent: 'flex-end',
	...below('medium', { justifyContent: 'flex-start' })
})
