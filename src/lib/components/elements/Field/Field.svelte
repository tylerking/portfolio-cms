<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import Text from '$lib/components/elements/Text'
	import * as styles from './Field.css'

	interface Control {
		id: string
		'aria-invalid': 'true' | undefined
		'aria-describedby': string | undefined
	}

	interface Props {
		label: string
		name?: string
		id?: string
		compact?: boolean
		requiredMark?: boolean
		invalid?: boolean
		error?: string
		hint?: string
		describedBy?: string
		class?: ClassValue
		control: Snippet<[Control]>
	}

	let {
		label,
		name,
		id: idProperty,
		compact = false,
		requiredMark = false,
		invalid = false,
		error,
		hint,
		describedBy: extraDescription,
		class: className,
		control
	}: Props = $props()

	const id = $derived(idProperty ?? `field-${name}`)
	const errorId = $derived(`${id}-error`)
	const hintId = $derived(`${id}-hint`)
	const describedBy = $derived(
		[error && errorId, hint && hintId, extraDescription].filter(Boolean).join(' ') || undefined
	)
</script>

<div
	class={[compact && styles.compact, className]}>
	<Text
		as='label'
		class={[styles.label, requiredMark && styles.requiredMark]}
		for={id}
		tone='muted'
		variant='label'>{label}</Text>
	{@render control({ id, 'aria-invalid': error || invalid ? 'true' : undefined, 'aria-describedby': describedBy })}
	{#if error}
		<Text
			class={styles.error}
			id={errorId}
			variant='machine'>{error}</Text>
	{/if}
	{#if hint}
		<Text
			class={styles.hint}
			id={hintId}
			tone='muted'
			variant='machine'>{hint}</Text>
	{/if}
</div>
