import { style } from '@vanilla-extract/css'
import { balanced, sectionIntro } from '$lib/styles/patterns.css'
import { below } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { layout, motion, space } from '$lib/styles/tokens'

const FIGURE_TRACK = '300px'
const FIGURE_NARROW = '420px'

export const intro = style([sectionIntro, { marginBottom: space[8] }])

export const row = style({
	display: 'grid',
	gridTemplateColumns: `minmax(0, 1fr) ${FIGURE_TRACK}`,
	gap: space[8],
	alignItems: 'center',
	padding: `${space[5]} 0`,
	borderBottom: `1px solid ${theme.line}`,
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)', gap: space[5] })
})

// Swaps the template rather than the order: a figure ordered first would land in the flexible track.
export const rowFlipped = style({
	gridTemplateColumns: `${FIGURE_TRACK} minmax(0, 1fr)`,
	...below('medium', { gridTemplateColumns: 'minmax(0, 1fr)' })
})

export const rowTextOnly = style({ gridTemplateColumns: 'minmax(0, 1fr)' })

export const text = style({ minWidth: 0 })

export const figure = style({ minWidth: 0, ...below('medium', { maxWidth: FIGURE_NARROW }) })

export const figureFirst = style({ order: -1, ...below('medium', { order: 0 }) })

export const title = style([balanced, { marginBottom: space[1.5] }])

export const summary = style({ maxWidth: layout.summaryWidth })

export const reveal = style({
	transition: `opacity ${motion.reveal} ${motion.ease}, transform ${motion.reveal} ${motion.ease}`,
	selectors: { '&[data-reveal]': { opacity: 0, transform: `translateY(${space[2]})` } },
	'@media': { print: { selectors: { '&[data-reveal]': { opacity: 1, transform: 'none' } } } }
})
