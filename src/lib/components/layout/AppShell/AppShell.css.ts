import { globalStyle, keyframes, style } from '@vanilla-extract/css'
import { pageSurface } from '$lib/styles/patterns.css'
import { theme } from '$lib/styles/theme.css'
import { motion, zIndex } from '$lib/styles/tokens'

export const root = style([pageSurface, { display: 'flex', flexDirection: 'column' }])

globalStyle(`${root} > main`, { flex: 1, width: '100%' })

const advance = keyframes({
	'0%': { transform: 'scaleX(0)' },
	'100%': { transform: 'scaleX(0.9)' }
})

export const progress = style({
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	height: '2px',
	zIndex: zIndex.progress,
	background: theme.accent,
	transformOrigin: '0 50%',
	animation: `${advance} ${motion.crawl} ${motion.easeOut} forwards`,
	'@media': { '(prefers-reduced-motion: reduce)': { animation: 'none', transform: 'scaleX(1)', opacity: 0.6 } }
})
