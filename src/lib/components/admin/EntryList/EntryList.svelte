<script
	generics='Item extends Record<"id", number> & Record<"title", string> & Record<"published", boolean>'
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { breakable } from '$lib/styles/patterns.css'
	import { fieldError } from '$lib/utils/forms'
	import CreateForm from '../CreateForm'
	import DeleteForm from '../DeleteForm'
	import EntryIndex from '../EntryIndex'
	import FormError from '../FormError'
	import Sortable from '../Sortable'
	import TitleSlug from '../TitleSlug'

	interface Props {
		noun: string
		basePath: string
		items: Item[]
		meta: (item: Item) => string
		result?: { success?: boolean; message?: string; field?: string } | null
	}

	let { noun, basePath, items, meta, result }: Props = $props()

	const confirm = $derived(`Delete this ${noun.toLowerCase()}`)
</script>

<FormError
	message={result?.field ? undefined : result?.message} />

<CreateForm
	{noun}>
	<TitleSlug
		slugError={fieldError(result, 'slug')}
		slugOptional
		titleError={fieldError(result, 'title')} />
</CreateForm>

<Sortable
	{items}
	label={(item) => item.title}>
	{#snippet row(item, index)}
		<div
			class={styles.listRow}>
			<div
				class={breakable}>
				<EntryIndex
					{index} />
				<Text
					as='div'
					class={styles.label}
					tone='muted'
					variant='label'>Title</Text>
				<a
					class={styles.entryLink}
					href={`${basePath}/${item.id}`}>
					{item.title}
					<Text
						tone='muted'
						variant='machine'> · {meta(item)}{item.published ? '' : ' · draft'}</Text>
				</a>
			</div>
			<DeleteForm
				confirmLabel={confirm}
				id={item.id}
				name={item.title} />
		</div>
	{/snippet}
</Sortable>
