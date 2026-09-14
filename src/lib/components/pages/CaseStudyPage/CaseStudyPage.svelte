<script
	lang='ts'>
	import Seo from '$lib/components/layout/Seo'
	import CaseArticle from '$lib/components/sections/CaseArticle'
	import type { CaseNavigation, CaseStudy, SiteSettings } from '$lib/types'

	let { study, settings, navigation }: { study: CaseStudy; settings: SiteSettings; navigation: CaseNavigation } = $props()

	const article = $derived({
		'@type': 'Article',
		headline: study.title,
		description: study.summary,
		datePublished: study.createdAt.toISOString(),
		dateModified: study.updatedAt.toISOString(),
		author: { '@type': 'Person', name: settings.name }
	})
</script>

<Seo
	description={study.summary}
	siteName={settings.name}
	structuredData={article}
	title={`${study.title} · ${settings.name}`}
	type='article' />

<CaseArticle
	{navigation}
	{study} />
