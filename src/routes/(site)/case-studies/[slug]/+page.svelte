<script
	lang='ts'>
	import CaseStudyPage from '$lib/components/pages/CaseStudyPage'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<CaseStudyPage
	navigation={data.navigation}
	settings={data.settings}
	study={data.study} />
