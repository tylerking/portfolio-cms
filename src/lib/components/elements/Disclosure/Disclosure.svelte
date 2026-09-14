<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import { tick } from 'svelte'
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import Text from '$lib/components/elements/Text'
	import * as styles from './Disclosure.css'

	interface Props {
		total: number
		preview: number
		more: string
		less: string
		children: Snippet<[{ id: string; fold: (index: number) => string }]>
	}

	let { total, preview, more, less, children }: Props = $props()

	const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]'

	const id = $props.id()
	const folds = $derived(total > preview)
	let expanded = $state(false)

	const fold = (index: number) => (folds && !expanded && index >= preview ? styles.folded : '')

	async function toggle(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		expanded = !expanded
		if (!expanded) {
			event.currentTarget.scrollIntoView({ block: 'center' })
			return
		}
		await tick()
		const first = document.getElementById(id)?.children[preview]
		if (!(first instanceof HTMLElement)) return
		const target = first.matches(FOCUSABLE) ? first : first.querySelector<HTMLElement>(FOCUSABLE)
		if (target) return target.focus()
		first.tabIndex = -1
		first.focus()
	}
</script>

{@render children({ id, fold })}
{#if folds}
	<button
		aria-controls={id}
		aria-expanded={expanded}
		class={styles.toggle}
		onclick={toggle}
		type='button'>
		<Text
			variant='button'><ArrowLabel
				text={expanded ? less : more} /></Text>
	</button>
{/if}
