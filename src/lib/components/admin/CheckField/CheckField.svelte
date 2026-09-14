<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'

	let { label, name, checked = false }: { label: string; name: string; checked?: boolean } = $props()
</script>

<label
	class={styles.checkRow}>
	<input
		{checked}
		class={styles.checkbox}
		{name}
		type='checkbox' />
	<Text
		class={styles.checkLabel}
		tone='muted'
		variant='label'>{label}</Text>
</label>
