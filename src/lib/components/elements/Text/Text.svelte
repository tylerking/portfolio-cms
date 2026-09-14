<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import type { TextAttributes } from './attributes'
	import { caps as capsClass, tone as tones, variant as variants } from './Text.css'

	type Props = TextAttributes & {
		as?: 'span' | 'a' | 'button' | 'dd' | 'div' | 'dt' | 'h1' | 'h2' | 'h3' | 'label' | 'p' | 'td' | 'th'
		variant?: keyof typeof variants
		tone?: keyof typeof tones
		caps?: boolean
		class?: ClassValue
		element?: HTMLElement
		children: Snippet
	}

	let {
		as = 'span',
		variant = 'body',
		tone = 'ink',
		caps = false,
		class: className,
		element = $bindable(),
		children,
		...rest
	}: Props = $props()
</script>

<svelte:element
	bind:this={element}
	class={[variants[variant], tones[tone], caps && capsClass, className]}
	this={as}
	{...rest}>{@render children()}</svelte:element>
