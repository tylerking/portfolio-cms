<script
	lang='ts'>
	import type { SubmitFunction } from '@sveltejs/kit'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import { AdminPage, DeleteForm } from '$lib/components/admin'
	import { announce } from '$lib/components/admin/announcer.svelte'
	import Button from '$lib/components/elements/Button'
	import Chip from '$lib/components/elements/Chip'
	import { selectWrap } from '$lib/components/elements/Field'
	import Text from '$lib/components/elements/Text'
	import { MESSAGE_STATUSES, toOptions } from '$lib/enums'
	import * as styles from '$lib/styles/admin.css'
	import { breakable } from '$lib/styles/patterns.css'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const STATUS_OPTIONS = toOptions(MESSAGE_STATUSES)
	const SERVER_TIME_ZONE = 'UTC'

	let timeZone = $state(SERVER_TIME_ZONE)
	const when = $derived(new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone }))
	const zoneSuffix = $derived(timeZone === SERVER_TIME_ZONE ? ` ${SERVER_TIME_ZONE}` : '')

	onMount(() => {
		timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
	})

	const saveStatus =
		(name: string): SubmitFunction =>
		() =>
		async ({ result, update }) => {
			await update({ reset: false })
			announce(result.type === 'success' ? `Status saved for ${name}.` : `Could not save the status for ${name}.`)
		}
</script>

<AdminPage
	title='Leads'>
	{#if data.mock}
		<Text
			as='p'
			class={styles.hint}
			tone='muted'
			variant='machine'>The dashboard is showing sample data; this inbox is always real.</Text>
	{/if}
	{#if data.messages.length === 0}
		<Text
			as='p'
			tone='muted'
			variant='machine'>No leads yet.</Text>
	{/if}
	<div>
		{#each data.messages as lead (lead.id)}
			<div
				class={styles.card}
				data-row>
				<div
					class={styles.row}>
					<Text
						as='h2'
						class={breakable}
						variant='title'>{lead.name}</Text>
					{#if lead.status === 'new'}
						<Chip>New</Chip>
					{/if}
					<Text
						class={breakable}
						tone='muted'
						variant='machine'>{lead.email}</Text>
					{#if lead.reason}
						<Text
							class={breakable}
							tone='muted'
							variant='machine'>· {lead.reason}</Text>
					{/if}
					<Text
						class={styles.spacer}
						tone='muted'
						variant='machine'><time
							datetime={new Date(lead.createdAt).toISOString()}>{when.format(new Date(lead.createdAt))}{zoneSuffix}</time></Text>
				</div>
				{#if lead.phone}
					<Text
						tone='muted'
						variant='machine'>{lead.phone}</Text>
				{/if}
				<Text
					as='p'
					class={styles.messageBody}>{lead.message}</Text>
				<div
					class={styles.row}>
					<form
						action='?/setStatus'
						class={styles.row}
						method='POST'
						use:enhance={saveStatus(lead.name)}>
						<input
							name='id'
							type='hidden'
							value={lead.id} />
						<Text
							as='label'
							for={`status-${lead.id}`}
							tone='muted'
							variant='label'>Status</Text>
						<span
							class={selectWrap}>
							<select
								aria-label={`Status for ${lead.name}`}
								class={styles.selectInline}
								id={`status-${lead.id}`}
								name='status'
								value={lead.status}>
								{#each STATUS_OPTIONS as option (option.value)}
									<option
										value={option.value}>{option.label}</option>
								{/each}
							</select>
						</span>
						<Button
							aria-label={`Save status for ${lead.name}`}
							class={styles.squareTouch}
							size='small'
							type='submit'
							variant='outline'>Save</Button>
					</form>
					<DeleteForm
						confirmLabel='Delete this lead'
						id={lead.id}
						name={`lead from ${lead.name}`} />
				</div>
			</div>
		{/each}
	</div>
</AdminPage>
