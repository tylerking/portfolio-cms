<script
	lang='ts'>
	import { page } from '$app/state'
	import { AdminPage } from '$lib/components/admin'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'

	const TITLES: Record<number, string> = {
		403: 'Not allowed',
		404: 'Page not found'
	}

	const title = $derived(`${TITLES[page.status] ?? 'Something went wrong'} (${page.status})`)
</script>

<AdminPage
	{title}>
	<Text
		as='p'
		class={styles.narrowText}
		tone='muted'
		variant='machine'>{page.error?.message ?? 'Something went wrong.'}</Text>
	{#if page.error?.id}
		<Text
			as='p'
			tone='muted'
			variant='machine'>Reference {page.error.id}</Text>
	{/if}
	<Button
		href='/admin'
		size='admin'
		variant='outline'>Back to dashboard</Button>
</AdminPage>
