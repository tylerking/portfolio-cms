<script
	lang='ts'>
	import { enhance } from '$app/forms'
	import { AdminPage, CheckField, SaveBar } from '$lib/components/admin'
	import Text from '$lib/components/elements/Text'
	import TextareaField from '$lib/components/elements/TextareaField'
	import TextField from '$lib/components/elements/TextField'
	import * as styles from '$lib/styles/admin.css'
	import { keepValues } from '$lib/utils/forms'
	import type { ActionData, PageData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	const settings = $derived(data.settings)
	const socialsText = $derived(settings.socials.map((social) => `${social.label} | ${social.href}`).join('\n'))

	const WHERE: Record<string, string> = {
		Navigation: 'Header, mobile menu, skip link, and footer. Screen-reader names end in (screen reader).',
		Hero: 'Availability badge and calls to action.',
		'Lists & links': 'Ledger counts, stamps, link suffixes, and the mobile disclosures. Case index prefix precedes the row number.',
		'Contact form':
			'Field labels, the submit button, validation, and the resume link. {number} is the number of fields; {field} is the field name.',
		Articles: 'Case study pages: the eyebrow stamp, the meta block, figures, and the study-to-study pager.',
		Errors: 'The 404 page.',
		Other: 'Anything not yet filed into a group above. Everything here is still live on the site.'
	}
	const GROUPS: [string, RegExp][] = [
		['Navigation', /^(skip|home|navigation|menu|footer)/],
		['Hero', /^(availability|hero)/],
		['Lists & links', /^(studies|projects|steps|exhibits|project[LP]|coverPending|newTab|skills|cases)/],
		['Contact form', /^(form|honeypot|submit|contact|draft|sent|resume)/],
		['Articles', /^(allCases|case[A-Z]|figure)/],
		['Errors', /^error/],
		['Other', /./]
	]
	const groupOf = (key: string) => GROUPS.find(([, pattern]) => pattern.test(key))?.[0]
	const grouped = $derived(
		GROUPS.map(([name]) => [name, Object.entries(settings.labels).filter(([key]) => groupOf(key) === name)] as const).filter(
			([, entries]) => entries.length
		)
	)
	const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, '-')

	const humanize = (key: string) =>
		key
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (firstLetter) => firstLetter.toUpperCase())
			.replace(/ Aria$/, ' (screen reader)')
</script>

<AdminPage
	title='Globals'>
	<form
		action='?/update'
		id='settings-form'
		method='POST'
		use:enhance={keepValues}>
		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Identity</Text>
		<div
			class={styles.card}>
			<div
				class={styles.twoColumn}>
				<TextField
					compact
					label='Name'
					name='name'
					required
					value={settings.name} />
				<TextField
					compact
					label='Job title'
					name='jobTitle'
					required
					value={settings.jobTitle} />
			</div>
			<TextField
				compact
				label='Footer text'
				name='footerText'
				value={settings.footerText} />
		</div>

		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>SEO</Text>
		<div
			class={styles.card}>
			<TextareaField
				compact
				label='Description'
				name='seoDescription'
				value={settings.seoDescription} />
		</div>

		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Contact &amp; Links</Text>
		<div
			class={styles.card}>
			<div
				class={styles.twoColumn}>
				<TextField
					compact
					label='Email'
					name='contactEmail'
					required
					type='email'
					value={settings.contactEmail} />
				<TextField
					compact
					label='Phone'
					name='contactPhone'
					type='tel'
					value={settings.contactPhone} />
			</div>
			<TextField
				compact
				label='Location'
				name='contactLocation'
				required
				value={settings.contactLocation} />
			<TextareaField
				compact
				label='Contact form reasons (one per line)'
				name='contactReasons'
				value={settings.contactReasons.join('\n')} />
			<TextField
				compact
				label='Resume URL'
				name='resumeUrl'
				required
				value={settings.resumeUrl} />
			<TextareaField
				compact
				label='Socials (one per line: Label | URL)'
				name='socials'
				value={socialsText} />
		</div>

		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Availability</Text>
		<div
			class={styles.card}>
			<CheckField
				checked={settings.showAvailability}
				label='Show availability badge'
				name='showAvailability' />
		</div>

		<Text
			as='h2'
			class={styles.sectionHeading}
			variant='title'>Interface Copy</Text>
		<nav
			aria-label='Interface copy sections'
			class={styles.jumpList}>
			{#each grouped as [name] (name)}
				<a
					href={`#copy-${slug(name)}`}>{name}</a>
			{/each}
		</nav>
		{#each grouped as [name, entries] (name)}
			<Text
				as='h3'
				class={styles.subsectionHeading}
				id={`copy-${slug(name)}`}
				variant='title'>{name}</Text>
			<Text
				as='p'
				class={styles.hint}
				tone='muted'
				variant='machine'>{WHERE[name]}</Text>
			<div
				class={styles.card}>
				<div
					class={styles.twoColumn}>
					{#each entries as [key, value] (key)}
						<TextField
							compact
							label={humanize(key)}
							name={`label__${key}`}
							{value} />
					{/each}
				</div>
			</div>
		{/each}
	</form>
	<SaveBar
		form='settings-form'
		label='Save Globals'
		result={form} />
</AdminPage>
