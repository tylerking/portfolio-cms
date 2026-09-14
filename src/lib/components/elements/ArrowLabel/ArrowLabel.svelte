<script
	lang='ts'>
	import { splitArrows } from '$lib/utils/arrows'

	let { text }: { text: string } = $props()

	const parts = $derived(splitArrows(text))
</script>

{#each parts as part, index (index)}{#if part.arrow}<span
			aria-hidden='true'>{part.text}</span>{:else}{part.text}{/if}{/each}
