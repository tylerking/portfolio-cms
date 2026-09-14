<script
	lang='ts'>
	import { page } from '$app/state'

	interface Props {
		title: string
		description: string
		siteName: string
		type: 'website' | 'article'
		structuredData: Record<string, unknown>
	}

	let { title, description, siteName, type, structuredData }: Props = $props()

	const url = $derived(`${page.url.origin}${page.url.pathname}`)
	const jsonLd = $derived(
		JSON.stringify({ '@context': 'https://schema.org', url, ...structuredData }).replace(/</g, '\\u003c')
	)
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		content={description}
		name='description' />
	<link
		href={url}
		rel='canonical' />
	<meta
		content={type}
		property='og:type' />
	<meta
		content={url}
		property='og:url' />
	<meta
		content={siteName}
		property='og:site_name' />
	<meta
		content={title}
		property='og:title' />
	<meta
		content={description}
		property='og:description' />
	<meta
		content='summary'
		name='twitter:card' />
	<meta
		content={title}
		name='twitter:title' />
	<meta
		content={description}
		name='twitter:description' />
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
