<script
	lang='ts'>
	import { AdminPage, CreateForm, EntryIndex, FormError, RowForm, Sortable } from '$lib/components/admin'
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'
	import { fieldError } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()
</script>

<AdminPage
	title='Skills'>
	<FormError
		message={form?.field ? undefined : form?.message} />

	<CreateForm
		noun='Skill Group'>
		<TextField
			compact
			error={fieldError(form, 'title')}
			id='skill-new-title'
			label='Title'
			name='title'
			required />
		<TextField
			compact
			error={fieldError(form, 'description')}
			id='skill-new-description'
			label='Description'
			name='description'
			required />
	</CreateForm>

	<Sortable
		items={data.skills}
		label={(skill) => skill.title}>
		{#snippet row(skill, index)}
			<RowForm
				class={styles.itemCard}
				confirmLabel='Delete this skill group'
				id={skill.id}
				name={skill.title}>
				<EntryIndex
					{index} />
				<TextField
					compact
					id={`skill-title-${skill.id}`}
					label='Title'
					name='title'
					required
					value={skill.title} />
				<TextField
					compact
					id={`skill-description-${skill.id}`}
					label='Description'
					name='description'
					required
					value={skill.description} />
			</RowForm>
		{/snippet}
	</Sortable>
</AdminPage>
