<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import Text from '$lib/components/elements/Text'
	import type { TextAttributes } from '$lib/components/elements/Text/attributes'
	import { screenReaderOnly, underline } from '$lib/styles/recipes.css'
	import { tone as tones } from './ULink.css'

	type Props = TextAttributes & {
		href: string
		tone?: keyof typeof tones
		newTabLabel?: string
		class?: ClassValue
		children: Snippet
	}

	let { target, rel, tone = 'ink', newTabLabel, class: className, children, ...rest }: Props = $props()

	const safeRel = $derived(target === '_blank' ? (rel ?? 'noopener noreferrer') : rel)
</script>

<Text
	as='a'
	class={[underline, tones[tone], className]}
	rel={safeRel}
	{target}
	variant='machine'
	{...rest}>
	{@render children()}
	{#if target === '_blank' && newTabLabel}
		<span
			class={screenReaderOnly}> {newTabLabel}</span>
	{/if}
</Text>
