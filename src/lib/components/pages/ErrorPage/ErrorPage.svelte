<script
	lang='ts'>
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import * as styles from './ErrorPage.css'

	let { status }: { status: number } = $props()

	const labels = $derived.by(getLabels())
	const notFound = $derived(status === 404)
	const title = $derived(notFound ? labels.errorTitle : labels.errorServerTitle)
	const body = $derived(notFound ? labels.errorBody : labels.errorServerBody)
	const routes = $derived([
		{ href: '/#case-studies', label: labels.errorCases },
		{ href: '/#exhibits', label: labels.errorExhibits },
		{ href: '/#contact', label: labels.errorContact }
	])
</script>

<svelte:head>
	<title>{status} · {title}</title>
</svelte:head>

<main
	class={styles.main}
	id='main-content'
	tabindex='-1'>
	<Text
		as='div'
		class={styles.code}
		variant='numeral'>{status}</Text>
	<Text
		as='h1'
		class={styles.heading}
		variant='display'>{title}</Text>
	<Text
		as='p'
		class={styles.lead}>{body}</Text>
	<Button
		href='/'
		size='back'
		variant='outline'><ArrowLabel
			text={labels.errorHome} /></Button>
	<nav
		aria-label={labels.errorRoutesAria}
		class={styles.routes}>
		{#each routes as route (route.href)}
			<Text
				as='a'
				class={styles.route}
				href={route.href}
				variant='machine'><ArrowLabel
					text={route.label} /></Text>
		{/each}
	</nav>
</main>
