<script
	lang='ts'>
	import { onMount } from 'svelte'
	import { getLabels } from '$lib/labels/labels'
	import { supportsPopover } from '$lib/utils/detect'
	import { containInStage, focusOnOpen } from './contain'
	import MirrorLevel from './MirrorLevel.svelte'
	import * as styles from './NestedPopovers.css'

	let { supported = $bindable(true) }: { supported?: boolean } = $props()

	const LEVELS = 3
	const FIRST_POPOVER = 2

	const labels = $derived.by(getLabels())
	const baseId = $props.id()
	const panel = (levelNumber: number) => `${baseId}-${levelNumber}`
	const fill = (copy: string, levelNumber: number) =>
		copy.replace('{number}', String(levelNumber)).replace('{total}', String(LEVELS))
	const depth = (levelNumber: number) => fill(labels.figureMirrorDepth, levelNumber)
	const opens = (levelNumber: number) => ({
		target: panel(levelNumber),
		name: fill(labels.figureMirrorAria, levelNumber),
		capped: levelNumber === LEVELS
	})

	onMount(() => {
		supported = supportsPopover()
	})
</script>

<!--
	The nesting is load-bearing: a popover's ancestor chain comes from DOM containment, so
	flattening these into siblings makes opening a child close its parent.
-->
{#snippet level(levelNumber: number)}
	<div
		aria-label={depth(levelNumber)}
		{@attach containInStage}
		{@attach focusOnOpen}
		class={styles.level[levelNumber - FIRST_POPOVER]}
		id={panel(levelNumber)}
		popover='auto'
		role='dialog'
		tabindex='-1'>
		{#if levelNumber < LEVELS}
			<MirrorLevel
				depth={depth(levelNumber)}
				opens={opens(levelNumber + 1)} />
			{@render level(levelNumber + 1)}
		{:else}
			<MirrorLevel
				bars={2}
				depth={depth(levelNumber)} />
		{/if}
	</div>
{/snippet}

{#if supported}
	<MirrorLevel
		depth={depth(1)}
		framed={false}
		opens={opens(FIRST_POPOVER)} />
	{@render level(FIRST_POPOVER)}
{:else}
	<MirrorLevel
		depth={depth(1)}>
		<div
			class={styles.inset}>
			<MirrorLevel
				depth={depth(2)}>
				<div
					class={styles.inset}>
					<MirrorLevel
						bars={2}
						depth={depth(LEVELS)} />
				</div>
			</MirrorLevel>
		</div>
	</MirrorLevel>
{/if}
