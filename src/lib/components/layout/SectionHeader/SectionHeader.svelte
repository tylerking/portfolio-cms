<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { balanced, sectionIntro } from '$lib/styles/patterns.css'
	import * as styles from './SectionHeader.css'

	interface Props {
		heading: string
		count?: string
		intro?: string
		introClass?: string
	}

	let { heading, count, intro, introClass = sectionIntro }: Props = $props()
</script>

<div
	class={styles.header}>
	<Text
		as='h2'
		class={balanced}
		variant='display'>{heading}</Text>
	{#if count}
		<Text
			class={styles.count}
			tone='muted'
			variant='machine'>{count}</Text>
	{/if}
</div>
{#if intro}
	<Text
		as='p'
		class={introClass}
		tone='muted'
		variant='lead'>{intro}</Text>
{/if}
