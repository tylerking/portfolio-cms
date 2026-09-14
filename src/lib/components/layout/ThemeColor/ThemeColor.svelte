<script
	lang='ts'>
	import { themeBackground } from '$lib/styles/theme.css'
</script>

<svelte:head>
	<meta
		content={themeBackground.dark}
		media='(prefers-color-scheme: dark)'
		name='theme-color' />
	<meta
		content={themeBackground.light}
		media='(prefers-color-scheme: light)'
		name='theme-color' />
</svelte:head>
