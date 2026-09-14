<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import { navigationLinkCurrent } from '$lib/styles/patterns.css'
	import type { Section } from '$lib/types'
	import * as styles from './MobileNavigation.css'

	interface Props {
		id: string
		sections: Section[]
		open: boolean
		current: string
		onnavigate: (id: string) => void
	}

	let { id, sections, open, current, onnavigate }: Props = $props()

	const labels = $derived.by(getLabels())
</script>

<nav
	aria-label={labels.navigationMobileAria}
	class={[styles.panel, open && styles.open]}
	{id}>
	{#each sections as section (section.id)}
		<Text
			aria-current={current === section.id ? 'location' : undefined}
			as='a'
			class={[styles.link, current === section.id && navigationLinkCurrent]}
			href={`/#${section.id}`}
			onclick={() => onnavigate(section.id)}
			variant='machine'>{section.label}</Text
		>
	{/each}
</nav>
