<script
	lang='ts'>
	import type { ClassValue, HTMLInputAttributes } from 'svelte/elements'
	import Field, { coarse, input, inputCompact } from '$lib/components/elements/Field'

	interface Props extends Omit<HTMLInputAttributes, 'class' | 'id' | 'name' | 'value'> {
		label: string
		name?: string
		id?: string
		compact?: boolean
		error?: string
		invalid?: boolean
		describedBy?: string
		value?: string | number | null
		class?: ClassValue
	}

	let {
		label,
		name,
		id,
		compact = false,
		error,
		invalid,
		describedBy,
		value = $bindable(''),
		class: className,
		...rest
	}: Props = $props()
</script>

<Field
	class={className}
	{compact}
	{describedBy}
	{error}
	{id}
	{invalid}
	{label}
	{name}
	requiredMark={compact && !!rest.required}>
	{#snippet control(attributes)}
		<input
			{...rest}
			{...attributes}
			bind:value
			class={compact ? [inputCompact, coarse] : input}
			{name} />
	{/snippet}
</Field>
