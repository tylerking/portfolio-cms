<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { bareFieldset } from '$lib/styles/reset.css'

	let { legend, class: className, children }: { legend: string; class?: ClassValue; children: Snippet } = $props()
</script>

<fieldset
	class={[bareFieldset, className]}>
	<legend
		class={screenReaderOnly}>{legend}</legend>
	{@render children()}
</fieldset>
