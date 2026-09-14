<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'

	let { message, id }: { message?: string; id?: string } = $props()
</script>

<div
	role='alert'>
	{#if message}
		<Text
			class={styles.error}
			{id}
			variant='machine'>{message}</Text>
	{/if}
</div>
