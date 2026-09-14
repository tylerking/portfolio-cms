import { globalStyle } from '@vanilla-extract/css'
import { below, coarse } from '../rules'
import { space, touch } from '../tokens'
import { segment } from './dashboard.css'
import { headerLinks, jumpList, navigation, navigationButton, shell, sidebarFooter, sidebarLink } from './shell.css'
import { dragHandle } from './sortable.css'

globalStyle(`html:has(${shell})`, { scrollPaddingTop: space[4] })

globalStyle(`${navigation}:not([data-open]), ${sidebarFooter}:not([data-open])`, below('admin', { display: 'none' }))

globalStyle(`${headerLinks} > a, ${jumpList} > a`, {
	display: 'inline-flex',
	alignItems: 'center',
	minHeight: touch.fine
})

globalStyle(
	`${sidebarLink}, ${navigationButton}, ${segment}, ${headerLinks} > a, ${jumpList} > a`,
	coarse({ minHeight: touch.min, display: 'flex', alignItems: 'center' })
)

globalStyle(
	dragHandle,
	coarse({
		padding: `${space[4]} ${space[4.5]}`,
		margin: `calc(-1 * ${space[4]}) calc(-1 * ${space[4.5]})`
	})
)
