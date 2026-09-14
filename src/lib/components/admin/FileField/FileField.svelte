<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { IMAGE_ACCEPT, IMAGE_TOO_LARGE, MAX_IMAGE_BYTES } from '$lib/uploads'

	interface Props {
		name: string
		label: string
		id: string
		context?: string
		required?: boolean
	}

	let { name, label, id, context, required = false }: Props = $props()

	let files = $state<FileList | null>(null)
	let input = $state<HTMLInputElement>()
	const file = $derived(files?.[0])
	const problem = $derived(file && file.size > MAX_IMAGE_BYTES ? IMAGE_TOO_LARGE : '')
	const statusId = $derived(`${id}-status`)

	$effect(() => {
		input?.setCustomValidity(problem)
	})
</script>

<span
	class={styles.fileField}>
	<Text
		as='label'
		class={styles.buttonSmall}
		for={id}
		variant='button'>{label}{#if context}<span
				class={screenReaderOnly}> {context}</span>{/if}</Text>
	<input
		accept={IMAGE_ACCEPT}
		aria-describedby={problem ? statusId : undefined}
		aria-invalid={problem ? 'true' : undefined}
		bind:files
		bind:this={input}
		class={screenReaderOnly}
		{id}
		{name}
		{required}
		type='file' />
	<Text
		aria-live='polite'
		id={statusId}
		tone='muted'
		variant='machine'>{problem || file?.name || ''}</Text>
</span>
