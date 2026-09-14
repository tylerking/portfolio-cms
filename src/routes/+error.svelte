<script
	lang='ts'>
	import { page } from '$app/state'
	import ThemeColor from '$lib/components/layout/ThemeColor'
	import ErrorPage from '$lib/components/pages/ErrorPage'
	import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
	import { setLabels } from '$lib/labels/labels'
	import '$lib/styles/global.css'
	import { pageSurface } from '$lib/styles/patterns.css'

	setLabels(() => DEFAULT_LABELS)
</script>

<ThemeColor />

<div
	class={pageSurface}>
	<ErrorPage
		status={page.status} />
</div>
