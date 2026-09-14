<script
	lang='ts'>
	import List from '$lib/components/elements/List'
	import Text from '$lib/components/elements/Text'
	import { radius } from '$lib/styles/tokens'
	import * as chartStyles from '$lib/styles/visualization.css'
	import { formatCompact } from '$lib/utils/format'

	interface Props {
		items: { key?: string; label: string; value: number }[]
		empty?: string
	}

	let { items, empty = 'No data yet.' }: Props = $props()

	const max = $derived(Math.max(1, ...items.map((item) => item.value)))
</script>

{#if items.length === 0}
	<Text
		class={chartStyles.tileDelta}
		variant='chip'>{empty}</Text>
{:else}
	<List>
		{#each items as item, index (item.key ?? index)}
			<li
				class={chartStyles.horizontalBarRow}>
				<Text
					class={chartStyles.horizontalBarLabel}
					tone='muted'
					variant='machine'>{item.label}</Text>
				<Text
					class={chartStyles.horizontalBarValue}
					variant='numeral'>{formatCompact(item.value)}</Text>
				<div
					class={chartStyles.horizontalBarTrack}>
					<div
						class={chartStyles.horizontalBarFill}
						style:clip-path={`inset(0 ${(1 - Math.max(0.02, item.value / max)) * 100}% 0 0 round 0 ${radius.medium} ${radius.medium} 0)`}></div>
				</div>
			</li>
		{/each}
	</List>
{/if}
