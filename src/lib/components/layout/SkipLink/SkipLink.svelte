<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { getLabels } from '$lib/labels/labels'
	import { skip } from './SkipLink.css'

	const labels = $derived.by(getLabels())
</script>

<Text
	as='a'
	class={skip}
	href='#main-content'
	variant='button'>{labels.skipToContent}</Text>
