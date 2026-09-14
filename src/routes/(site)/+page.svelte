<script
	lang='ts'>
	import HomePage from '$lib/components/pages/HomePage'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<HomePage
	{data}
	{form} />
