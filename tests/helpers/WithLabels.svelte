<script
	generics='ComponentProps extends Record<string, unknown>'
	lang='ts'>
	import type { Component } from 'svelte'
	import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
	import { setLabels } from '$lib/labels/labels'

	let { component: Inner, props }: { component: Component<ComponentProps>; props: ComponentProps } = $props()

	setLabels(() => DEFAULT_LABELS)
</script>

<Inner
	{...props} />
