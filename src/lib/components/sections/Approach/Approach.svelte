<script
	lang='ts'>
	import List from '$lib/components/elements/List'
	import Text from '$lib/components/elements/Text'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { hairlineCell, hairlineGrid } from '$lib/styles/patterns.css'
	import type { ApproachStep } from '$lib/types'
	import * as styles from './Approach.css'

	interface Props {
		heading: string
		intro: string
		count: string
		steps: ApproachStep[]
	}

	let { heading, intro, count, steps }: Props = $props()
</script>

<SectionHeader
	{count}
	{heading}
	{intro}
	introClass={styles.intro} />

<List
	as='ol'
	class={[hairlineGrid, styles.list]}>
	{#each steps as step (step.id)}
		<li
			class={[hairlineCell, styles.cell]}>
			<Text
				as='h3'
				class={styles.title}
				variant='title'>{step.title}</Text>
			<Text
				as='div'
				class={styles.body}
				tone='muted'>{step.description}</Text>
		</li>
	{/each}
</List>
