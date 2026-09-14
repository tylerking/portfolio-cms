<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import { enhance } from '$app/forms'
	import { holdFocus } from '$lib/utils/focus'
	import { announce } from '../announcer.svelte'
	import ConfirmButton from '../ConfirmButton'

	interface Props {
		id: number
		name: string
		confirmLabel: string
		label?: string
	}

	let { id, name, confirmLabel, label = 'Delete' }: Props = $props()

	const submit: SubmitFunction = ({ formElement, submitter }) => {
		const landFocus = holdFocus(submitter ?? formElement)
		return async ({ result, update }) => {
			announce(result.type === 'success' ? `Deleted ${name}.` : `Could not delete ${name}.`)
			await update()
			await landFocus()
		}
	}
</script>

<form
	action='?/delete'
	method='POST'
	use:enhance={submit}>
	<input
		name='id'
		type='hidden'
		value={id} />
	<ConfirmButton
		ariaLabel={`${label} ${name}`}
		{confirmLabel}
		{label}
		size='small' />
</form>
