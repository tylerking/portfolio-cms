import { style } from '@vanilla-extract/css'
import { breakable, figureFrame, sectionIntro } from '$lib/styles/patterns.css'
import { below } from '$lib/styles/rules'
import { theme } from '$lib/styles/theme.css'
import { space } from '$lib/styles/tokens'

const THUMBNAIL = space[20]
const THUMBNAIL_NARROW = space[14]

export const heading = style({ marginBottom: space[2.5] })

export const intro = style([sectionIntro, { maxWidth: 'none', marginBottom: space[8] }])

export const row = style({
	display: 'grid',
	gridTemplateColumns: 'auto minmax(0, 1fr)',
	gap: space[5],
	alignItems: 'center',
	width: '100%',
	padding: `${space[3]} ${space[3]} ${space[3]} 0`,
	border: 'none',
	borderBottom: `1px solid ${theme.line}`,
	background: 'none',
	font: 'inherit',
	color: 'inherit',
	textAlign: 'start',
	cursor: 'zoom-in',
	...below('small', { gap: space[3] })
})

export const thumbnail = style([
	figureFrame,
	{
		flex: 'none',
		display: 'block',
		width: `calc(${THUMBNAIL} * 1.6)`,
		height: THUMBNAIL,
		...below('small', { width: `calc(${THUMBNAIL_NARROW} * 1.6)`, height: THUMBNAIL_NARROW })
	}
])

export const thumbnailImage = style({
	display: 'block',
	width: '100%',
	height: '100%',
	objectFit: 'cover',
	objectPosition: 'top'
})

export const text = style([breakable, { display: 'grid', gap: space[1] }])

export const stamp = style({ display: 'block' })

export const title = style({ display: 'block' })

export const description = style({ display: 'block', textWrap: 'pretty' })
