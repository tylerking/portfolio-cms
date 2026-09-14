import { style, styleVariants } from '@vanilla-extract/css'
import { below, belowHeader, pageGutter } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, space } from '$lib/styles/tokens'

export const section = style([pageGutter, { selectors: { '&:focus': { outline: 'none' } } }])

export const divider = style({ borderBottom: `1px solid ${theme.line}` })

export const grid = style({
	display: 'grid',
	gridTemplateColumns: `${layout.gutterColumn} 1fr`,
	maxWidth: layout.maxWidth,
	margin: '0 auto',
	...below('medium', { gridTemplateColumns: '1fr' })
})

const rail = { borderRight: `1px solid ${theme.line}`, ...below('medium', { display: 'none' }) }

export const gutterColumn = styleVariants({
	default: [rail, { padding: `${space[16]} 0` }],
	contact: [rail, { padding: `${space[18]} 0` }]
})

export const gutter = style({ position: 'sticky', top: belowHeader })

const content = { minWidth: 0, ...below('medium', { padding: `${space[12]} 0` }) }

export const body = styleVariants({
	default: [content, { padding: `${space[16]} 0 ${space[16]} ${space[12]}` }],
	contact: [content, { padding: `${space[18]} 0 ${space[20]} ${space[12]}` }]
})

export const mobileGutter = style({
	display: 'none',
	alignItems: 'baseline',
	justifyContent: 'space-between',
	gap: space[3],
	marginBottom: space[4.5],
	...below('medium', { display: 'flex' })
})

export const mobileCount = style({ whiteSpace: 'nowrap' })
