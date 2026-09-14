import { style } from '@vanilla-extract/css'
import { below } from '../rules'
import { theme } from '../theme.css'
import { breakpoint, layout, motion, radius, space } from '../tokens'

export const dragRow = style({
	display: 'grid',
	gridTemplateColumns: 'auto minmax(0, 1fr)',
	gap: space[3],
	alignItems: 'start',
	position: 'relative',
	padding: `${space[3]} 0`,
	transition: `opacity ${motion.fast}`
})

export const dragging = style({ opacity: 0.4 })

export const dropBefore = style({
	selectors: {
		'&::before, &::after': { content: '""', position: 'absolute', pointerEvents: 'none', background: theme.accent },
		'&::before': { insetInline: 0, top: 0, height: '1px' },
		'&::after': {
			left: 0,
			top: 0,
			width: space[2],
			height: space[2],
			borderRadius: radius.round,
			transform: 'translateY(-50%)'
		}
	}
})

export const dragRail = style({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: space[1.5],
	paddingTop: space[3.5]
})

export const dragHandle = style({
	cursor: 'grab',
	padding: `${space[2]} ${space[2.5]}`,
	margin: `calc(-1 * ${space[2]}) calc(-1 * ${space[2.5]})`,
	color: theme.muted,
	userSelect: 'none',
	selectors: { '&:active': { cursor: 'grabbing' } }
})

export const dragButtons = style({ display: 'flex', flexDirection: 'column', gap: space[0.5] })

export const moveInline = style({ display: 'flex', gap: space[0.5] })

export const dragBody = style({ minWidth: 0 })

export const rowIndex = style({
	color: theme.accentText,
	marginBottom: space[2]
})

export const figureRow = style({
	display: 'grid',
	gridTemplateColumns: `${layout.thumbnailColumn} minmax(0, 1fr)`,
	gap: space[3.5],
	alignItems: 'start',
	...below('admin', { gridTemplateColumns: '1fr' })
})

export const figureThumbSizes = [
	`(max-width: ${breakpoint.admin}) 100vw`,
	`(max-width: calc(${breakpoint.admin} + ${layout.adminSidebar})) calc(100vw - ${layout.adminSidebar})`,
	layout.thumbnailColumn
].join(', ')

export const coverRow = style([figureRow, { margin: `${space[5]} 0` }])

export const figureThumb = style({
	width: '100%',
	height: 'auto',
	aspectRatio: '16 / 10',
	objectFit: 'cover',
	border: `1px solid ${theme.line}`,
	borderRadius: radius.extraSmall,
	background: theme.panelSecondary
})
