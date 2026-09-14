<script
	lang='ts'>
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import MetaBlock from '$lib/components/elements/MetaBlock'
	import Text from '$lib/components/elements/Text'
	import ULink from '$lib/components/elements/ULink'
	import { getLabels } from '$lib/labels/labels'
	import type { CaseNavigation, CaseStudy, ShownFigure } from '$lib/types'
	import { morphName } from '$lib/utils/transition'
	import * as styles from './CaseArticle.css'
	import CaseBlock from './CaseBlock.svelte'
	import CaseFigures from './CaseFigures.svelte'

	let { study, navigation }: { study: CaseStudy; navigation: CaseNavigation } = $props()

	const labels = $derived.by(getLabels())
	const figuresHeading = $props.id()

	const eyebrow = $derived(
		`${labels.caseStamp} ${navigation.index + 1} / ${navigation.total}${study.year ? ` · ${study.year}` : ''}`
	)
	const meta = $derived([...study.meta, ...(study.year ? [{ label: labels.caseYear, value: study.year }] : [])])
	const figures = $derived(study.figures.filter((figure): figure is ShownFigure => figure.key !== null))
</script>

<main
	id='main-content'
	tabindex='-1'>
	<div
		class={styles.page}>
		<div
			class={styles.grid}>
			<CaseBlock
				padding='header'>
				<ULink
					class={styles.back}
					href='/#case-studies'
					tone='muted'><ArrowLabel
						text={labels.allCases} /></ULink>
				<Text
					class={styles.eyebrow}
					tone='muted'
					variant='label'>{eyebrow}</Text>
				<Text
					as='h1'
					class={styles.heading}
					style={`view-transition-name: ${morphName(study.slug)}`}
					variant='display'>{study.title}</Text>
				<Text
					as='p'
					class={styles.lead}
					tone='muted'
					variant='lead'>{study.summary}</Text>
				<MetaBlock
					class={styles.meta}
					rows={meta} />
			</CaseBlock>

			{#each study.sections as section, sectionIndex (sectionIndex)}
				<CaseBlock
					padding='block'
					ruled
					tag={section.tag}>
					<Text
						as='h2'
						class={styles.subheading}
						variant='title'>{section.heading}</Text>
					{#each section.paragraphs as paragraph, paragraphIndex (paragraphIndex)}
						<Text
							as='p'
							class={styles.paragraph}>{paragraph}</Text>
					{/each}
				</CaseBlock>
			{/each}

			{#if figures.length}
				<CaseBlock
					padding='block'
					ruled>
					<section
						aria-labelledby={figuresHeading}>
						<CaseFigures
							{figures}
							headingId={figuresHeading} />
					</section>
				</CaseBlock>
			{/if}

			<CaseBlock
				padding='footer'
				ruled>
				<div
					class={styles.pager}>
					<div
						class={[styles.pagerPrevious, !navigation.previous && styles.pagerEmpty]}>
						{#if navigation.previous}
							<Text
								tone='muted'
								variant='label'>{labels.casePrevious}</Text>
							<ULink
								href={`/case-studies/${navigation.previous.slug}`}>{navigation.previous.title}</ULink>
						{/if}
					</div>
					<div
						class={[styles.pagerNext, !navigation.next && styles.pagerEmpty]}>
						{#if navigation.next}
							<Text
								tone='muted'
								variant='label'>{labels.caseNext}</Text>
							<ULink
								href={`/case-studies/${navigation.next.slug}`}>{navigation.next.title}</ULink>
						{/if}
					</div>
				</div>
			</CaseBlock>
		</div>
	</div>
</main>
