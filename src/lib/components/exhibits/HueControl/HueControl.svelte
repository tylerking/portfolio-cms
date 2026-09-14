<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import * as styles from './HueControl.css'

	interface Props {
		lightness: string
		chroma: string
		hue: number
	}

	let { lightness, chroma, hue = $bindable() }: Props = $props()

	const labels = $derived.by(getLabels())
	const id = $props.id()
</script>

<Text
	as='div'
	class={styles.readout}
	variant='machine'>oklch({lightness} {chroma} {hue})</Text>
<div
	class={styles.control}>
	<Text
		as='label'
		class={styles.label}
		for={id}
		tone='muted'
		variant='label'>{labels.figureHue}</Text>
	<input
		aria-valuetext={`${hue}°`}
		bind:value={hue}
		class={styles.slider}
		{id}
		max='360'
		min='0'
		step='1'
		type='range' />
</div>
