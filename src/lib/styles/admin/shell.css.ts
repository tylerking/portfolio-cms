import { style } from '@vanilla-extract/css'
import { button } from '../recipes.css'
import { below, coarse, currentLocation } from '../rules'
import { theme } from '../theme.css'
import { layout, radius, space, touch } from '../tokens'

export const shell = style({
	minHeight: '100dvh',
	containerType: 'inline-size',
	background: theme.background,
	color: theme.foreground
})

export const frame = style({
	display: 'grid',
	gridTemplateColumns: `${layout.adminSidebar} minmax(0, 1fr)`,
	minHeight: '100dvh',
	...below('admin', { gridTemplateColumns: '1fr' })
})

export const sidebar = style({
	position: 'sticky',
	top: 0,
	height: '100dvh',
	overflowY: 'auto',
	overscrollBehavior: 'contain',
	display: 'flex',
	flexDirection: 'column',
	gap: space[6],
	padding: `${space[5]} ${space[3.5]}`,
	background: theme.panel,
	borderRight: `1px solid ${theme.line}`,
	...below('admin', {
		position: 'static',
		height: 'auto',
		overflowY: 'visible',
		borderRight: 'none',
		borderBottom: `1px solid ${theme.line}`
	})
})

export const brand = style({ padding: `0 ${space[2.5]}` })

export const navigation = style({ display: 'flex', flexDirection: 'column', gap: space[6] })

export const navigationGroup = style({ display: 'flex', flexDirection: 'column', gap: space[0.5] })

export const navigationGroupTitle = style({ padding: `0 ${space[2.5]} ${space[1.5]}` })

export const sidebarLink = style({
	display: 'block',
	padding: `${space[2]} ${space[2.5]}`,
	borderRadius: radius.extraSmall,
	color: theme.foregroundSecondary,
	selectors: { '&:hover': { color: theme.foreground, background: theme.panelSecondary } }
})

export const sidebarLinkActive = style(currentLocation)

export const navigationButton = style([
	sidebarLink,
	{
		width: '100%',
		textAlign: 'left',
		background: 'transparent',
		border: 'none',
		cursor: 'pointer'
	}
])

export const sidebarFooter = style({
	marginTop: 'auto',
	display: 'flex',
	flexDirection: 'column',
	gap: space[0.5],
	paddingTop: space[4],
	borderTop: `1px solid ${theme.line}`
})

export const main = style({ minWidth: 0, containerType: 'inline-size' })

export const spacer = style({ marginLeft: 'auto' })

export const page = style({
	maxWidth: layout.adminWidth,
	margin: '0 auto',
	padding: `${space[8]} ${space[6]} ${space[20]}`
})

export const pageNarrow = style({ maxWidth: layout.loginWidth })

export const narrowText = style({ maxWidth: '48ch' })

export const pageHeading = style({ margin: `0 0 ${space[6]}` })

export const sectionHeading = style({ margin: `${space[8]} 0 ${space[3]}` })

export const subsectionHeading = style({ margin: `${space[5]} 0 ${space[2.5]}` })

export const eyebrow = style({ marginBottom: space[2] })

export const pageHeader = style({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'flex-end',
	gap: space[4],
	flexWrap: 'wrap',
	marginBottom: space[6]
})

export const headerLinks = style({ display: 'flex', gap: space[3.5], color: theme.foregroundSecondary })

export const jumpList = style({
	display: 'flex',
	flexWrap: 'wrap',
	gap: `${space[1.5]} ${space[4]}`,
	color: theme.foregroundSecondary,
	marginBottom: space[1.5]
})

export const sidebarHeader = style({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	gap: space[3]
})

export const navigationToggle = style([
	button({ variant: 'outline', size: 'admin' }),
	{
		display: 'none',
		padding: `${space[1.5]} ${space[3]}`,
		...below('admin', { display: 'inline-flex' }),
		...coarse({ minWidth: touch.min })
	}
])

export const loginBrand = style([brand, { padding: 0, marginBottom: space[2] }])
