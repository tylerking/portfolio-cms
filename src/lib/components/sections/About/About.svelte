<script
	lang='ts'>
	import Disclosure from '$lib/components/elements/Disclosure'
	import Text from '$lib/components/elements/Text'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { getLabels } from '$lib/labels/labels'
	import { hairlineCell, hairlineGrid } from '$lib/styles/patterns.css'
	import type { SkillGroup } from '$lib/types'
	import * as styles from './About.css'

	interface Props {
		heading: string
		lead: string
		paragraphs: string[]
		skillGroups: SkillGroup[]
	}

	let { heading, lead, paragraphs, skillGroups }: Props = $props()

	const labels = $derived.by(getLabels())
</script>

<SectionHeader
	{heading} />
<div
	class={styles.columns}>
	<Text
		as='p'
		tone='muted'
		variant='lead'>{lead}</Text>
	<div
		class={styles.stack}>
		{#each paragraphs as paragraph, paragraphIndex (paragraphIndex)}
			<Text
				as='p'
				class={styles.paragraph}
				tone='muted'
				variant='lead'>{paragraph}</Text>
		{/each}
	</div>
</div>

<Disclosure
	less={labels.skillsLess}
	more={labels.skillsMore}
	preview={3}
	total={skillGroups.length}>
	{#snippet children({ id, fold })}
		<div
			class={[hairlineGrid, styles.skills]}
			{id}>
			{#each skillGroups as group, index (group.id)}
				<div
					class={[hairlineCell, styles.cell, fold(index)]}>
					<Text
						as='h3'
						class={styles.skillLabel}
						tone='muted'
						variant='label'>{group.title}</Text>
					<Text
						as='div'
						class={styles.skillItems}>{group.description}</Text>
				</div>
			{/each}
		</div>
	{/snippet}
</Disclosure>
