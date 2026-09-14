<script
	lang='ts'>
	import { AdminPage, EntryList } from '$lib/components/admin'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<AdminPage
	title='Case Studies'>
	<EntryList
		basePath='/admin/case-studies'
		items={data.cases}
		meta={(study) => study.year}
		noun='Case Study'
		result={form} />
</AdminPage>
