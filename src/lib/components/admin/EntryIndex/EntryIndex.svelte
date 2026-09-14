<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { padTwoDigits } from '$lib/utils/format'

	let { index, prefix = '' }: { index: number; prefix?: string } = $props()
</script>

<Text
	class={styles.rowIndex}
	variant='numeral'>{prefix}{padTwoDigits(index + 1)}</Text>
