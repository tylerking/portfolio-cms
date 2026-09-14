<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import AppShell from '$lib/components/layout/AppShell'
	import type { LayoutData } from './$types'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()
</script>

<AppShell
	sections={data.home?.sections ?? []}
	settings={data.settings}>
	{@render children()}
</AppShell>
