<script
	lang='ts'>
	import ImagePopover from '$lib/components/elements/ImagePopover'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import { picture } from '$lib/media'
	import { ledgerList, ledgerThumbnail, ledgerThumbnailImage } from '$lib/styles/patterns.css'
	import { rowHover, screenReaderOnly } from '$lib/styles/recipes.css'
	import { breakpoint } from '$lib/styles/tokens'
	import type { ShownFigure } from '$lib/types'
	import { padTwoDigits } from '$lib/utils/format'
	import * as styles from './CaseFigures.css'

	let { figures, headingId }: { figures: ShownFigure[]; headingId: string } = $props()

	const labels = $derived.by(getLabels())
	const gallery = $props.id()

	const RATIO = { width: 1600, height: 1000 }
	const THUMBNAIL_WIDTH = 320
	const THUMBNAIL_SIZES = `(max-width: ${breakpoint.small}) 90px, 128px`

	const items = $derived(
		figures.map((figure) => ({
			...picture(figure.key, 1920),
			name: figure.title,
			alt: figure.alt,
			caption: figure.description
		}))
	)

	let active = $state(0)
	let open = $state(false)
</script>

{#snippet body(figure: ShownFigure, index: number)}
	{@const thumbnail = picture(figure.key, THUMBNAIL_WIDTH)}
	<span
		class={ledgerThumbnail}>
		<img
			alt=''
			class={ledgerThumbnailImage}
			decoding='async'
			height={RATIO.height}
			loading='lazy'
			sizes={THUMBNAIL_SIZES}
			src={thumbnail.src}
			srcset={thumbnail.srcset}
			width={RATIO.width} />
	</span>
	<span
		class={styles.text}>
		<span
			class={screenReaderOnly}>{labels.popoverOpen}: </span>
		<Text
			caps
			class={styles.stamp}
			tone='muted'
			variant='numeral'>{labels.figurePrefix}{padTwoDigits(index + 1)}</Text>
		<Text
			class={styles.title}
			variant='title'>{figure.title}</Text>
		{#if figure.description}
			<Text
				aria-hidden='true'
				class={styles.description}
				id={`${gallery}-description-${index}`}
				tone='muted'>{figure.description}</Text>
		{/if}
	</span>
{/snippet}

<Text
	as='h2'
	class={styles.heading}
	id={headingId}
	variant='title'>{labels.figuresHeading}</Text>
<Text
	as='p'
	class={styles.intro}
	tone='muted'>{labels.figuresIntro}</Text>

<div
	class={ledgerList}>
	{#each figures as figure, index (figure.id)}
		<button
			aria-describedby={figure.description ? `${gallery}-description-${index}` : undefined}
			class={[rowHover, styles.row]}
			command='show-modal'
			commandfor={gallery}
			onclick={() => {
				active = index
				open = true
			}}
			type='button'>
			{@render body(figure, index)}
		</button>
	{/each}
</div>

<ImagePopover
	bind:index={active}
	bind:open
	id={gallery}
	{items}
	{...RATIO} />
