<script
	lang='ts'>
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import Chip from '$lib/components/elements/Chip'
	import ImagePopover from '$lib/components/elements/ImagePopover'
	import Text from '$lib/components/elements/Text'
	import ULink from '$lib/components/elements/ULink'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { getLabels } from '$lib/labels/labels'
	import { picture } from '$lib/media'
	import { balanced } from '$lib/styles/patterns.css'
	import { breakpoint } from '$lib/styles/tokens'
	import type { Project } from '$lib/types'
	import * as styles from './SideProjects.css'

	interface Props {
		heading: string
		intro: string
		projects: Project[]
		count: string
	}

	let { heading, intro, projects, count }: Props = $props()

	const labels = $derived.by(getLabels())
	const COVER = { width: 1600, height: 1000 }
	const COVER_SIZES = `(max-width: ${breakpoint.medium}) 100vw, 560px`
</script>

<SectionHeader
	{count}
	{heading}
	{intro} />

<div
	class={styles.grid}>
	{#each projects as project (project.id)}
		<article
			class={styles.panel}>
			{#if project.coverKey}
				{@const cover = picture(project.coverKey, 1280)}
				<div
					class={styles.cover}>
					<ImagePopover
						alt={project.coverAlt}
						name={project.title}
						sizes={COVER_SIZES}
						src={cover.src}
						srcset={cover.srcset}
						{...COVER}
						class={styles.coverTrigger}
						imageClass={styles.coverImage} />
				</div>
			{:else}
				<div
					class={[styles.cover, styles.coverPending]}>
					<Text
						class={styles.pendingLabel}
						tone='muted'
						variant='label'>{labels.coverPending}</Text>
				</div>
			{/if}
			<div
				class={styles.body}>
				<div
					class={styles.header}>
					<Text
						as='h3'
						class={balanced}
						variant='title'>{project.title}</Text>
					{#if project.url}
						<ULink
							href={project.url}
							newTabLabel={labels.newTab}
							target='_blank'
							tone='accent'><ArrowLabel
								text={labels.projectLink} /></ULink>
					{:else}
						<Text
							tone='muted'
							variant='machine'>{labels.projectPending}</Text>
					{/if}
				</div>
				<Text
					as='p'
					class={styles.description}
					tone='muted'>{project.description}</Text>
				<div
					class={styles.tags}>
					{#each project.tags as tag (tag)}
						<Chip>{tag}</Chip>
					{/each}
				</div>
			</div>
		</article>
	{/each}
</div>
