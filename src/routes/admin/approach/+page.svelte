<script
	lang='ts'>
	import { AdminPage, CreateForm, EntryIndex, FormError, RowForm, Sortable } from '$lib/components/admin'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'
	import { fieldError } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<AdminPage
	title='Approach'>
	<FormError
		message={form?.field ? undefined : form?.message} />

	<CreateForm
		noun='Approach Step'>
		<TextField
			compact
			error={fieldError(form, 'title')}
			id='step-new-title'
			label='Title'
			name='title'
			required />
		<TextareaField
			compact
			error={fieldError(form, 'description')}
			id='step-new-description'
			label='Description'
			name='description'
			required />
	</CreateForm>

	<Sortable
		items={data.steps}
		label={(step) => step.title}>
		{#snippet row(step, index)}
			<RowForm
				class={styles.itemCard}
				confirmLabel='Delete this approach step'
				id={step.id}
				name={step.title}>
				<EntryIndex
					{index} />
				<TextField
					compact
					id={`step-title-${step.id}`}
					label='Title'
					name='title'
					required
					value={step.title} />
				<TextareaField
					compact
					id={`step-description-${step.id}`}
					label='Description'
					name='description'
					required
					value={step.description} />
			</RowForm>
		{/snippet}
	</Sortable>
</AdminPage>
