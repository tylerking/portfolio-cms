<script
	lang='ts'>
	import { onMount, type Snippet } from 'svelte'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { announce } from '../announcer.svelte'

	interface Props {
		title: string
		eyebrow?: string
		notice?: string
		links?: Snippet
		children: Snippet
	}

	let { title, eyebrow, notice, links, children }: Props = $props()

	onMount(() => {
		if (notice) announce(notice)
	})
</script>

<svelte:head><title>{title} · Admin</title></svelte:head>

<div
	class={styles.page}>
	{#if eyebrow || links}
		<div
			class={styles.pageHeader}>
			<div>
				{#if eyebrow}
					<Text
						class={styles.eyebrow}
						tone='muted'
						variant='label'>{eyebrow}</Text>
				{/if}
				<Text
					as='h1'
					variant='display'>{title}</Text>
			</div>
			{#if links}
				<div
					class={styles.headerLinks}>{@render links()}</div>
			{/if}
		</div>
	{:else}
		<Text
			as='h1'
			class={styles.pageHeading}
			variant='display'>{title}</Text>
	{/if}
	{#if notice}
		<Text
			as='p'
			class={styles.notice}
			variant='machine'>{notice}</Text>
	{/if}
	{@render children()}
</div>
