<script
	lang='ts'>
	import { enhance } from '$app/forms'
	import { AdminPage, EntryGroup, EntryIndex, MoveButtons, SaveBar } from '$lib/components/admin'
	import Text from '$lib/components/elements/Text'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import { SECTION_IDS } from '$lib/sections'
	import * as styles from '$lib/styles/admin.css'
	import { moveItem } from '$lib/utils/array'
	import { keepValues } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const home = $derived(data.home)
	const byId = $derived(new Map(home.sections.map((section) => [section.id, section])))

	let order = $derived.by(() => {
		const stored = home.sections.map((section) => section.id)
		return [...stored, ...SECTION_IDS.filter((id) => !stored.includes(id))]
	})
</script>

<AdminPage
	title='Home'>
	<form
		action='?/update'
		id='home-form'
		method='POST'
		use:enhance={keepValues}>
		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Copy</Text>
		<div
			class={styles.card}>
			<TextareaField
				compact
				label='Hero lead'
				name='heroLead'
				value={home.heroLead} />
			<TextareaField
				compact
				label='About lead'
				name='aboutLead'
				value={home.aboutLead} />
			<TextareaField
				compact
				label='About paragraphs (blank line between each)'
				name='aboutParagraphs'
				rows={7}
				value={home.aboutParagraphs.join('\n\n')} />
			<TextareaField
				compact
				label='Approach intro'
				name='approachIntro'
				value={home.approachIntro} />
			<TextareaField
				compact
				label='Exhibits intro'
				name='exhibitsIntro'
				value={home.exhibitsIntro} />
			<TextareaField
				compact
				label='Case Studies intro'
				name='caseIntro'
				value={home.caseIntro} />
			<TextareaField
				compact
				label='Side Projects intro'
				name='projectsIntro'
				value={home.projectsIntro} />
			<TextareaField
				compact
				label='Contact lead'
				name='contactLead'
				value={home.contactLead} />
		</div>

		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Sections</Text>
		<Text
			as='p'
			class={styles.hint}
			tone='muted'
			variant='machine'>Use ↑ ↓ to set the page order. Numbers on the site follow this order.</Text>
		<input
			name='sectionOrder'
			type='hidden'
			value={order.join(',')} />
		{#each order as id, index (id)}
			{@const section = byId.get(id)}
			<div
				class={styles.dragRow}>
				<div
					class={styles.dragRail}>
					<MoveButtons
						count={order.length}
						{index}
						name={section?.label || id}
						onmove={(from, to) => (order = moveItem(order, from, to))} />
				</div>
				<EntryGroup
					class={styles.itemCard}
					legend={`${section?.label || id} section`}>
					<EntryIndex
						{index} />
					<div
						class={styles.twoColumn}>
						<TextField
							compact
							label='Label'
							name={`section__${id}__label`}
							value={section?.label ?? ''} />
						<TextField
							compact
							label='Heading'
							name={`section__${id}__heading`}
							value={section?.heading ?? ''} />
					</div>
				</EntryGroup>
			</div>
		{/each}
	</form>
	<SaveBar
		form='home-form'
		label='Save Home'
		result={form}
		snapshot={order.join(',')} />
</AdminPage>
