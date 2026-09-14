<script
	generics='Item extends Record<"id", number>'
	lang='ts'>
	import { type Snippet, tick } from 'svelte'
	import { enhance } from '$app/forms'
	import { invalidateAll } from '$app/navigation'
	import List from '$lib/components/elements/List'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { moveItem } from '$lib/utils/array'
	import { announce } from '../announcer.svelte'
	import MoveButtons from '../MoveButtons'

	interface Props {
		items: Item[]
		label: (item: Item) => string
		action?: string
		row: Snippet<[Item, number]>
	}

	let { items, label, action = '?/reorder', row }: Props = $props()

	const HINT = 'Reorder by dragging the handle or with the Move buttons. Order saves automatically.'
	const sortableId = $props.id()

	let order = $derived<Item[]>([...items])

	let form: HTMLFormElement
	let orderJson = $state('[]')
	let notice = $state(HINT)
	let saving = $state(false)
	let armed = $state<number | null>(null)
	let dragging = $state<number | null>(null)
	let over = $state<number | null>(null)
	let moved: { name: string; from: number; to: number } | null = null

	async function move(from: number, to: number) {
		if (saving || from === to || to < 0 || to >= order.length) return
		const item = order[from]
		moved = item ? { name: label(item), from, to } : null
		order = moveItem(order, from, to)
		orderJson = JSON.stringify(order.map((entry) => entry.id))
		saving = true
		// The hidden input must carry the new order before the form submits.
		await tick()
		form.requestSubmit()
	}

	function outcome(saved: boolean) {
		const count = order.length
		if (!moved) return saved ? 'Order saved.' : 'Could not save order.'
		return saved
			? `Moved ${moved.name} to position ${moved.to + 1} of ${count}. Order saved.`
			: `Could not save the new order. ${moved.name} is back at position ${moved.from + 1} of ${count}.`
	}

	function onDragStart(event: DragEvent, index: number) {
		dragging = index
		event.dataTransfer?.setData('text/plain', String(index))
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
	}

	function onDrop(event: DragEvent, index: number) {
		event.preventDefault()
		if (dragging !== null) move(dragging, index)
		dragging = null
		over = null
	}
</script>

<form
	{action}
	bind:this={form}
	method='POST'
	use:enhance={() =>
		async ({ result }) => {
			const saved = result.type === 'success'
			const reverted = !saved && moved && document.activeElement?.closest(`[data-sortable="${sortableId}"]`) ? order[moved.to]?.id : undefined
			notice = saved ? 'Order saved.' : 'Could not save order.'
			announce(outcome(saved))
			moved = null
			await invalidateAll()
			saving = false
			if (reverted === undefined) return
			await tick()
			document.querySelector<HTMLElement>(`[data-sortable="${sortableId}"][data-item="${reverted}"] button:not(:disabled)`)?.focus()
		}}>
	<input
		name='order'
		type='hidden'
		value={orderJson} />
</form>

{#if order.length === 0}
	<Text
		as='p'
		class={styles.empty}
		tone='muted'
		variant='machine'>Nothing here yet. Add the first entry above.</Text>
{:else}
	<Text
		as='p'
		class={styles.hint}
		tone='muted'
		variant='machine'>{notice}</Text>
{/if}

<List>
	{#each order as item, index (item.id)}
		<li
			class={[styles.dragRow, dragging === index && styles.dragging, over === index && dragging !== null && dragging !== index && styles.dropBefore]}
			data-item={item.id}
			data-row
			data-sortable={sortableId}
			draggable={armed === index}
			ondragend={() => {
				dragging = null
				over = null
				armed = null
			}}
			ondragleave={() => (over = null)}
			ondragover={(event) => {
				event.preventDefault()
				over = index
			}}
			ondragstart={(event) => onDragStart(event, index)}
			ondrop={(event) => onDrop(event, index)}>
			<div
				class={styles.dragRail}>
				<span
					aria-hidden='true'
					class={styles.dragHandle}
					onpointerdown={() => (armed = index)}
					onpointerup={() => (armed = null)}
					title='Drag to reorder'>⋮⋮</span
				>
				<MoveButtons
					busy={saving}
					count={order.length}
					{index}
					name={label(item)}
					onmove={move}
					silent />
			</div>
			<Text
				as='div'
				class={styles.dragBody}>
				{@render row(item, index)}
			</Text>
		</li>
	{/each}
</List>
