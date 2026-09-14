<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import { tick } from 'svelte'
	import { enhance } from '$app/forms'
	import { FormError } from '$lib/components/admin'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const errorId = $props.id()
	const credentials = $derived(!!form && 'credentials' in form && form.credentials === true)

	const submit: SubmitFunction =
		({ formElement }) =>
		async ({ update }) => {
			await update()
			await tick()
			formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
		}
</script>

<svelte:head><title>Sign in · Admin</title></svelte:head>

<div
	class={[styles.page, styles.pageNarrow]}>
	<Text
		class={styles.loginBrand}
		variant='display'>{data.name || 'Admin'}</Text>
	<Text
		as='h1'
		class={styles.pageHeading}
		variant='display'>Sign in</Text>
	<FormError
		id={errorId}
		message={form?.message} />
	<form
		class={styles.card}
		method='POST'
		use:enhance={submit}>
		<TextField
			autocomplete='username'
			compact
			describedBy={credentials ? errorId : undefined}
			invalid={credentials}
			label='Email'
			name='email'
			required
			type='email'
			value={form?.email ?? ''} />
		<TextField
			autocomplete='current-password'
			compact
			describedBy={credentials ? errorId : undefined}
			invalid={credentials}
			label='Password'
			name='password'
			required
			type='password' />
		<Button
			size='admin'
			type='submit'>Sign in</Button>
	</form>
</div>
