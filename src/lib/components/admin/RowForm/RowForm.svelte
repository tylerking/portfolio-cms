<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import { enhance } from '$app/forms'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { holdFocus } from '$lib/utils/focus'
	import { flagField } from '$lib/utils/forms'
	import { announce } from '../announcer.svelte'
	import ConfirmButton from '../ConfirmButton'
	import EntryGroup from '../EntryGroup'

	interface Props {
		id: number
		name: string
		confirmLabel: string
		enctype?: 'multipart/form-data'
		class?: ClassValue
		children: Snippet
	}

	let { id, name, confirmLabel, enctype, class: className, children }: Props = $props()

	const statusId = $props.id()
	let status = $state('')

	const submit: SubmitFunction = ({ action, formElement, submitter }) => {
		status = 'Saving…'
		const deleting = action.search === '?/delete'
		const landFocus = holdFocus(submitter ?? formElement)
		return async ({ result, update }) => {
			const data = result.type === 'success' || result.type === 'failure' ? result.data : undefined
			if (result.type === 'success') {
				status = deleting ? '' : 'Saved.'
				flagField(formElement, undefined, statusId)
				if (deleting) announce(`Deleted ${name}.`)
				await update({ reset: false })
				await landFocus()
				return
			}
			status = String(data?.message ?? 'Could not save.')
			flagField(formElement, typeof data?.field === 'string' ? data.field : undefined, statusId)
		}
	}
</script>

<form
	action='?/update'
	class={className}
	{enctype}
	method='POST'
	use:enhance={submit}>
	<input
		name='id'
		type='hidden'
		value={id} />
	<EntryGroup
		legend={name}>
		{@render children()}
	</EntryGroup>
	<div
		class={styles.row}>
		<Button
			aria-label={`Save ${name}`}
			class={styles.squareTouch}
			size='small'
			type='submit'
			variant='outline'>Save</Button>
		<ConfirmButton
			ariaLabel={`Delete ${name}`}
			{confirmLabel}
			formaction='?/delete'
			label='Delete'
			size='small' />
		<Text
			id={statusId}
			role='status'
			tone='muted'
			variant='machine'>{status}</Text>
	</div>
</form>
