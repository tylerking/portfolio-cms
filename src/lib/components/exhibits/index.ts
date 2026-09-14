import type { Component } from 'svelte'
import type { Labels } from '$lib/types'
import ContrastFlip from './ContrastFlip'
import LayeredWaves from './LayeredWaves'
import NestedPopovers from './NestedPopovers'
import OklchRamp from './OklchRamp'
import ViewTransitionShuffle from './ViewTransitionShuffle'

export interface Figure {
	slug: string
	demo: Component<{ supported?: boolean }>
	title: keyof Labels
	caption: keyof Labels
	fallback: keyof Labels
}

export const FIGURES: Figure[] = [
	{
		slug: 'native-popovers',
		demo: NestedPopovers,
		title: 'figurePopoverTitle',
		caption: 'figurePopoverCaption',
		fallback: 'figurePopoverFallback'
	},
	{
		slug: 'contrast-color',
		demo: ContrastFlip,
		title: 'figureContrastTitle',
		caption: 'figureContrastCaption',
		fallback: 'figureContrastFallback'
	},
	{
		slug: 'view-transitions',
		demo: ViewTransitionShuffle,
		title: 'figureShuffleTitle',
		caption: 'figureShuffleCaption',
		fallback: 'figureShuffleFallback'
	},
	{
		slug: 'oklch',
		demo: OklchRamp,
		title: 'figureOklchTitle',
		caption: 'figureOklchCaption',
		fallback: 'figureOklchFallback'
	},
	{
		slug: 'layered-motion',
		demo: LayeredWaves,
		title: 'figureWavesTitle',
		caption: 'figureWavesCaption',
		fallback: 'figureWavesFallback'
	}
]
