<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import { type Snippet, tick } from 'svelte'
	import { enhance } from '$app/forms'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { announce } from '../announcer.svelte'
	import EntryGroup from '../EntryGroup'

	let { noun, children }: { noun: string; children: Snippet } = $props()

	const submit: SubmitFunction =
		({ formElement }) =>
		async ({ result, update }) => {
			const created = result.type === 'success'
			await update({ reset: created })
			if (created) announce(`${noun} created.`)
			await tick()
			const invalid = formElement.querySelector<HTMLElement>('[aria-invalid="true"]')
			const first = created ? formElement.querySelector<HTMLElement>('input, textarea, select') : null
			;(invalid ?? first)?.focus()
		}
</script>

<Text
	as='h2'
	class={styles.sectionHeading}
	variant='title'>New {noun}</Text>
<form
	action='?/create'
	class={styles.card}
	method='POST'
	use:enhance={submit}>
	<EntryGroup
		legend={`New ${noun}`}>
		{@render children()}
	</EntryGroup>
	<Button
		size='admin'
		type='submit'>Create {noun}</Button>
</form>
