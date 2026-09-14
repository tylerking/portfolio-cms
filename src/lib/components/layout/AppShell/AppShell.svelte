<script
	lang='ts'>
	import '$lib/styles/global.css'
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
	import { prefersReducedMotion } from 'svelte/motion'
	import { afterNavigate, onNavigate } from '$app/navigation'
	import { navigating } from '$app/state'
	import Footer from '$lib/components/layout/Footer'
	import Header from '$lib/components/layout/Header'
	import SkipLink from '$lib/components/layout/SkipLink'
	import ThemeColor from '$lib/components/layout/ThemeColor'
	import { setLabels } from '$lib/labels/labels'
	import type { Section, SiteSettings } from '$lib/types'
	import { supportsViewTransitions } from '$lib/utils/detect'
	import { initClickTracking, trackPageview } from '$lib/utils/track'
	import { morphsTitle } from '$lib/utils/transition'
	import { progress, root } from './AppShell.css'

	interface Props {
		settings: SiteSettings
		sections: Section[]
		children: Snippet
	}

	let { settings, sections, children }: Props = $props()

	setLabels(() => settings.labels)

	onMount(() => initClickTracking(settings.resumeUrl))

	onNavigate((navigation) => {
		if (!morphsTitle(navigation.from?.url.pathname, navigation.to?.url.pathname)) return
		if (prefersReducedMotion.current || !supportsViewTransitions()) return
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})

	afterNavigate((navigation) => {
		trackPageview(navigation.to?.url.pathname ?? location.pathname, navigation.type === 'enter' ? document.referrer : '')
	})
</script>

<ThemeColor />

<div
	class={root}>
	<SkipLink />
	{#if navigating.to}
		<div
			aria-hidden='true'
			class={progress}></div>
	{/if}
	<Header
		{sections}
		{settings} />
	{@render children()}
	<Footer
		{settings} />
</div>
