<script
	lang='ts'>
	import { onMount, tick } from 'svelte'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import MobileNavigation from '$lib/components/layout/MobileNavigation'
	import { getLabels } from '$lib/labels/labels'
	import { navigationLinkCurrent } from '$lib/styles/patterns.css'
	import { navigationLink } from '$lib/styles/recipes.css'
	import { headerHeightProperty } from '$lib/styles/rules'
	import type { Section, SiteSettings } from '$lib/types'
	import * as styles from './Header.css'

	let { settings, sections }: { settings: SiteSettings; sections: Section[] } = $props()

	const ACTIVE_BAND = '-30% 0px -60% 0px'
	const HERO_BAND = '-40% 0px 0px 0px'
	const BOTTOM_BAND = '0px 0px 2px 0px'

	const labels = $derived.by(getLabels())
	const navigationId = $props.id()
	const contact = $derived(sections.find((section) => section.id === 'contact'))

	let wide = $state(false)
	let menuOpen = $state(false)
	let current = $state('')
	let bar = $state<HTMLElement>()
	let menuButton = $state<HTMLButtonElement>()
	let mobileActions = $state<HTMLElement>()
	let primaryNavigation = $state<HTMLElement>()
	let focusInMobile = false

	onMount(() => {
		const targets = sections.map((section) => document.getElementById(section.id)).filter((element) => element !== null)
		if (!targets.length) return
		const lastId = targets.at(-1)?.id ?? ''
		let inBand = ''
		let inHero = false
		let atBottom = false
		const resolve = () => {
			current = inHero ? '' : atBottom ? lastId : inBand
		}
		const band = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) if (entry.isIntersecting) inBand = entry.target.id
				resolve()
			},
			{ rootMargin: ACTIVE_BAND }
		)
		const hero = new IntersectionObserver(
			([entry]) => {
				inHero = entry?.isIntersecting ?? false
				resolve()
			},
			{ rootMargin: HERO_BAND }
		)
		// The band alone misses a last section shorter than itself, so a fully visible footer settles on it.
		const bottom = new IntersectionObserver(
			([entry]) => {
				atBottom = entry?.isIntersecting ?? false
				resolve()
			},
			{ rootMargin: BOTTOM_BAND, threshold: 1 }
		)
		for (const target of targets) band.observe(target)
		const top = document.getElementById('top')
		if (top) hero.observe(top)
		const footer = document.querySelector('footer')
		if (footer) bottom.observe(footer)
		return () => {
			band.disconnect()
			hero.disconnect()
			bottom.disconnect()
		}
	})

	$effect(() => {
		if (!bar) return
		const element = bar
		const root = document.documentElement
		let measured = 0
		const observer = new ResizeObserver(() => {
			wide = !!primaryNavigation && getComputedStyle(primaryNavigation).display !== 'none'
			if (element.offsetHeight !== measured) {
				measured = element.offsetHeight
				root.style.setProperty(headerHeightProperty, `${measured}px`)
			}
		})
		observer.observe(element)
		return () => {
			observer.disconnect()
			root.style.removeProperty(headerHeightProperty)
		}
	})

	const inMobileControls = (node: Node) =>
		Boolean(mobileActions?.contains(node) || document.getElementById(navigationId)?.contains(node))

	$effect(() => {
		const onFocusIn = ({ target }: FocusEvent) => {
			focusInMobile = target instanceof Node && inMobileControls(target)
		}
		document.addEventListener('focusin', onFocusIn)
		return () => document.removeEventListener('focusin', onFocusIn)
	})

	$effect(() => {
		if (!wide) return
		menuOpen = false
		if (!focusInMobile) return
		focusInMobile = false
		const active = document.activeElement
		if (active && active !== document.body && !inMobileControls(active)) return
		primaryNavigation?.querySelector('a')?.focus()
	})

	$effect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	})

	$effect(() => {
		if (!menuOpen) return
		const mobileNavigation = document.getElementById(navigationId)
		const onFocusIn = ({ target }: FocusEvent) => {
			if (target instanceof Node && (bar?.contains(target) || mobileNavigation?.contains(target))) return
			menuOpen = false
		}
		document.addEventListener('focusin', onFocusIn)
		return () => document.removeEventListener('focusin', onFocusIn)
	})

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !menuOpen) return
		menuOpen = false
		menuButton?.focus()
	}

	async function navigated(id: string) {
		menuOpen = false
		await tick()
		document.getElementById(id)?.focus({ preventScroll: true })
	}
</script>

<svelte:window
	onkeydown={onKeydown} />

{#snippet contactButton()}
	{#if contact}
		<Button
			aria-current={current === contact.id ? 'location' : undefined}
			class={styles.contact}
			href={`/#${contact.id}`}
			size='navigation'
			variant='outline'>{contact.label}</Button>
	{/if}
{/snippet}

<header
	bind:this={bar}
	class={styles.bar}>
	<a
		aria-label={`${settings.name}, ${labels.homeLinkAria}`}
		class={styles.logo}
		href='/'>
		<Text
			class={styles.logoName}
			variant='title'>{settings.name}</Text>
		<Text
			aria-hidden='true'
			class={styles.logoMeta}
			tone='muted'
			variant='machine'>/ {settings.contactLocation.toLowerCase()}</Text>
	</a>

	<nav
		aria-label={labels.navigationPrimaryAria}
		bind:this={primaryNavigation}
		class={styles.navigationLinks}>
		{#each sections.filter((section) => section !== contact) as section (section.id)}
			<Text
				aria-current={current === section.id ? 'location' : undefined}
				as='a'
				class={[navigationLink, styles.link, current === section.id && navigationLinkCurrent]}
				href={`/#${section.id}`}
				variant='machine'>{section.label}</Text>
		{/each}
		{@render contactButton()}
	</nav>

	<div
		bind:this={mobileActions}
		class={styles.mobileActions}>
		{@render contactButton()}
		<button
			aria-controls={navigationId}
			aria-expanded={menuOpen}
			bind:this={menuButton}
			class={styles.menuButton}
			onclick={() => (menuOpen = !menuOpen)}
			type='button'>
			<span
				aria-hidden='true'>{menuOpen ? '✕' : '≡'}</span><Text
					variant='button'>{labels.menu}</Text>
		</button>
	</div>
</header>

<MobileNavigation
	{current}
	id={navigationId}
	onnavigate={navigated}
	open={menuOpen}
	{sections} />
