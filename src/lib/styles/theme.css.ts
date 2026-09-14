import { assignVars, createGlobalTheme, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css'
import { coral, mint, sand, slate, teal, white } from './tokens'

export const theme = createGlobalThemeContract(
	{
		background: 'background',
		panel: 'panel',
		panelSecondary: 'panel-secondary',
		raised: 'raised',
		foreground: 'foreground',
		foregroundSecondary: 'foreground-secondary',
		muted: 'muted',
		faint: 'faint',
		line: 'line',
		lineSecondary: 'line-secondary',
		control: 'control',
		accent: 'accent',
		accentText: 'accent-text',
		accentInk: 'accent-ink',
		positive: 'positive',
		negative: 'negative',
		shadow: 'shadow',
		scrim: 'scrim'
	},
	(value) => `theme-${value}`
)

export const themeBackground = { dark: slate[950], light: sand[100] } as const

const dark = {
	background: themeBackground.dark,
	panel: slate[900],
	panelSecondary: slate[880],
	raised: slate[850],
	foreground: slate[150],
	foregroundSecondary: slate[350],
	muted: slate[450],
	faint: slate[550],
	line: slate[820],
	lineSecondary: slate[800],
	control: slate[550],
	accent: teal[600],
	accentText: teal[500],
	accentInk: white,
	positive: mint[400],
	negative: coral[400],
	shadow: 'rgba(0, 0, 0, 0.5)',
	scrim: 'rgba(8, 9, 13, 0.62)'
}

const light = {
	background: themeBackground.light,
	panel: white,
	panelSecondary: sand[200],
	raised: white,
	foreground: slate[850],
	foregroundSecondary: slate[700],
	muted: slate[600],
	faint: slate[500],
	line: sand[300],
	lineSecondary: sand[400],
	control: slate[500],
	accent: teal[600],
	accentText: teal[650],
	accentInk: white,
	positive: mint[700],
	negative: coral[700],
	shadow: 'rgba(21, 23, 29, 0.16)',
	scrim: 'rgba(21, 23, 29, 0.44)'
}

createGlobalTheme(':root', theme, dark)

globalStyle(':root', {
	colorScheme: 'dark',
	WebkitFontSmoothing: 'antialiased',
	MozOsxFontSmoothing: 'grayscale',
	vars: { '--theme-read-tracking': '0.006em' },
	'@media': {
		'(prefers-color-scheme: light)': {
			colorScheme: 'light',
			WebkitFontSmoothing: 'auto',
			MozOsxFontSmoothing: 'auto',
			vars: { ...assignVars(theme, light), '--theme-read-tracking': '0em' }
		}
	}
})
