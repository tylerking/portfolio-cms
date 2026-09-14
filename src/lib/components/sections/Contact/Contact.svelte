<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import { onMount, tick, untrack } from 'svelte'
	import { enhance } from '$app/forms'
	import ArrowLabel from '$lib/components/elements/ArrowLabel'
	import Button from '$lib/components/elements/Button'
	import SelectField from '$lib/components/elements/SelectField'
	import Text from '$lib/components/elements/Text'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import ULink from '$lib/components/elements/ULink'
	import SectionHeader from '$lib/components/layout/SectionHeader'
	import { getLabels } from '$lib/labels/labels'
	import { breakable } from '$lib/styles/patterns.css'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import type { ContactResult } from '$lib/types'
	import { isApplePlatform } from '$lib/utils/platform'
	import * as styles from './Contact.css'
	import { clearDraft, DRAFT_FIELDS, type Draft, emptyDraft, loadDraft, saveDraft } from './draft'
	import { validate } from './validate'

	interface Props {
		heading: string
		lead: string
		email: string
		phone: string
		location: string
		reasons: string[]
		resumeUrl: string
		form?: ContactResult
	}

	let { heading, lead, email, phone, location, reasons, resumeUrl, form }: Props = $props()

	const MESSAGE_MAX = 5000
	const COUNT_FROM = 0.8
	const SAVE_DELAY = 400
	const NOTICE_DURATION = 4000

	const labels = $derived.by(getLabels())

	let submitted = $derived(form?.success === true)
	let error = $derived(form?.success || form?.field ? '' : (form?.message ?? ''))
	let fieldErrors = $derived<Record<string, string>>(form?.field ? { [form.field]: form.message ?? '' } : {})
	const errorFields = $derived(Object.keys(fieldErrors).filter((field) => fieldErrors[field]))
	const fieldNames = $derived<Record<string, string>>({
		name: labels.formName,
		email: labels.formEmail,
		phone: labels.formPhone,
		reason: labels.formReasonLabel,
		message: labels.formMessage
	})
	const options = $derived(reasons.map((reason) => ({ value: reason, label: reason })))

	// Copied once: deriving it from `form` would overwrite a restored draft on the next update.
	let values = $state<Draft>({ ...emptyDraft(), ...untrack(() => form?.values) })

	let submitting = $state(false)
	let touched = $state(false)
	let restored = $state(false)
	let saved = $state(false)
	let discarding = $state(false)
	let undoable = $state<Draft | null>(null)
	let notice = $state('')
	let apple = $state(false)
	let formElement = $state<HTMLFormElement>()
	let draftNote = $state<HTMLElement>()
	let noticeExpired = false

	const hasContent = $derived(Object.values(values).some((value) => value.trim() !== ''))
	const messageCount = $derived(
		values.message.length > MESSAGE_MAX * COUNT_FROM
			? labels.formCount.replace('{number}', String(values.message.length)).replace('{total}', String(MESSAGE_MAX))
			: ''
	)
	const shortcut = $derived((apple ? labels.submitShortcutMac : labels.submitShortcutOther).trim())

	let saveTimer: ReturnType<typeof setTimeout> | undefined
	let noticeTimer: ReturnType<typeof setTimeout> | undefined

	onMount(() => {
		apple = isApplePlatform()
		const draft = loadDraft()
		if (Object.keys(draft).length) {
			values = { ...values, ...draft }
			restored = true
		}
		return () => {
			clearTimeout(saveTimer)
			clearTimeout(noticeTimer)
		}
	})

	function reset() {
		values = emptyDraft()
		restored = false
		touched = false
		fieldErrors = {}
		clearDraft()
	}

	function clearNotice() {
		notice = ''
		undoable = null
	}

	function announce(text: string) {
		notice = text
		noticeExpired = false
		clearTimeout(noticeTimer)
		noticeTimer = setTimeout(() => {
			noticeExpired = true
			if (!draftNote?.contains(document.activeElement)) clearNotice()
		}, NOTICE_DURATION)
	}

	function leaveNote({ relatedTarget }: FocusEvent) {
		if (noticeExpired && !(relatedTarget instanceof Node && draftNote?.contains(relatedTarget))) clearNotice()
	}

	async function focusDraftAction() {
		await tick()
		draftNote?.querySelector('button')?.focus()
	}

	function again() {
		reset()
		submitted = false
		error = ''
		announce(labels.contactAgainDone)
		formElement?.querySelector<HTMLElement>('[name="name"]')?.focus()
	}

	function discardDraft() {
		if (!discarding) {
			discarding = true
			return
		}
		undoable = { ...values }
		discarding = false
		reset()
		announce(labels.draftDiscarded)
		focusDraftAction()
	}

	function undoDiscard() {
		if (!undoable) return
		values = undoable
		clearTimeout(noticeTimer)
		clearNotice()
		saveDraft(values)
		focusDraftAction()
	}

	function onInput() {
		discarding = false
		undoable = null
		clearTimeout(saveTimer)
		saveTimer = setTimeout(() => {
			saveDraft(values)
			saved = true
		}, SAVE_DELAY)
	}

	function revalidate({ target }: FocusEvent) {
		saveDraft(values)
		const name = target instanceof Element && target.getAttribute('name')
		if (!touched || !formElement || !name) return
		fieldErrors = { ...fieldErrors, [name]: validate(formElement, labels, fieldNames)[name] ?? '' }
	}

	function onFormKey(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') formElement?.requestSubmit()
	}

	const submit: SubmitFunction = ({ formElement, cancel }) => {
		if (submitting) {
			cancel()
			return
		}
		const errors = validate(formElement, labels, fieldNames)
		fieldErrors = errors
		touched = true
		error = ''
		if (Object.keys(errors).length) {
			cancel()
			tick().then(() => formElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
			return
		}
		submitting = true
		return async ({ result }) => {
			submitting = false
			if (result.type === 'success') {
				submitted = true
				reset()
			} else if (result.type === 'failure') {
				const message = typeof result.data?.message === 'string' && result.data.message ? result.data.message : labels.contactFailure
				const field = result.data?.field
				if (DRAFT_FIELDS.some((name) => name === field)) {
					fieldErrors = { [field]: message }
					tick().then(() => document.getElementById(`field-${field}`)?.focus())
				} else error = message
			} else if (result.type === 'error') error = labels.contactError
		}
	}
</script>

<div
	class={styles.columns}>
	<div>
		<SectionHeader
			{heading}
			intro={lead}
			introClass={styles.lead} />
		<div
			class={styles.details}>
			<ULink
				class={breakable}
				href={`mailto:${email}`}>{email}</ULink>
			{#if phone}
				<Text
					tone='muted'
					variant='machine'>{phone}</Text>
			{/if}
			<Text
				tone='muted'
				variant='machine'>{location}</Text>
		</div>
		<div
			class={styles.actions}>
			<Button
				href={resumeUrl}
				newTabLabel={labels.resumeNewTab}
				size='hero'
				target='_blank'
				variant='outline'><ArrowLabel
					text={labels.resume} /></Button>
		</div>
	</div>

	<form
		action='/?/contact'
		bind:this={formElement}
		class={styles.form}
		method='POST'
		novalidate
		onfocusout={revalidate}
		oninput={onInput}
		onkeydowncapture={onFormKey}
		use:enhance={submit}>
		<div
			class={screenReaderOnly}
			role='status'>{notice || (discarding ? labels.draftDiscardConfirm : '')}</div>
		{#if (hasContent && !submitted) || notice}
			<Text
				as='p'
				bind:element={draftNote}
				class={styles.draftNote}
				onfocusout={leaveNote}
				variant='machine'>
				{#if hasContent && !submitted}
					{restored ? labels.draftRestored : saved ? labels.draftInProgress : ''}
					<button
						class={styles.draftAction}
						onblur={() => (discarding = false)}
						onclick={discardDraft}
						type='button'>
						{discarding ? labels.draftDiscardConfirm : labels.draftDiscard}
					</button>
				{:else}
					{notice}
					{#if undoable}
						<button
							class={styles.draftAction}
							onclick={undoDiscard}
							type='button'>{labels.draftUndo}</button>
					{/if}
				{/if}
			</Text>
		{/if}
		<div
			class={styles.error}
			role='status'>
			{#if errorFields.length}
				{errorFields.length === 1 ? labels.formErrorSummaryOne : labels.formErrorSummary.replace('{number}', String(errorFields.length))}
				{#each errorFields as field, index (field)}
					<a
						class={styles.errorLink}
						href={`#field-${field}`}>{fieldNames[field]}</a>{index < errorFields.length - 1 ? ', ' : ''}
				{/each}
			{:else}
				{error}
			{/if}
		</div>
		<div
			class={styles.formColumns}>
			<TextField
				autocomplete='name'
				bind:value={values.name}
				error={fieldErrors.name}
				label={labels.formName}
				maxlength={200}
				name='name'
				required />
			<TextField
				autocomplete='email'
				bind:value={values.email}
				error={fieldErrors.email}
				inputmode='email'
				label={labels.formEmail}
				maxlength={200}
				name='email'
				required
				type='email' />
		</div>
		<div
			class={styles.formColumns}>
			<TextField
				autocomplete='tel'
				bind:value={values.phone}
				error={fieldErrors.phone}
				label={labels.formPhone}
				maxlength={50}
				name='phone'
				type='tel' />
			<SelectField
				bind:value={values.reason}
				error={fieldErrors.reason}
				label={labels.formReasonLabel}
				name='reason'
				{options}
				placeholder={labels.formReasonPlaceholder} />
		</div>
		<TextareaField
			bind:value={values.message}
			error={fieldErrors.message}
			hint={messageCount}
			label={labels.formMessage}
			maxlength={MESSAGE_MAX}
			name='message'
			required
			rows={5} />

		<div
			aria-hidden='true'
			class={styles.honeypot}>
			<label
				for='field-company-reference'>{labels.honeypot}</label>
			<input
				autocomplete='off'
				id='field-company-reference'
				name='companyReference'
				tabindex='-1'
				type='text' />
		</div>

		<div
			class={styles.submitRow}>
			<Button
				aria-disabled={submitting}
				size='submit'
				type='submit'><ArrowLabel
					text={submitting ? labels.submitting : labels.submit} /></Button>
			<Text
				class={styles.shortcutHint}
				tone='muted'
				variant='machine'>{shortcut}</Text>
		</div>

		<Text
			as='div'
			class={styles.success}
			role='status'
			variant='machine'>{submitted ? labels.contactSuccess : ''}</Text>
		{#if submitted}
			<div
				class={styles.sentActions}>
				<Button
					onclick={again}
					size='back'
					variant='outline'>{labels.contactAgain}</Button>
				<ULink
					href='#case-studies'
					tone='muted'><ArrowLabel
						text={labels.sentBackToWork} /></ULink>
			</div>
		{/if}
	</form>
</div>
