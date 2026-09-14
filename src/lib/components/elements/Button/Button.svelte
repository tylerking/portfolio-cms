<script
	lang='ts'>
	import type { RecipeVariants } from '@vanilla-extract/recipes'
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import Text from '$lib/components/elements/Text'
	import type { TextAttributes } from '$lib/components/elements/Text/attributes'
	import { button, screenReaderOnly } from '$lib/styles/recipes.css'

	type Variants = NonNullable<RecipeVariants<typeof button>>

	type Props = Omit<TextAttributes, 'type'> & {
		variant?: Variants['variant']
		size?: Variants['size']
		type?: 'button' | 'submit'
		newTabLabel?: string
		class?: ClassValue
		element?: HTMLElement
		children: Snippet
	}

	let {
		href,
		variant,
		size,
		type = 'button',
		target,
		rel,
		newTabLabel,
		class: className,
		element = $bindable(),
		children,
		...rest
	}: Props = $props()

	const classes = $derived([button({ variant, size }), className])
	const safeRel = $derived(target === '_blank' ? (rel ?? 'noopener noreferrer') : rel)
</script>

{#if href}
	<Text
		as='a'
		bind:element
		class={classes}
		{href}
		rel={safeRel}
		{target}
		variant='button'
		{...rest}>
		{@render children()}
		{#if target === '_blank' && newTabLabel}
			<span
				class={screenReaderOnly}> {newTabLabel}</span>
		{/if}
	</Text>
{:else}
	<Text
		as='button'
		bind:element
		class={classes}
		{type}
		variant='button'
		{...rest}>
		{@render children()}
	</Text>
{/if}
