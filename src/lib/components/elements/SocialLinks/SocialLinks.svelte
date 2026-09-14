<script
	lang='ts'>
	import ULink from '$lib/components/elements/ULink'
	import { getLabels } from '$lib/labels/labels'
	import type { Social } from '$lib/types'
	import { list, spacing } from './SocialLinks.css'

	let { socials, spacing: where = 'footer' }: { socials: Social[]; spacing?: keyof typeof spacing } = $props()

	const labels = $derived.by(getLabels())
</script>

<div
	class={[list, spacing[where]]}>
	{#each socials as social, index (index)}
		<ULink
			href={social.href}
			newTabLabel={labels.newTab}
			target='_blank'
			tone='muted'>{social.label}</ULink>
	{/each}
</div>
