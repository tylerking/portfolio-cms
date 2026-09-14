import type { StyleRule } from '@vanilla-extract/css'
import { globalStyle, layer, style, styleVariants } from '@vanilla-extract/css'
import { theme } from '$lib/styles/theme.css'
import { font } from '$lib/styles/tokens'

const SANS_SERIF = font.sansSerif
const MONOSPACE = font.monospace

const axes = (mono: 0 | 1, casl: number) => `"MONO" ${mono}, "CASL" ${casl}, "CRSV" 0`

// Layered so a caller's class beats Text's defaults whatever the chunk order; the control reset
// sits below the variants so a Text rendered as a button keeps its type.
const resetLayer = layer('text-reset')
const controlLayer = layer('text-control')
const variantLayer = layer('text-variant')

const typeset = (rule: StyleRule) => ({ '@layer': { [variantLayer]: rule } })

const base = style({
	'@layer': {
		[resetLayer]: { margin: 0 },
		[variantLayer]: { fontFamily: SANS_SERIF, fontVariationSettings: axes(0, 0) }
	}
})

export const caps = style({ textTransform: 'uppercase' })

export const variant = styleVariants({
	displayXl: [
		base,
		typeset({
			fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
			fontWeight: 925,
			fontVariationSettings: axes(0, 0.4),
			lineHeight: 0.95,
			letterSpacing: '-0.01em',
			overflowWrap: 'anywhere'
		})
	],
	display: [
		base,
		typeset({
			fontSize: '1.9rem',
			fontWeight: 830,
			fontVariationSettings: axes(0, 0.28),
			lineHeight: 1.1,
			overflowWrap: 'anywhere'
		})
	],
	title: [
		base,
		typeset({
			fontSize: '1.05rem',
			fontWeight: 640,
			lineHeight: 1.25,
			letterSpacing: 'var(--theme-read-tracking, 0em)'
		})
	],
	lead: [
		base,
		typeset({ fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: 'var(--theme-read-tracking, 0em)' })
	],
	body: [
		base,
		typeset({
			fontSize: '0.92rem',
			fontWeight: 400,
			lineHeight: 1.55,
			letterSpacing: 'var(--theme-read-tracking, 0em)'
		})
	],
	label: [
		base,
		typeset({
			fontFamily: MONOSPACE,
			fontSize: '0.75rem',
			fontWeight: 460,
			fontVariationSettings: axes(1, 0),
			textTransform: 'uppercase',
			letterSpacing: '0.1em'
		})
	],
	machine: [
		base,
		typeset({ fontFamily: MONOSPACE, fontSize: '0.75rem', fontWeight: 430, fontVariationSettings: axes(1, 0) })
	],
	chip: [
		base,
		typeset({ fontFamily: MONOSPACE, fontSize: '0.75rem', fontWeight: 500, fontVariationSettings: axes(1, 0) })
	],
	button: [
		base,
		typeset({
			fontFamily: MONOSPACE,
			fontSize: '0.75rem',
			fontWeight: 560,
			fontVariationSettings: axes(1, 0),
			letterSpacing: '0.02em'
		})
	],
	numeral: [
		base,
		typeset({
			fontFamily: MONOSPACE,
			fontSize: '0.85rem',
			fontWeight: 700,
			fontVariationSettings: axes(1, 0),
			fontVariantNumeric: 'tabular-nums'
		})
	]
})

globalStyle(':root', { fontFamily: SANS_SERIF, fontWeight: 400, fontVariationSettings: axes(0, 0) })
globalStyle('input, textarea, select, button', {
	'@layer': { [controlLayer]: { font: 'inherit', fontVariationSettings: 'inherit' } }
})

// Layered so a component's own colour always wins: unlayered CSS beats layered whatever the
// source order, and these are otherwise equal specificity.
const toneLayer = layer('text-tone')

const inLayer = (color: string) => ({ '@layer': { [toneLayer]: { color } } })

export const tone = styleVariants({
	ink: inLayer(theme.foreground),
	muted: inLayer(theme.muted),
	inherit: inLayer('inherit')
})
