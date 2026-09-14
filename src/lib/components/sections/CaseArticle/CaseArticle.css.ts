import { style, styleVariants } from '@vanilla-extract/css'
import { breakable, measure, sectionIntro } from '$lib/styles/patterns.css'
import { below, belowHeader, pageGutter } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, space } from '$lib/styles/tokens'

const BODY_INSET = space[12]

export const page = style([pageGutter, { maxWidth: layout.maxWidth, margin: '0 auto' }])

export const grid = style({
	display: 'grid',
	gridTemplateColumns: `${layout.gutterColumn} minmax(0, 1fr)`,
	maxWidth: `calc(${layout.gutterColumn} + ${BODY_INSET} + ${layout.articleWidth})`,
	margin: '0 auto',
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)' })
})

const PADDINGS = {
	header: { top: space[18], bottom: space[10], narrow: space[12], narrowBottom: space[8] },
	block: { top: space[10], bottom: space[10], narrow: space[8], narrowBottom: space[8] },
	footer: { top: space[7], bottom: space[24], narrow: space[6], narrowBottom: space[18] }
} as const

export const rail = styleVariants(PADDINGS, (padding) => ({
	borderRight: `1px solid ${theme.line}`,
	paddingBlock: `${padding.top} ${padding.bottom}`,
	...below('medium', { borderRight: 'none', paddingBlock: `${padding.narrow} ${space[2.5]}` })
}))

export const railTag = style({
	display: 'block',
	position: 'sticky',
	top: belowHeader
})

export const railEmpty = style(below('medium', { display: 'none' }))

export const body = styleVariants(PADDINGS, (padding) => ({
	minWidth: 0,
	paddingInlineStart: BODY_INSET,
	paddingBlock: `${padding.top} ${padding.bottom}`,
	...below('medium', { paddingInlineStart: 0, paddingBlock: `${padding.narrow} ${padding.narrowBottom}` })
}))

export const bodyTagged = style(below('medium', { paddingBlockStart: 0 }))

const line = `1px solid ${theme.line}`

export const ruled = style({ borderTop: line })

export const ruledWide = style({ borderTop: line, ...below('medium', { borderTop: 'none' }) })

export const back = style({ display: 'inline-block', marginBottom: space[9] })

export const eyebrow = style({ display: 'block', marginBottom: space[3] })

export const heading = style({ marginBottom: space[4.5] })

export const lead = style([sectionIntro, { marginBottom: space[8] }])

export const meta = style({ maxWidth: 'none' })

export const subheading = style({ marginBottom: space[3.5] })

export const paragraph = style({ color: theme.foregroundSecondary, marginBottom: space[4.5], maxWidth: measure })

export const pager = style({
	display: 'grid',
	gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	gap: space[8],
	alignItems: 'start',
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)', gap: space[5] })
})

const pagerCell = { display: 'flex', flexDirection: 'column', gap: space[1.5], minWidth: 0 } as const

export const pagerPrevious = style([breakable, pagerCell])

export const pagerNext = style([
	breakable,
	{
		...pagerCell,
		textAlign: 'end',
		alignItems: 'flex-end',
		...below('medium', { textAlign: 'start', alignItems: 'flex-start' })
	}
])

export const pagerEmpty = style(below('medium', { display: 'none' }))
