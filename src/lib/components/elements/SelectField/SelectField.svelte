<script
	lang='ts'>
	import type { ClassValue } from 'svelte/elements'
	import Field, { coarse, select, selectCompact, selectWrap } from '$lib/components/elements/Field'

	interface Props {
		label: string
		name: string
		options: readonly { value: string; label: string }[]
		id?: string
		compact?: boolean
		placeholder?: string
		required?: boolean
		error?: string
		value?: string
		class?: ClassValue
	}

	let {
		label,
		name,
		options,
		id,
		compact = false,
		placeholder,
		required,
		error,
		value = $bindable(''),
		class: className
	}: Props = $props()
</script>

<Field
	class={className}
	{compact}
	{error}
	{id}
	{label}
	{name}
	requiredMark={compact && !!required}>
	{#snippet control(attributes)}
		<div
			class={selectWrap}>
			<select
				{...attributes}
				bind:value
				class={compact ? [selectCompact, coarse] : select}
				data-empty={value === ''}
				{name}
				{required}>
				{#if placeholder}
					<option
						value=''>{placeholder}</option>
				{/if}
				{#each options as option (option.value)}
					<option
						value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	{/snippet}
</Field>
