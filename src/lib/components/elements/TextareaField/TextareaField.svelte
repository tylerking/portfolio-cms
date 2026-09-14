<script
	lang='ts'>
	import type { ClassValue, HTMLTextareaAttributes } from 'svelte/elements'
	import Field, { textarea, textareaCompact } from '$lib/components/elements/Field'

	interface Props extends Omit<HTMLTextareaAttributes, 'class' | 'id' | 'name' | 'value'> {
		label: string
		name?: string
		id?: string
		compact?: boolean
		error?: string
		hint?: string
		value?: string
		class?: ClassValue
	}

	let { label, name, id, compact = false, error, hint, value = $bindable(''), class: className, ...rest }: Props = $props()
</script>

<Field
	class={className}
	{compact}
	{error}
	{hint}
	{id}
	{label}
	{name}
	requiredMark={compact && !!rest.required}>
	{#snippet control(attributes)}
		<textarea
			{...rest}
			{...attributes}
			bind:value
			class={compact ? textareaCompact : textarea}
			{name}></textarea>
	{/snippet}
</Field>
