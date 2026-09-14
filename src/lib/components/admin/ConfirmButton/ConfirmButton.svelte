<script
	lang='ts'>
	import { tick } from 'svelte'
	import Button from '$lib/components/elements/Button'
	import * as styles from '$lib/styles/admin.css'
	import { bareFieldset } from '$lib/styles/reset.css'
	import { holdFocus } from '$lib/utils/focus'

	interface Props {
		label: string
		confirmLabel: string
		formaction?: string
		size?: 'default' | 'small'
		onconfirm?: () => void
		ariaLabel?: string
	}

	let { label, confirmLabel, formaction, size = 'default', onconfirm, ariaLabel }: Props = $props()

	let armed = $state(false)
	let trigger = $state<HTMLElement>()
	let confirmElement = $state<HTMLElement>()
	const scale = $derived(size === 'small' ? 'small' : 'admin')
	const subject = $derived(ariaLabel ?? label)

	async function arm() {
		armed = true
		await tick()
		confirmElement?.focus()
	}

	async function cancel() {
		armed = false
		await tick()
		trigger?.focus()
	}

	async function confirm() {
		const landFocus = confirmElement && holdFocus(confirmElement)
		onconfirm?.()
		armed = false
		await tick()
		if (trigger?.isConnected) trigger.focus()
		else await landFocus?.()
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'Escape') cancel()
	}
</script>

{#if armed}
	<fieldset
		aria-label={`Confirm: ${subject}`}
		class={[bareFieldset, styles.confirmGroup]}>
		{#if onconfirm}
			<Button
				aria-label={`${confirmLabel}: ${subject}`}
				bind:element={confirmElement}
				class={styles.squareTouch}
				onclick={confirm}
				onkeydown={onKey}
				size={scale}
				variant='danger'>{confirmLabel}</Button>
		{:else}
			<Button
				aria-label={`${confirmLabel}: ${subject}`}
				bind:element={confirmElement}
				class={styles.squareTouch}
				{formaction}
				formnovalidate
				onkeydown={onKey}
				size={scale}
				type='submit'
				variant='danger'>{confirmLabel}</Button>
		{/if}
		<Button
			class={styles.squareTouch}
			onclick={cancel}
			onkeydown={onKey}
			size={scale}
			variant='outline'>Cancel</Button>
	</fieldset>
{:else}
	<Button
		aria-label={ariaLabel}
		bind:element={trigger}
		class={styles.squareTouch}
		onclick={arm}
		size={scale}
		variant='danger'>{label}</Button>
{/if}
