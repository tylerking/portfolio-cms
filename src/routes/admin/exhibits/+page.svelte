<script
	lang='ts'>
	import { AdminPage, CheckField, CreateForm, EntryIndex, FormError, RowForm, Sortable, TitleSlug } from '$lib/components/admin'
	import SelectField from '$lib/components/elements/SelectField'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import { EXHIBIT_STATUSES, toOptions } from '$lib/enums'
	import * as styles from '$lib/styles/admin.css'
	import { fieldError } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const STATUS_OPTIONS = toOptions(EXHIBIT_STATUSES)
</script>

<AdminPage
	title='Exhibits'>
	<FormError
		message={form?.field ? undefined : form?.message} />

	<CreateForm
		noun='Exhibit'>
		<TitleSlug
			idPrefix='exhibit-new'
			slugError={fieldError(form, 'slug')}
			slugOptional
			titleError={fieldError(form, 'title')} />
		<TextareaField
			compact
			error={fieldError(form, 'description')}
			id='exhibit-new-description'
			label='Description'
			name='description' />
		<div
			class={styles.twoColumn}>
			<TextField
				compact
				error={fieldError(form, 'category')}
				id='exhibit-new-category'
				label='Category'
				name='category' />
			<SelectField
				compact
				error={fieldError(form, 'status')}
				id='exhibit-new-status'
				label='Status'
				name='status'
				options={STATUS_OPTIONS}
				value={EXHIBIT_STATUSES[0]} />
		</div>
		<CheckField
			label='Published'
			name='published' />
	</CreateForm>

	<Sortable
		items={data.exhibits}
		label={(exhibit) => exhibit.title}>
		{#snippet row(exhibit, index)}
			<RowForm
				class={styles.itemCard}
				confirmLabel='Delete this exhibit'
				id={exhibit.id}
				name={exhibit.title}>
				<EntryIndex
					{index} />
				<TitleSlug
					idPrefix={`exhibit-${exhibit.id}`}
					slug={exhibit.slug}
					title={exhibit.title} />
				<TextareaField
					compact
					id={`exhibit-description-${exhibit.id}`}
					label='Description'
					name='description'
					value={exhibit.description} />
				<div
					class={styles.twoColumn}>
					<TextField
						compact
						id={`exhibit-category-${exhibit.id}`}
						label='Category'
						name='category'
						value={exhibit.category} />
					<SelectField
						compact
						id={`exhibit-status-${exhibit.id}`}
						label='Status'
						name='status'
						options={STATUS_OPTIONS}
						value={exhibit.status} />
				</div>
				<CheckField
					checked={exhibit.published}
					label='Published'
					name='published' />
			</RowForm>
		{/snippet}
	</Sortable>
</AdminPage>
