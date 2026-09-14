<script
	lang='ts'>
	import { onMount } from 'svelte'
	import { sequentialHue } from '$lib/styles/visualization-theme.css'
	import { supportsOklch } from '$lib/utils/detect'
	import HueControl from '../HueControl'
	import * as styles from './OklchRamp.css'

	let { supported = $bindable(true) }: { supported?: boolean } = $props()

	const STEPS = ['0.90', '0.76', '0.62', '0.48', '0.35'] as const
	const CHROMA = '0.12'
	// The ramp at the starting hue, precomputed in sRGB: data, not theme colours.
	const FLAT = ['#6cf6fd', '#30c8cf', '#009ba3', '#007078', '#004a53']

	let hue = $state(sequentialHue)

	onMount(() => {
		supported = supportsOklch()
	})
</script>

{#if supported}
	<div
		class={styles.ramp}
		style:--figure-chroma={CHROMA}
		style:--figure-hue={hue}>
		{#each STEPS as step (step)}
			<span
				class={styles.bar}
				style:--figure-lightness={step}></span>
		{/each}
	</div>
	<HueControl
		bind:hue
		chroma={CHROMA}
		lightness={STEPS[2]} />
{:else}
	<div
		class={styles.ramp}>
		{#each FLAT as colour (colour)}
			<span
				style:background={colour}></span>
		{/each}
	</div>
{/if}
