<script
	lang='ts'>
	import { AdminPage, ConfirmButton, CreateForm, EntryIndex, FileField, FormError, ImageThumbnail, RowForm, Sortable } from '$lib/components/admin'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'
	import { fieldError } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<AdminPage
	title='Side Projects'>
	<FormError
		message={form?.field ? undefined : form?.message} />

	<CreateForm
		noun='Side Project'>
		<TextField
			compact
			error={fieldError(form, 'title')}
			id='project-new-title'
			label='Title'
			name='title'
			required />
		<TextareaField
			compact
			error={fieldError(form, 'description')}
			id='project-new-description'
			label='Description'
			name='description' />
		<TextField
			compact
			error={fieldError(form, 'tags')}
			id='project-new-tags'
			label='Tags (comma-separated)'
			name='tags' />
		<TextField
			compact
			error={fieldError(form, 'url')}
			id='project-new-url'
			label='URL'
			name='url' />
	</CreateForm>

	<Sortable
		items={data.projects}
		label={(project) => project.title}>
		{#snippet row(project, index)}
			<RowForm
				class={styles.itemCard}
				confirmLabel='Delete this side project'
				enctype='multipart/form-data'
				id={project.id}
				name={project.title}>
				<EntryIndex
					{index} />
				<TextField
					compact
					id={`project-title-${project.id}`}
					label='Title'
					name='title'
					required
					value={project.title} />
				<TextareaField
					compact
					id={`project-description-${project.id}`}
					label='Description'
					name='description'
					value={project.description} />
				<TextField
					compact
					id={`project-tags-${project.id}`}
					label='Tags (comma-separated)'
					name='tags'
					value={project.tags.join(', ')} />
				<TextField
					compact
					id={`project-url-${project.id}`}
					label='URL'
					name='url'
					value={project.url} />
				<div
					class={styles.coverRow}>
					<ImageThumbnail
						imageKey={project.coverKey} />
					<div>
						<Text
							class={styles.label}
							tone='muted'
							variant='label'>Cover (16:10 works best)</Text>
						<div
							class={styles.row}>
							<FileField
								context={`for the cover of ${project.title}`}
								id={`cover-${project.id}`}
								label='Choose image'
								name='cover' />
							<Button
								aria-label={`Upload cover for ${project.title}`}
								class={styles.squareTouch}
								formaction='?/uploadCover'
								size='small'
								type='submit'
								variant='outline'>Upload</Button>
						</div>
						<TextareaField
							class={styles.stackTop}
							compact
							id={`project-cover-alt-${project.id}`}
							label='Cover alt text'
							maxlength={300}
							name='coverAlt'
							required={!!project.coverKey}
							rows={2}
							value={project.coverAlt} />
						{#if project.coverKey}
							<div
								class={styles.stackTop}>
								<ConfirmButton
									ariaLabel={`Remove cover of ${project.title}`}
									confirmLabel='Remove this cover'
									formaction='?/removeCover'
									label='Remove cover'
									size='small' />
							</div>
						{/if}
					</div>
				</div>
			</RowForm>
		{/snippet}
	</Sortable>
</AdminPage>
