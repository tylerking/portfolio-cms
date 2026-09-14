<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { FIGURES, type Figure } from '$lib/components/exhibits'
	import ExhibitFigure from '$lib/components/exhibits/ExhibitFigure'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { getLabels } from '$lib/labels/labels'
	import { ledgerList } from '$lib/styles/patterns.css'
	import type { Exhibit } from '$lib/types'
	import { padTwoDigits } from '$lib/utils/format'
	import { revealOnScroll } from '$lib/utils/reveal'
	import * as styles from './Exhibits.css'

	interface Props {
		heading: string
		intro: string
		exhibits: Exhibit[]
		count: string
	}

	let { heading, intro, exhibits, count }: Props = $props()

	const labels = $derived.by(getLabels())

	interface Row {
		exhibit: Exhibit
		figure?: Figure
		stamp: string
	}

	const rows = $derived<Row[]>([
		...FIGURES.flatMap((figure, index) => {
			const exhibit = exhibits.find((candidate) => candidate.slug === figure.slug)
			return exhibit ? [{ exhibit, figure, stamp: `${labels.figurePrefix}${padTwoDigits(index + 1)}` }] : []
		}),
		...exhibits
			.filter((exhibit) => !FIGURES.some((figure) => figure.slug === exhibit.slug))
			.map((exhibit) => ({ exhibit, stamp: '' }))
	])
</script>

<SectionHeader
	{count}
	{heading}
	{intro}
	introClass={styles.intro} />

<div
	class={ledgerList}>
	{#each rows as { exhibit, figure, stamp }, index (exhibit.id)}
		{@const flipped = !!figure && index % 2 === 1}
		<div
			{@attach revealOnScroll}
			class={[styles.row, styles.reveal, !figure && styles.rowTextOnly, flipped && styles.rowFlipped]}>
			<div
				class={styles.text}>
				<Text
					as='h3'
					class={styles.title}
					variant='title'>{exhibit.title}</Text>
				<Text
					as='p'
					class={styles.summary}
					tone='muted'>{exhibit.description}</Text>
			</div>
			{#if figure}
				<div
					class={[styles.figure, flipped && styles.figureFirst]}>
					<ExhibitFigure
						{figure}
						{stamp} />
				</div>
			{/if}
		</div>
	{/each}
</div>
