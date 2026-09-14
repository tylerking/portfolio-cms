import { style } from '@vanilla-extract/css'
import { sectionIntro } from '$lib/styles/patterns.css'
import { below, coarse, coarseTouch, splitGrid, visuallyHidden } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { space, touch } from '$lib/styles/tokens'

export const columns = style(splitGrid('0.85fr 1.15fr', space[14]))

export const lead = style([sectionIntro, { marginBottom: space[7] }])

export const details = style({ display: 'flex', flexDirection: 'column', gap: space[2.5] })

export const actions = style({ marginTop: space[7] })

export const form = style({ display: 'flex', flexDirection: 'column', gap: space[3] })

export const formColumns = style(splitGrid('1fr 1fr', space[3]))

const status = (color: string) =>
	style({
		color,
		borderLeft: `1px solid ${color}`,
		paddingLeft: space[2.5],
		selectors: { '&:empty': visuallyHidden }
	})

export const success = status(theme.positive)

export const error = status(theme.negative)

export const errorLink = style({
	color: theme.negative,
	textDecoration: 'underline',
	textUnderlineOffset: '3px',
	...coarse({ display: 'inline-flex', alignItems: 'center', minHeight: touch.min })
})

export const draftNote = style({
	display: 'flex',
	alignItems: 'center',
	gap: space[2.5],
	color: theme.muted,
	margin: `0 0 ${space[1]}`
})

export const draftAction = style({
	background: 'none',
	border: 0,
	padding: 0,
	color: theme.foreground,
	textDecoration: 'underline',
	textUnderlineOffset: '3px',
	cursor: 'pointer',
	...coarseTouch
})

export const honeypot = style({
	position: 'absolute',
	left: '-9999px',
	width: '1px',
	height: '1px',
	overflow: 'hidden'
})

export const submitRow = style({ display: 'flex', alignItems: 'center', gap: space[3.5], flexWrap: 'wrap' })

export const shortcutHint = style(below('small', { display: 'none' }))

export const sentActions = style({ display: 'flex', alignItems: 'center', gap: space[5], flexWrap: 'wrap' })
