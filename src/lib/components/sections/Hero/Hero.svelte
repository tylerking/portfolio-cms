<script
	lang='ts'>
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import Button from '$lib/components/elements/Button'
	import SocialLinks from '$lib/components/elements/SocialLinks'
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import type { Social } from '$lib/types'
	import * as styles from './Hero.css'

	interface Props {
		name: string
		jobTitle: string
		lead: string
		showAvailability: boolean
		socials: Social[]
	}

	let { name, jobTitle, lead, showAvailability, socials }: Props = $props()

	const labels = $derived.by(getLabels())
</script>

<section
	class={styles.hero}
	id='top'>
	<div
		class={styles.inner}>
		<div
			class={styles.meta}>
			<Text
				variant='label'>{jobTitle}</Text>
			{#if showAvailability}
				<Text
					class={styles.avail}
					variant='label'>
					<span
						aria-hidden='true'
						class={styles.availDot}></span>{labels.availability}
				</Text>
			{/if}
		</div>
		<Text
			as='h1'
			class={styles.name}
			variant='displayXl'>{name}</Text>
		<div
			class={styles.columns}>
			<Text
				as='p'
				class={styles.lead}
				tone='muted'
				variant='lead'>{lead}</Text>
			<div
				class={styles.actions}>
				<div
					class={styles.buttons}>
					<Button
						href='#case-studies'
						size='hero'><ArrowLabel
							text={labels.heroPrimaryCta} /></Button>
					<Button
						href='#contact'
						size='hero'
						variant='outline'><ArrowLabel
							text={labels.heroSecondaryCta} /></Button>
				</div>
				<SocialLinks
					{socials}
					spacing='hero' />
			</div>
		</div>
	</div>
</section>
