<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import type { Figure } from '$lib/components/exhibits'
	import { getLabels } from '$lib/labels/labels'
	import * as styles from './ExhibitFigure.css'

	let { figure, stamp }: { figure: Figure; stamp: string } = $props()

	const labels = $derived.by(getLabels())
	const Demo = $derived(figure.demo)

	// Starts true so server markup is the supported path; a failing mount check swaps it.
	let supported = $state(true)
</script>

<figure
	class={styles.figure}>
	<div
		class={styles.frame}>
		<div
			class={[styles.band, !supported && styles.bandFallback]}>
			{#if supported}
				<Text
					tone='inherit'
					variant='machine'>{labels[figure.caption]}</Text>
			{:else}
				<Text
					tone='inherit'
					variant='machine'>{labels.figureUnsupported}</Text>
				<Text
					tone='inherit'
					variant='machine'><Text
						caps
						tone='inherit'
						variant='machine'>{labels.figureFallback}</Text>: {labels[figure.fallback]}</Text>
			{/if}
		</div>
		<div
			class={styles.stage}><Demo
				bind:supported /></div>
	</div>
	<figcaption
		class={styles.caption}>
		<Text
			caps
			tone='muted'
			variant='numeral'>{stamp}</Text>
		<Text
			variant='title'>{labels[figure.title]}</Text>
	</figcaption>
</figure>
