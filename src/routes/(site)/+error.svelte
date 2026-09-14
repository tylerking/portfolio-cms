<script
	lang='ts'>
	import { page } from '$app/state'
	import ErrorPage from '$lib/components/pages/ErrorPage'
</script>

<ErrorPage
	status={page.status} />
