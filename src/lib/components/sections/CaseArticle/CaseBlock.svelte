<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import Text from '$lib/components/elements/Text'
	import * as styles from './CaseArticle.css'

	interface Props {
		padding: keyof typeof styles.body
		tag?: string
		ruled?: boolean
		children: Snippet
	}

	let { padding, tag = '', ruled = false, children }: Props = $props()
</script>

<div
	class={[styles.rail[padding], !tag && styles.railEmpty, ruled && styles.ruled]}>
	{#if tag}
		<Text
			class={styles.railTag}
			tone='muted'
			variant='label'>{tag}</Text>
	{/if}
</div>
<div
	class={[styles.body[padding], tag && styles.bodyTagged, ruled && (tag ? styles.ruledWide : styles.ruled)]}>
	{@render children()}
</div>
