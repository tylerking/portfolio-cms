<script
	lang='ts'>
	import type { Snippet } from 'svelte'
	import Text from '$lib/components/elements/Text'
	import * as styles from './SectionShell.css'

	interface Props {
		id: string
		label: string
		count?: string
		variant?: keyof typeof styles.body
		divider?: boolean
		children: Snippet
	}

	let { id, label, count, variant = 'default', divider = true, children }: Props = $props()
</script>

<section
	aria-label={label}
	class={[styles.section, divider && styles.divider]}
	{id}
	tabindex='-1'>
	<div
		class={styles.grid}>
		<div
			class={styles.gutterColumn[variant]}>
			<div
				aria-hidden='true'
				class={styles.gutter}>
				<Text
					tone='muted'
					variant='label'>{label}</Text>
			</div>
		</div>
		<div
			class={styles.body[variant]}>
			<div
				aria-hidden='true'
				class={styles.mobileGutter}>
				<Text
					tone='muted'
					variant='label'>{label}</Text>
				{#if count}
					<Text
						class={styles.mobileCount}
						variant='machine'>{count}</Text>
				{/if}
			</div>
			{@render children()}
		</div>
	</div>
</section>
