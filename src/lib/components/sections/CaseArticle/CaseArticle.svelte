<script
	lang='ts'>
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import ImagePopover from '$lib/components/elements/ImagePopover'
	import MetaBlock from '$lib/components/elements/MetaBlock'
	import Text from '$lib/components/elements/Text'
	import ULink from '$lib/components/elements/ULink'
	import { getLabels } from '$lib/labels/labels'
	import { picture } from '$lib/media'
	import { breakpoint, layout } from '$lib/styles/tokens'
	import type { CaseNavigation, CaseStudy } from '$lib/types'
	import { morphName } from '$lib/utils/transition'
	import * as styles from './CaseArticle.css'
	import CaseBlock from './CaseBlock.svelte'
	import CaseFigures from './CaseFigures.svelte'

	let { study, navigation }: { study: CaseStudy; navigation: CaseNavigation } = $props()

	const labels = $derived.by(getLabels())
	const figuresHeading = $props.id()
	const COVER = { width: 1600, height: 900 }
	const COVER_SIZES = `(max-width: ${breakpoint.medium}) 100vw, ${layout.articleWidth}`

	const eyebrow = $derived(
		`${labels.caseStamp} ${navigation.index + 1} / ${navigation.total}${study.year ? ` · ${study.year}` : ''}`
	)
	const meta = $derived([...study.meta, ...(study.year ? [{ label: labels.caseYear, value: study.year }] : [])])
	const cover = $derived(study.coverKey ? picture(study.coverKey, 1920) : null)
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

			{#if cover}
				<CaseBlock
					padding='block'
					ruled>
					<div
						class={styles.cover}>
						<ImagePopover
							alt={study.coverAlt}
							fetchpriority='high'
							name={study.title}
							sizes={COVER_SIZES}
							src={cover.src}
							srcset={cover.srcset}
							{...COVER}
							class={styles.coverTrigger}
							imageClass={styles.coverImage}
							loading='eager' />
					</div>
				</CaseBlock>
			{/if}

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

			{#if study.figures.length}
				<CaseBlock
					padding='block'
					ruled>
					<section
						aria-labelledby={figuresHeading}>
						<CaseFigures
							figures={study.figures}
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
