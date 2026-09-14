<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import ConfirmButton from '../ConfirmButton'

	let { noun }: { noun: string } = $props()
</script>

<Text
	as='h2'
	class={styles.sectionHeading}
	variant='title'>Danger</Text>
<form
	action='?/delete'
	class={styles.card}
	method='POST'>
	<Text
		as='p'
		class={styles.hint}
		tone='muted'
		variant='machine'>Deleting removes this {noun}. There is no undo.</Text>
	<ConfirmButton
		confirmLabel='Yes, delete it'
		label={`Delete this ${noun}`} />
</form>
