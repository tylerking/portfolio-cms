<script
	lang='ts'>
	import { tick, untrack } from 'svelte'
	import { enhance } from '$app/forms'
	import { page } from '$app/state'
	import { AdminPage, CheckField, ConfirmButton, DangerZone, EntryGroup, EntryIndex, FileField, FormError, ImageThumbnail, MoveButtons, SaveBar, TitleSlug } from '$lib/components/admin'
	import Button from '$lib/components/elements/Button'
	import Text from '$lib/components/elements/Text'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import { picture } from '$lib/media'
	import * as styles from '$lib/styles/admin.css'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { breakpoint, layout } from '$lib/styles/tokens'
	import { moveItem } from '$lib/utils/array'
	import { keepValues } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const PREVIEW_SIZES = `(max-width: ${breakpoint.admin}) 100vw, ${layout.adminWidth}`

	const study = $derived(data.study)
	const media = $derived(form && 'scope' in form && form.scope === 'media' ? form : null)
	const details = $derived(media ? null : form)
	const cover = $derived(study.coverKey ? picture(study.coverKey, 1280) : null)

	const rowKey = () => crypto.randomUUID()

	// Copied once: re-deriving from data would discard unsaved rows whenever the page reloads.
	let draft = $state(
		untrack(() => ({
			meta: data.study.meta.map((entry) => ({ ...entry, key: rowKey() })),
			sections: data.study.sections.map((section) => ({ key: rowKey(), tag: section.tag, heading: section.heading, paragraphsText: section.paragraphs.join('\n\n') }))
		}))
	)

	const metaJson = $derived(JSON.stringify(draft.meta.map(({ key: _key, ...entry }) => entry)))
	const sectionsJson = $derived(
		JSON.stringify(
			draft.sections.map((section) => ({
				tag: section.tag,
				heading: section.heading,
				paragraphs: section.paragraphsText
					.split(/\n\s*\n/)
					.map((paragraph) => paragraph.trim())
					.filter(Boolean)
			}))
		)
	)

	async function focusField(id: string) {
		await tick()
		document.getElementById(id)?.focus()
	}

	function addMeta() {
		const key = rowKey()
		draft.meta.push({ label: '', value: '', key })
		focusField(`meta-label-${key}`)
	}

	function addSection() {
		const key = rowKey()
		draft.sections.push({ key, tag: '', heading: '', paragraphsText: '' })
		focusField(`section-tag-${key}`)
	}
</script>

<AdminPage
	eyebrow={`Case studies / ${study.slug}`}
	notice={page.url.searchParams.has('created') ? 'Created. This case study is a draft until you tick Published and save.' : undefined}
	title={study.title}>
	{#snippet links()}
		<a
			href='/admin/case-studies'><span
				aria-hidden='true'>←</span> All case studies</a>
		<a
			href={`/case-studies/${study.slug}`}
			rel='noopener'
			target='_blank'>View on site <span
				aria-hidden='true'>↗</span><span
				class={screenReaderOnly}> (opens in new tab)</span></a>
	{/snippet}

	<Text
		as='h2'
		class={styles.sectionHeading}
		variant='title'>Details</Text>
	<form
		action='?/update'
		id='editor-form'
		method='POST'
		use:enhance={keepValues}>
		<div
			class={styles.card}>
			<TitleSlug
				slug={study.slug}
				title={study.title} />
			<TextField
				compact
				inputmode='numeric'
				label='Year'
				name='year'
				pattern={'[0-9]{4}'}
				title='Four-digit year'
				value={study.year} />
			<TextareaField
				compact
				label='Summary'
				name='summary'
				value={study.summary} />
			<TextField
				compact
				label='Tags (comma-separated)'
				name='tags'
				value={study.tags.join(', ')} />
			<CheckField
				checked={study.published}
				label='Published'
				name='published' />
		</div>

		<Text
			as='h3'
			class={styles.subsectionHeading}
			variant='title'>Meta</Text>
		<Text
			as='p'
			class={styles.hint}
			tone='muted'
			variant='machine'>Short facts shown under the summary. Labels render uppercase (ROLE), values as typed.</Text>
		<div>
			{#each draft.meta as meta, index (meta.key)}
				<div
					class={styles.card}
					data-row>
					<EntryGroup
						legend={`Meta ${index + 1}`}>
						<div
							class={styles.twoColumn}>
							<TextField
								bind:value={meta.label}
								compact
								id={`meta-label-${meta.key}`}
								label='Label' />
							<TextField
								bind:value={meta.value}
								compact
								id={`meta-value-${meta.key}`}
								label='Value' />
						</div>
						<ConfirmButton
							ariaLabel={`Remove meta ${index + 1}`}
							confirmLabel='Remove this row'
							label='Remove'
							onconfirm={() => (draft.meta = draft.meta.filter((row) => row.key !== meta.key))}
							size='small' />
					</EntryGroup>
				</div>
			{/each}
		</div>
		<Button
			onclick={addMeta}
			size='admin'
			variant='outline'>+ Add Meta</Button>

		<Text
			as='h3'
			class={styles.subsectionHeading}
			variant='title'>Sections</Text>
		<div>
			{#each draft.sections as section, index (section.key)}
				<div
					class={styles.card}
					data-row>
					<EntryGroup
						legend={`Section ${index + 1}`}>
						<div
							class={styles.rowSpread}>
							<Text
								aria-hidden='true'
								tone='muted'
								variant='machine'>Section {index + 1}</Text>
							<div
								class={styles.row}>
								<MoveButtons
									count={draft.sections.length}
									{index}
									inline
									name={section.heading || `section ${index + 1}`}
									onmove={(from, to) => (draft.sections = moveItem(draft.sections, from, to))} />
								<ConfirmButton
									ariaLabel={`Remove section ${index + 1}`}
									confirmLabel='Remove this section'
									label='Remove'
									onconfirm={() => (draft.sections = draft.sections.filter((row) => row.key !== section.key))}
									size='small' />
							</div>
						</div>
						<TextField
							bind:value={section.tag}
							compact
							id={`section-tag-${section.key}`}
							label='Tag' />
						<TextField
							bind:value={section.heading}
							compact
							id={`section-heading-${section.key}`}
							label='Heading' />
						<TextareaField
							bind:value={section.paragraphsText}
							compact
							id={`section-paragraphs-${section.key}`}
							label='Paragraphs (blank line between each)'
							rows={6} />
					</EntryGroup>
				</div>
			{/each}
		</div>
		<Button
			onclick={addSection}
			size='admin'
			variant='outline'>+ Add Section</Button>

		<input
			name='meta'
			type='hidden'
			value={metaJson} />
		<input
			name='sections'
			type='hidden'
			value={sectionsJson} />
	</form>
	<SaveBar
		form='editor-form'
		label='Save Details'
		result={details}
		snapshot={metaJson + sectionsJson} />

	<Text
		as='h2'
		class={styles.sectionHeading}
		variant='title'>Media</Text>
	<Text
		as='p'
		class={styles.hint}
		tone='muted'
		variant='machine'>The cover and each figure save on their own, separately from the details above. Alt text is read aloud in place of the image, so describe what it shows rather than repeating its title.</Text>
	<FormError
		message={media?.message} />

	<Text
		as='h3'
		class={styles.subsectionHeading}
		variant='title'>Cover</Text>
	<Text
		as='p'
		class={styles.hint}
		tone='muted'
		variant='machine'>16:10 works best. Shown as this study's thumbnail in the home page case study list, not in the article.</Text>
	<div
		class={styles.card}>
		{#if cover}
			<img
				alt=''
				class={styles.coverPreview}
				decoding='async'
				height='900'
				loading='lazy'
				sizes={PREVIEW_SIZES}
				src={cover.src}
				srcset={cover.srcset}
				width='1600' />
			<form
				action='?/describeCover'
				class={styles.stackTop}
				method='POST'
				use:enhance={keepValues}>
				<TextareaField
					compact
					id='cover-alt'
					label='Alt text'
					maxlength={300}
					name='coverAlt'
					required
					rows={2}
					value={study.coverAlt} />
				<Button
					size='admin'
					type='submit'
					variant='outline'>Save Alt Text</Button>
			</form>
			<form
				action='?/removeCover'
				class={styles.stackTop}
				method='POST'
				use:enhance={keepValues}>
				<ConfirmButton
					confirmLabel='Remove this cover'
					label='Remove cover'
					size='small' />
			</form>
		{:else}
			<Text
				as='p'
				tone='muted'
				variant='machine'>No cover uploaded. The case study list shows an empty frame until one is added.</Text>
		{/if}
		<form
			action='?/uploadCover'
			class={styles.stackTop}
			enctype='multipart/form-data'
			method='POST'
			use:enhance={keepValues}>
			<div
				class={styles.field}>
				<Text
					aria-hidden='true'
					class={styles.requiredLabel}
					tone='muted'
					variant='label'>{cover ? 'Replacement image' : 'Image'}</Text>
				<FileField
					context='for the cover'
					id='cover-file'
					label='Choose image'
					name='cover'
					required />
			</div>
			<TextareaField
				compact
				id='cover-new-alt'
				label={cover ? 'Alt text for the replacement' : 'Alt text'}
				maxlength={300}
				name='coverAlt'
				required
				rows={2} />
			<Button
				size='admin'
				type='submit'
				variant='outline'>Upload</Button>
		</form>
	</div>

	<Text
		as='h3'
		class={styles.subsectionHeading}
		variant='title'>Figures</Text>
	<Text
		as='p'
		class={styles.hint}
		tone='muted'
		variant='machine'>
		Shown at the end of the article, in this order. A figure stays hidden on the site until it has an image, and the article has no figures section until one does.
	</Text>
	<div>
		{#each study.figures as figure, index (figure.id)}
			<div
				class={styles.dragRow}
				data-row>
				<div
					class={styles.dragRail}>
					<form
						action='?/moveFigure'
						method='POST'
						use:enhance={keepValues}>
						<input
							name='id'
							type='hidden'
							value={figure.id} />
						<MoveButtons
							count={study.figures.length}
							{index}
							name={figure.title || `figure ${index + 1}`}
							submit />
					</form>
				</div>
				<form
					action='?/updateFigure'
					class={styles.itemCard}
					enctype='multipart/form-data'
					method='POST'
					use:enhance={keepValues}>
					<EntryGroup
						legend={figure.title || `Figure ${index + 1}`}>
						<EntryIndex
							{index}
							prefix='FIG.' />
						<div
							class={styles.figureRow}>
							<ImageThumbnail
								imageKey={figure.key} />
							<div>
								<input
									name='id'
									type='hidden'
									value={figure.id} />
								<TextField
									compact
									id={`figure-title-${figure.id}`}
									label='Title'
									name='title'
									required
									value={figure.title} />
								<TextareaField
									compact
									id={`figure-description-${figure.id}`}
									label='Description'
									name='description'
									rows={3}
									value={figure.description} />
								<TextareaField
									compact
									id={`figure-alt-${figure.id}`}
									label='Alt text'
									maxlength={300}
									name='alt'
									required
									rows={2}
									value={figure.alt} />
								{#if !figure.key}
									<Text
										as='p'
										class={styles.hint}
										tone='muted'
										variant='machine'>No image yet, so this figure is hidden on the site.</Text>
								{/if}
								<div
									class={[styles.row, styles.stackTop]}>
									<FileField
										context={`for ${figure.title || `figure ${index + 1}`}`}
										id={`figure-image-${figure.id}`}
										label={figure.key ? 'Replace image' : 'Choose image'}
										name='image' />
									<Button
										aria-label={`Upload image for ${figure.title || `figure ${index + 1}`}`}
										class={styles.squareTouch}
										formaction='?/uploadFigureImage'
										size='small'
										type='submit'
										variant='outline'>Upload</Button>
								</div>
								<div
									class={[styles.row, styles.stackTop]}>
									<Button
										aria-label={`Save Figure ${figure.title || index + 1}`}
										class={styles.squareTouch}
										size='small'
										type='submit'
										variant='outline'>Save Figure</Button>
									<ConfirmButton
										ariaLabel={`Remove ${figure.title}`}
										confirmLabel='Remove this figure'
										formaction='?/removeFigure'
										label='Remove'
										size='small' />
								</div>
							</div>
						</div>
					</EntryGroup>
				</form>
			</div>
		{/each}
	</div>
	<form
		action='?/addFigure'
		class={styles.card}
		enctype='multipart/form-data'
		method='POST'
		use:enhance={keepValues}>
		<div
			class={styles.field}>
			<Text
				aria-hidden='true'
				class={styles.label}
				tone='muted'
				variant='label'>Image (optional)</Text>
			<FileField
				context='for the new figure'
				id='figure-new-image'
				label='Choose image'
				name='image' />
		</div>
		<div
			class={styles.twoColumn}>
			<TextField
				compact
				id='figure-new-title'
				label='Title'
				name='title'
				required />
			<TextField
				compact
				id='figure-new-description'
				label='Description'
				name='description' />
		</div>
		<TextareaField
			compact
			id='figure-new-alt'
			label='Alt text'
			maxlength={300}
			name='alt'
			required
			rows={2} />
		<Button
			size='admin'
			type='submit'
			variant='outline'>+ Add Figure</Button>
	</form>

	<DangerZone
		noun='case study' />
</AdminPage>
