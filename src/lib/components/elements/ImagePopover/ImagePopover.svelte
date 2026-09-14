<script
	lang='ts'>
	import type { ClassValue } from 'svelte/elements'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import * as styles from './ImagePopover.css'

	interface Item {
		src: string
		srcset?: string
		name: string
		alt?: string
		caption?: string
	}

	interface Props {
		width: number
		height: number
		src?: string
		srcset?: string
		sizes?: string
		name?: string
		alt?: string
		caption?: string
		items?: Item[]
		index?: number
		open?: boolean
		id?: string
		imageClass?: string
		class?: ClassValue
	}

	let {
		width,
		height,
		src,
		srcset,
		sizes,
		name,
		alt,
		caption,
		items,
		index = $bindable(0),
		open = $bindable(false),
		id,
		imageClass,
		class: className
	}: Props = $props()

	const FULL_SIZES = 'min(92vw, 1100px)'

	const labels = $derived.by(getLabels())
	const ownId = $props.id()
	const panelId = $derived(id ?? ownId)

	const list = $derived<Item[]>(items ?? (src && name ? [{ src, srcset, name, alt, caption }] : []))
	const last = $derived(Math.max(list.length - 1, 0))
	const at = $derived(Math.min(Math.max(index, 0), last))
	const item = $derived(list[at])
	const many = $derived(list.length > 1)
	const openName = $derived(`${labels.popoverOpen}: ${item?.name ?? ''}`)
	const position = $derived(
		labels.popoverPosition.replace('{number}', String(at + 1)).replace('{total}', String(list.length))
	)

	let dialog = $state<HTMLDialogElement>()

	$effect(() => {
		if (open && dialog && !dialog.open) dialog.showModal()
	})

	const go = (step: number) => {
		index = Math.min(Math.max(at + step, 0), last)
	}

	function behave(node: HTMLDialogElement) {
		const onKey = (event: KeyboardEvent) => {
			if (!many) return
			if (event.key === 'ArrowRight') go(1)
			else if (event.key === 'ArrowLeft') go(-1)
			else return
			event.preventDefault()
		}
		const onClick = (event: MouseEvent) => {
			if (event.target !== node) return
			const bounds = node.getBoundingClientRect()
			const inside =
				event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom
			if (!inside) node.close()
		}
		node.addEventListener('keydown', onKey)
		node.addEventListener('click', onClick)
		return () => {
			node.removeEventListener('keydown', onKey)
			node.removeEventListener('click', onClick)
		}
	}
</script>

{#if !items && item}
	<button
		aria-label={openName}
		class={[styles.trigger, className]}
		command='show-modal'
		commandfor={panelId}
		onclick={() => (open = true)}
		type='button'>
		<img
			alt=''
			class={imageClass}
			decoding='async'
			{height}
			loading='lazy'
			{sizes}
			src={item.src}
			srcset={item.srcset}
			{width} />
	</button>
{/if}
<dialog
	{@attach behave}
	aria-label={item?.name}
	bind:this={dialog}
	class={styles.panel}
	closedby='any'
	id={panelId}
	onclose={() => (open = false)}
	ontoggle={(event) => (open = event.newState === 'open')}>
	<div
		class={styles.bar}>
		<Text
			aria-live='polite'
			tone='muted'
			variant='machine'>{item?.name ?? ''}{#if many}<span
					class={styles.position}>{` · ${position}`}</span>{/if}</Text>
		<form
			method='dialog'>
			<Button
				class={styles.close}
				size='small'
				type='submit'
				variant='outline'>{labels.popoverClose}</Button>
		</form>
	</div>
	<div
		class={[styles.stage, many && styles.gallery]}>
		{#if many}
			<Button
				aria-disabled={at === 0 || undefined}
				aria-label={labels.popoverPrevious}
				class={[styles.step, styles.previous]}
				onclick={() => go(-1)}
				size='small'
				variant='outline'>←</Button>
		{/if}
		{#if item}
			<img
				alt={item.alt ?? ''}
				class={[styles.image, many && styles.galleryImage]}
				decoding='async'
				{height}
				loading='lazy'
				sizes={FULL_SIZES}
				src={item.src}
				srcset={item.srcset}
				style:aspect-ratio={`${width} / ${height}`}
				{width} />
		{/if}
		{#if many}
			<Button
				aria-disabled={at === last || undefined}
				aria-label={labels.popoverNext}
				class={[styles.step, styles.next]}
				onclick={() => go(1)}
				size='small'
				variant='outline'>→</Button>
		{/if}
	</div>
	{#if item?.caption}
		<Text
			as='p'
			class={styles.caption}
			tone='muted'>{item.caption}</Text>
	{/if}
</dialog>
