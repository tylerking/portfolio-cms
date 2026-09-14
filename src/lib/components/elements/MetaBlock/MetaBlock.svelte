<script
	lang='ts'>
	import type { ClassValue } from 'svelte/elements'
	import Text from '$lib/components/elements/Text'
	import * as styles from './MetaBlock.css'

	interface Row {
		label: string
		value: string
	}

	let { rows, class: className }: { rows: Row[]; class?: ClassValue } = $props()
</script>

{#if rows.length}
	<dl
		class={[styles.block, className]}>
		{#each rows as row, index (index)}
			<div
				class={styles.row}>
				<Text
					as='dt'
					tone='muted'
					variant='label'>{row.label}</Text>
				<Text
					as='dd'
					class={styles.value}>{row.value}</Text>
			</div>
		{/each}
	</dl>
{/if}
