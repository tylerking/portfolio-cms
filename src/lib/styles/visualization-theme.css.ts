import { assignVars, createGlobalTheme, createGlobalThemeContract, globalStyle } from '@vanilla-extract/css'
import { theme } from './theme.css'
import { chart } from './tokens'

export const visualization = createGlobalThemeContract(
	{
		series1: 'series-1',
		series2: 'series-2',
		series3: 'series-3',
		series4: 'series-4',
		other: 'other',
		grid: 'grid',
		track: 'track',
		surface: 'surface'
	},
	(value) => `visualization-${value}`
)

const roles = { other: theme.faint, grid: theme.line, track: theme.panelSecondary, surface: theme.raised }
const visualizationDark = { ...chart.dark, ...roles }
const visualizationLight = { ...chart.light, ...roles }

createGlobalTheme(':root', visualization, visualizationDark)

globalStyle(':root', {
	'@media': { '(prefers-color-scheme: light)': { vars: assignVars(visualization, visualizationLight) } }
})

export const series = [
	visualization.series1,
	visualization.series2,
	visualization.series3,
	visualization.series4
] as const

export const sequentialHue = 200

export const identityHue = 285
