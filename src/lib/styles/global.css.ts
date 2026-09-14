import { globalStyle } from '@vanilla-extract/css'
import './fonts.css'

import { belowHeader } from './rules'
import { theme } from './theme.css'

globalStyle('*', { boxSizing: 'border-box' })
globalStyle('html', {
	scrollBehavior: 'smooth',
	scrollbarGutter: 'stable',
	scrollPaddingTop: belowHeader,
	background: theme.background
})
globalStyle('body', { margin: 0, overflowWrap: 'break-word' })

globalStyle('a', { color: theme.foreground, textDecoration: 'none' })
globalStyle('::selection', { background: theme.accent, color: theme.accentInk })

globalStyle(
	'a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible',
	{ outline: `3px solid ${theme.accent}`, outlineOffset: '3px' }
)
globalStyle(':where(input, textarea, select):focus:not([aria-invalid="true"])', { borderColor: theme.accent })

globalStyle('input, textarea, select', { color: theme.foreground })
globalStyle('input::placeholder, textarea::placeholder', { color: theme.muted })

globalStyle('html', {
	'@media': { '(prefers-reduced-motion: reduce)': { scrollBehavior: 'auto' } }
})
globalStyle('*, *::before, *::after', {
	'@media': {
		'(prefers-reduced-motion: reduce)': {
			animationDuration: '0.001ms !important',
			animationIterationCount: '1 !important',
			transitionProperty:
				'color, background-color, background, border-color, outline-color, text-decoration-color, fill, stroke, opacity !important'
		}
	}
})
