<script
	lang='ts'>
	import { tick } from 'svelte'
	import Button from '$lib/components/elements/Button'
	import * as styles from '$lib/styles/admin.css'
	import { announce } from '../announcer.svelte'

	type Direction = 'up' | 'down'

	interface Props {
		index: number
		count: number
		name: string
		busy?: boolean
		submit?: boolean
		inline?: boolean
		silent?: boolean
		onmove?: (from: number, to: number) => void
	}

	let { index, count, name, busy = false, submit = false, inline = false, silent = false, onmove }: Props = $props()

	let up = $state<HTMLElement>()
	let down = $state<HTMLElement>()
	let pending: Direction | null = null

	// A keyed move re-inserts this row's nodes, which drops focus; hand it back once the row lands.
	$effect(() => {
		const position = index
		if (!pending) return
		const direction = pending
		pending = null
		if (!silent) announce(`Moved ${name} to position ${position + 1} of ${count}.`)
		tick().then(() => {
			const [preferred, other] = direction === 'up' ? [up, down] : [down, up]
			const usable = preferred instanceof HTMLButtonElement && !preferred.disabled
			;(usable ? preferred : other)?.focus()
		})
	})

	function press(direction: Direction, event: MouseEvent) {
		if (busy) {
			event.preventDefault()
			return
		}
		pending = direction
		onmove?.(index, direction === 'up' ? index - 1 : index + 1)
	}
</script>

<div
	class={inline ? styles.moveInline : styles.dragButtons}>
	<Button
		aria-disabled={busy || undefined}
		aria-label={`Move ${name} up`}
		bind:element={up}
		class={styles.busy}
		disabled={index === 0}
		name={submit ? 'direction' : undefined}
		onclick={(event) => press('up', event)}
		size='icon'
		type={submit ? 'submit' : 'button'}
		value={submit ? 'up' : undefined}
		variant='outline'>↑</Button>
	<Button
		aria-disabled={busy || undefined}
		aria-label={`Move ${name} down`}
		bind:element={down}
		class={styles.busy}
		disabled={index === count - 1}
		name={submit ? 'direction' : undefined}
		onclick={(event) => press('down', event)}
		size='icon'
		type={submit ? 'submit' : 'button'}
		value={submit ? 'down' : undefined}
		variant='outline'>↓</Button>
</div>
