<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import { bareList } from '$lib/styles/reset.css'

	interface Props {
		as?: 'ul' | 'ol'
		class?: ClassValue
		children: Snippet
	}

	let { as = 'ul', class: className, children }: Props = $props()
</script>

<!-- biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole lint/a11y/useSemanticElements: Safari drops list semantics under list-style: none unless role='list' is set, and Biome cannot see the ul or ol behind svelte:element. -->
<svelte:element
	class={[bareList, className]}
	role='list'
	this={as}>
	{@render children()}
</svelte:element>
