<script
	lang='ts'>
	import '$lib/styles/global.css'
	import type { Snippet } from 'svelte'
	import { afterNavigate } from '$app/navigation'
	import { page } from '$app/state'
	import { ADMIN_NAVIGATION, live } from '$lib/components/admin'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import { skip } from '$lib/components/layout/SkipLink/SkipLink.css'
	import ThemeColor from '$lib/components/layout/ThemeColor'
	import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
	import { setLabels } from '$lib/labels/labels'
	import * as styles from '$lib/styles/admin.css'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import type { LayoutData } from './$types'

	let { children, data }: { children: Snippet; data: LayoutData } = $props()

	const navigationId = $props.id()
	let navigationOpen = $state(false)

	setLabels(() => DEFAULT_LABELS)

	afterNavigate(() => {
		navigationOpen = false
	})

	const isActive = (href: string) =>
		href === '/admin' ? page.url.pathname === '/admin' : page.url.pathname.startsWith(href)
</script>

<ThemeColor />

<div
	class={styles.shell}
	data-sveltekit-preload-data='tap'>
	{#if data.admin}
		<a
			class={skip}
			href='#admin-main'><Text
				tone='inherit'
				variant='button'>Skip to content</Text></a>
		<div
			class={styles.frame}>
			<header
				class={styles.sidebar}>
				<div
					class={styles.sidebarHeader}>
					<Text
						class={styles.brand}
						variant='title'>{data.name || 'Admin'}</Text>
					<Button
						aria-controls={navigationId}
						aria-expanded={navigationOpen}
						class={styles.navigationToggle}
						onclick={() => (navigationOpen = !navigationOpen)}
						size='admin'
						variant='outline'>Menu</Button>
				</div>
				<nav
					aria-label='Admin'
					class={styles.navigation}
					data-open={navigationOpen || undefined}
					id={navigationId}>
					{#each ADMIN_NAVIGATION as group (group.title)}
						<div
							class={styles.navigationGroup}>
							{#if group.title}
								<Text
									class={styles.navigationGroupTitle}
									tone='muted'
									variant='label'>{group.title}</Text>
							{/if}
							{#each group.links as link (link.href)}
								<a
									aria-current={isActive(link.href) ? 'page' : undefined}
									class={[styles.sidebarLink, isActive(link.href) && styles.sidebarLinkActive]}
									href={link.href}><Text
										tone='inherit'
										variant='machine'>{link.label}</Text></a
								>
							{/each}
						</div>
					{/each}
				</nav>
				<div
					class={styles.sidebarFooter}
					data-open={navigationOpen || undefined}>
					<a
						class={styles.sidebarLink}
						href='/'
						rel='noopener'
						target='_blank'><Text
							tone='inherit'
							variant='machine'>View Site <span
								aria-hidden='true'>↗</span><span
								class={screenReaderOnly}> (opens in new tab)</span></Text></a
					>
					<form
						action='/admin/logout'
						method='POST'>
						<button
							class={styles.navigationButton}
							type='submit'><Text
								tone='inherit'
								variant='machine'>Sign out</Text></button>
						<button
							class={styles.navigationButton}
							name='scope'
							type='submit'
							value='all'><Text
								tone='inherit'
								variant='machine'>Sign out everywhere</Text></button>
					</form>
				</div>
			</header>
			<main
				class={styles.main}
				id='admin-main'
				tabindex='-1'>
				{@render children()}
			</main>
		</div>
		<div
			class={screenReaderOnly}
			role='status'>{live.message}</div>
	{:else}
		<main
			class={styles.main}
			id='admin-main'
			tabindex='-1'>
			{@render children()}
		</main>
	{/if}
</div>
