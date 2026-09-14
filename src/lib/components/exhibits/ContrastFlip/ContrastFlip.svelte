<script
	lang='ts'>
	import { onMount } from 'svelte'
	import Text from '$lib/components/elements/Text'
	import { identityHue } from '$lib/styles/visualization-theme.css'
	import { supportsContrastColor } from '$lib/utils/detect'
	import HueControl from '../HueControl'
	import * as styles from './ContrastFlip.css'

	let { supported = $bindable(true) }: { supported?: boolean } = $props()

	const LIGHTNESS = ['0.85', '0.60', '0.35'] as const
	const OFFSET = [-40, 0, 40]
	const CHROMA = '0.13'
	// What contrast-color() returns for each tile at the starting hue: data, not theme colours.
	const INK = ['black', 'black', 'black', 'black', 'black', 'black', 'white', 'white', 'white']

	const TILES = LIGHTNESS.flatMap((lightness) => OFFSET.map((offset) => ({ lightness, offset })))

	let hue = $state(identityHue)

	onMount(() => {
		supported = supportsContrastColor()
	})
</script>

<div
	class={styles.grid}
	style:--figure-chroma={CHROMA}
	style:--figure-hue={hue}>
	{#each TILES as tile, index (`${tile.lightness}:${tile.offset}`)}
		<div
			class={supported ? styles.tile : styles.tileStatic}
			style:--figure-hue-offset={tile.offset}
			style:--figure-ink={supported ? undefined : INK[index]}
			style:--figure-lightness={tile.lightness}>
			<Text
				tone='inherit'
				variant='machine'>{tile.lightness}</Text>
		</div>
	{/each}
</div>
<HueControl
	bind:hue
	chroma={CHROMA}
	lightness={LIGHTNESS[1]} />
