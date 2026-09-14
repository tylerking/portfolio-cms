<script
	lang='ts'>
	import { flushSync, onMount, tick } from 'svelte'
	import { prefersReducedMotion } from 'svelte/motion'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { series } from '$lib/styles/visualization-theme.css'
	import { supportsViewTransitions } from '$lib/utils/detect'
	import { action } from '../shared.css'
	import * as styles from './ViewTransitionShuffle.css'

	let { supported = $bindable(true) }: { supported?: boolean } = $props()

	const labels = $derived.by(getLabels())

	let items = $state([
		{ id: 1, label: 'A', slot: series[0] },
		{ id: 2, label: 'B', slot: series[1] },
		{ id: 3, label: 'C', slot: series[2] },
		{ id: 4, label: 'D', slot: series[3] }
	])

	let transitions = $state(0)
	let announcement = $state('')

	onMount(() => {
		supported = supportsViewTransitions()
	})

	const shuffled = <Item,>(list: readonly Item[]): Item[] =>
		list
			.map((item) => ({ item, rank: Math.random() }))
			.sort((first, second) => first.rank - second.rank)
			.map(({ item }) => item)

	async function announceOrder() {
		announcement = ''
		await tick()
		announcement = labels.figureShuffleOrder.replace('{order}', items.map((item) => item.label).join(', '))
	}

	function shuffle() {
		if (!supported || prefersReducedMotion.current) {
			items = shuffled(items)
			announceOrder()
			return
		}
		flushSync(() => {
			transitions += 1
		})
		const transition = document.startViewTransition(async () => {
			items = shuffled(items)
			// Svelte applies the assignment asynchronously, so without awaiting the flush
			// the transition snapshots the old DOM twice and nothing appears to move.
			await tick()
		})
		transition.updateCallbackDone.finally(announceOrder)
		transition.finished.finally(() => {
			transitions -= 1
		})
	}
</script>

<div
	class={styles.tiles}>
	{#each items as item (item.id)}
		<div
			class={styles.tile}
			style:view-transition-name={transitions > 0 ? `fig-tile-${item.id}` : undefined}>
			<span
				class={styles.swatch}
				style:background={item.slot}></span>
			<Text
				tone='muted'
				variant='chip'>{item.label}</Text>
		</div>
	{/each}
</div>
<div
	class={action}>
	<Button
		onclick={shuffle}
		size='navigation'
		variant='outline'>{labels.figureShuffleAction}</Button>
</div>
<div
	class={screenReaderOnly}
	role='status'>{announcement}</div>
