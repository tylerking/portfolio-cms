import { style } from '@vanilla-extract/css'
import { coarseTouch } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { space } from '$lib/styles/tokens'

export const readout = style({ marginTop: space[3], textAlign: 'center', color: theme.foregroundSecondary })

export const control = style({
	display: 'flex',
	alignItems: 'center',
	gap: space[3],
	width: '100%',
	marginTop: space[1.5]
})

export const label = style({ flex: 'none' })

export const slider = style({ flex: 1, minWidth: 0, accentColor: theme.accent, cursor: 'pointer', ...coarseTouch })
