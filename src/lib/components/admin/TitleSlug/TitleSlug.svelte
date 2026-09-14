<script
	lang='ts'>
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'

	interface Props {
		title?: string
		slug?: string
		idPrefix?: string
		titleError?: string
		slugError?: string
		slugOptional?: boolean
	}

	let { title = '', slug = '', idPrefix, titleError, slugError, slugOptional = false }: Props = $props()
</script>

<div
	class={styles.twoColumn}>
	<TextField
		compact
		error={titleError}
		id={idPrefix ? `${idPrefix}-title` : undefined}
		label='Title'
		name='title'
		required
		value={title} />
	<TextField
		compact
		error={slugError}
		id={idPrefix ? `${idPrefix}-slug` : undefined}
		label={slugOptional ? 'Slug (optional)' : 'Slug'}
		name='slug'
		placeholder={slugOptional ? 'auto from title' : undefined}
		required={!slugOptional}
		value={slug} />
</div>
