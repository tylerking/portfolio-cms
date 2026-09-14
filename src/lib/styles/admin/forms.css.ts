import { globalStyle, style } from '@vanilla-extract/css'
import { compact, label as fieldLabel, requiredMark, selectCompact } from '$lib/components/elements/Field/Field.css'
import { button } from '../recipes.css'
import { below, coarse, coarseSquare, coarseTouch, raisedSurface } from '../rules'
import { theme } from '../theme.css'
import { radius, space, touch } from '../tokens'

export const card = style({ ...raisedSurface, padding: space[5], marginBottom: space[4] })

export const itemCard = style({ ...raisedSurface, padding: space[3.5] })

export const field = compact

export const label = style([fieldLabel, { color: theme.muted }])

export const requiredLabel = style([label, requiredMark])

export const row = style({
	display: 'flex',
	gap: space[2.5],
	alignItems: 'center',
	flexWrap: 'wrap',
	minHeight: touch.fine
})

export const rowSpread = style([row, { justifyContent: 'space-between' }])

export const checkRow = style([row, { marginBottom: space[3.5], ...coarseTouch }])

export const checkbox = style({
	width: '16px',
	height: '16px',
	accentColor: theme.accent,
	...coarse({ width: '22px', height: '22px' })
})

export const checkLabel = style({ textTransform: 'none' })

export const hint = style({ marginBottom: space[2.5] })

export const notice = style({ color: theme.positive, marginBottom: space[3.5] })

export const error = style({ color: theme.negative, marginBottom: space[3.5] })

export const twoColumn = style({
	display: 'grid',
	gridTemplateColumns: '1fr 1fr',
	gap: space[3],
	...below('small', { gridTemplateColumns: '1fr' })
})

export const messageBody = style({ whiteSpace: 'pre-wrap', margin: `${space[2.5]} 0 ${space[3.5]}` })

export const selectInline = style([
	selectCompact,
	{ width: 'auto', padding: `${space[1.5]} ${space[2.5]}`, paddingRight: space[8], ...coarseTouch }
])

export const buttonSmall = style([button({ variant: 'outline', size: 'small' }), coarseSquare])

export const squareTouch = style(coarseSquare)

export const pressable = style([
	coarseSquare,
	{
		selectors: {
			'&[aria-pressed="true"]': { background: theme.accent, borderColor: theme.accent, color: theme.accentInk }
		}
	}
])

export const busy = style([
	coarseSquare,
	{ selectors: { '&[aria-disabled="true"]': { opacity: 0.5, cursor: 'progress' } } }
])

export const confirmGroup = style({ display: 'inline-flex', gap: space[2], alignItems: 'center' })

export const saveBar = style({
	position: 'sticky',
	bottom: 0,
	zIndex: 2,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: space[4],
	padding: `${space[3]} 0`,
	marginTop: space[3],
	background: theme.background,
	borderTop: `1px solid ${theme.line}`
})

globalStyle(`html:has(${saveBar})`, { scrollPaddingBottom: space[20] })

export const fileField = style({ display: 'inline-flex', alignItems: 'center', gap: space[2.5], flexWrap: 'wrap' })

globalStyle(`${fileField}:has(input:focus-visible) > label`, {
	outline: `3px solid ${theme.accent}`,
	outlineOffset: '3px'
})

export const empty = style({ padding: `${space[4.5]} 0` })

export const coverPreview = style({
	display: 'block',
	maxWidth: '100%',
	height: 'auto',
	borderRadius: radius.small,
	marginBottom: space[3]
})

export const stackTop = style({ marginTop: space[3] })
