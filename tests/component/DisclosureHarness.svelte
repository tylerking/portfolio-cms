<script
	lang='ts'>
	import Disclosure from '$lib/components/elements/Disclosure'

	let { total, preview, linked = false }: { total: number; preview: number; linked?: boolean } = $props()
</script>

<Disclosure
	less='Show fewer'
	more='Show all'
	{preview}
	{total}>
	{#snippet children({ id, fold })}
		<ul
			{id}>
			{#each Array.from({ length: total }, (_, index) => index) as index (index)}
				<li
					data-folded={fold(index) !== ''}>
					{#if linked}
						<a
							href={`#item-${index}`}>Item {index}</a>
					{:else}
						Item {index}
					{/if}
				</li>
			{/each}
		</ul>
	{/snippet}
</Disclosure>
