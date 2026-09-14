<script
	lang='ts'>
	import { afterNavigate, onNavigate } from '$app/navigation'
	import Chip from '$lib/components/elements/Chip'
	import Disclosure from '$lib/components/elements/Disclosure'
	import Text from '$lib/components/elements/Text'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { getLabels } from '$lib/labels/labels'
	import { balanced, breakable, ledgerList } from '$lib/styles/patterns.css'
	import { rowHover } from '$lib/styles/recipes.css'
	import type { CaseStudy } from '$lib/types'
	import { caseSlug, morphName } from '$lib/utils/transition'
	import * as styles from './CaseStudies.css'

	interface Props {
		heading: string
		intro: string
		cases: CaseStudy[]
		count: string
	}

	let { heading, intro, cases, count }: Props = $props()

	const labels = $derived.by(getLabels())
	const TAGS_SHOWN = 3

	let morphing = $state<string | null>(null)

	onNavigate(({ to }) => {
		morphing = caseSlug(to?.url.pathname)
	})

	afterNavigate(({ from }) => {
		morphing = caseSlug(from?.url.pathname)
	})
</script>

<SectionHeader
	{count}
	{heading}
	{intro} />

<Disclosure
	less={labels.casesLess}
	more={labels.casesMore}
	preview={4}
	total={cases.length}>
	{#snippet children({ id, fold })}
		<div
			class={ledgerList}
			{id}>
			{#each cases as caseStudy, index (caseStudy.id)}
				<div
					class={[rowHover, styles.row, fold(index)]}>
					<div
						class={breakable}>
						<Text
							as='h3'
							class={balanced}
							variant='title'><a
								class={styles.link}
								href={`/case-studies/${caseStudy.slug}`}
								style:view-transition-name={morphing === caseStudy.slug ? morphName(caseStudy.slug) : undefined}>{caseStudy.title}</a></Text>
						<Text
							as='div'
							class={styles.outcome}
							tone='muted'>{caseStudy.summary}</Text>
					</div>
					<div
						class={styles.meta}>
						<Text
							tone='muted'
							variant='numeral'>{caseStudy.year}</Text>
						<div
							class={styles.tags}>
							{#each caseStudy.tags.slice(0, TAGS_SHOWN) as tag (tag)}
								<Chip>{tag}</Chip>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/snippet}
</Disclosure>
