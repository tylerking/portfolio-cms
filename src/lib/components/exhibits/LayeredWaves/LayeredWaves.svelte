<script
	lang='ts'>
	import { onMount } from 'svelte'
	import { prefersReducedMotion } from 'svelte/motion'
	import Button from '$lib/components/elements/Button'
	import { getLabels } from '$lib/labels/labels'
	import { supportsWebAnimations } from '$lib/utils/detect'
	import { action } from '../shared.css'
	import * as styles from './LayeredWaves.css'

	let { supported = $bindable(true) }: { supported?: boolean } = $props()

	const labels = $derived.by(getLabels())

	const VIEW_WIDTH = 100
	const VIEW_HEIGHT = 40

	// Integer cycle counts: anything else leaves a step at the seam each time the track wraps.
	const LAYERS = [
		{ key: 'back', amplitude: 7, cycles: 1, phase: 0, drift: 17000, breathe: 6400, scale: 1.06 },
		{ key: 'middle', amplitude: 5.5, cycles: 2, phase: 1.1, drift: 13000, breathe: 5200, scale: 1.09 },
		{ key: 'front', amplitude: 4, cycles: 3, phase: 2.3, drift: 9000, breathe: 4200, scale: 1.12 }
	] as const

	function wavePath(amplitude: number, cycles: number, phase: number, samples = 72) {
		const middle = VIEW_HEIGHT * 0.45
		const yFor = (xPosition: number) =>
			middle + amplitude * Math.sin(phase + (xPosition / VIEW_WIDTH) * cycles * Math.PI * 2)
		let path = `M 0 ${yFor(0).toFixed(2)}`
		for (let sample = 1; sample <= samples; sample++) {
			const xPosition = (sample / samples) * VIEW_WIDTH
			path += ` L ${xPosition.toFixed(2)} ${yFor(xPosition).toFixed(2)}`
		}
		// Overfilled past the viewBox so the body under the crest never shows a bottom edge.
		return `${path} L ${VIEW_WIDTH} ${VIEW_HEIGHT * 2} L 0 ${VIEW_HEIGHT * 2} Z`
	}

	const PATH = LAYERS.map((layer) => wavePath(layer.amplitude, layer.cycles, layer.phase))

	let waves = $state<HTMLDivElement>()
	let tracks = $state<HTMLDivElement[]>([])
	let layers = $state<HTMLDivElement[]>([])
	let running = $state.raw<{ animation: Animation; drifts: boolean; peak: number }[]>([])
	let visible = $state(false)
	let playing = $state(false)
	const animating = $derived(playing && visible && running.length > 0)

	onMount(() => {
		supported = supportsWebAnimations()
		if (!supported || !waves) return

		running = LAYERS.flatMap((layer, index) => {
			const track = tracks[index]
			const wave = layers[index]
			if (!track || !wave) return []
			return [
				{
					animation: track.animate([{ transform: 'translateX(0%)' }, { transform: 'translateX(-50%)' }], {
						duration: layer.drift,
						easing: 'linear',
						iterations: Infinity
					}),
					drifts: true,
					peak: layer.drift
				},
				{
					animation: wave.animate([{ transform: 'scaleY(1)' }, { transform: `scaleY(${layer.scale})` }], {
						duration: layer.breathe,
						easing: 'ease-in-out',
						direction: 'alternate',
						iterations: Infinity
					}),
					drifts: false,
					peak: layer.breathe
				}
			]
		})
		for (const { animation } of running) animation.pause()

		const watcher = new IntersectionObserver((entries) => {
			visible = entries.at(-1)?.isIntersecting ?? false
		})
		watcher.observe(waves)

		return () => {
			watcher.disconnect()
			for (const { animation } of running) animation.cancel()
		}
	})

	$effect(() => {
		const still = prefersReducedMotion.current
		for (const { animation, drifts, peak } of running) {
			if (animating && !still) {
				animation.play()
				continue
			}
			animation.pause()
			if (still && !drifts) animation.currentTime = playing ? peak : 0
		}
	})
</script>

<div
	bind:this={waves}
	class={styles.waves}
	data-animating={(animating && !prefersReducedMotion.current) || undefined}>
	{#each LAYERS as layer, index (layer.key)}
		<div
			bind:this={layers[index]}
			class={styles.layer[layer.key]}>
			<div
				bind:this={tracks[index]}
				class={styles.track}>
				{#each [0, 1] as copy (copy)}
					<svg
						aria-hidden='true'
						class={styles.tile}
						preserveAspectRatio='none'
						viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}><path
							d={PATH[index]} /></svg>
				{/each}
			</div>
		</div>
	{/each}
</div>
{#if supported}
	<div
		class={action}>
		<Button
			onclick={() => (playing = !playing)}
			size='navigation'
			variant='outline'>
			{playing ? labels.figureWavesPause : labels.figureWavesPlay}
		</Button>
	</div>
{/if}
