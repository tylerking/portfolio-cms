<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import { action } from '../shared.css'
	import * as styles from './NestedPopovers.css'

	interface Props {
		depth: string
		bars?: number
		framed?: boolean
		opens?: { target: string; name: string; capped: boolean }
		children?: Snippet
	}

	let { depth, bars = 3, framed = true, opens, children }: Props = $props()

	const labels = $derived.by(getLabels())
</script>

<div
	class={[styles.mirror, framed && styles.framed]}>
	<div
		class={styles.readout}><Text
			caps
			tone='inherit'
			variant='machine'>{depth}</Text></div>
	<div
		class={styles.body}>
		<div
			aria-hidden='true'
			class={styles.skeleton}>
			<span
				class={styles.dot}></span>
			<span
				class={styles.bar.title}></span>
			<span
				class={styles.bar.text}></span>
			{#if bars > 2}
				<span
					class={styles.bar.textShort}></span>
			{/if}
		</div>
		{@render children?.()}
	</div>
	{#if opens}
		<div
			class={action}>
			<Button
				aria-label={opens.name}
				class={opens.capped ? styles.cappedTrigger : undefined}
				popovertarget={opens.target}
				size='navigation'
				variant='outline'>
				{labels.figureMirrorOpen}
			</Button>
		</div>
	{/if}
</div>
