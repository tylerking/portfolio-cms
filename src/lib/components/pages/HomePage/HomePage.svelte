<script
	lang='ts'>
	import SectionShell from '$lib/components/layout/SectionShell'
	import Seo from '$lib/components/layout/Seo'
	import About from '$lib/components/sections/About'
	import Approach from '$lib/components/sections/Approach'
	import CaseStudies from '$lib/components/sections/CaseStudies'
	import Contact from '$lib/components/sections/Contact'
	import Exhibits from '$lib/components/sections/Exhibits'
	import Hero from '$lib/components/sections/Hero'
	import SideProjects from '$lib/components/sections/SideProjects'
	import { getLabels } from '$lib/labels/labels'
	import { SECTION_IDS } from '$lib/sections'
	import type { ContactResult, HomeData, SectionId } from '$lib/types'

	let { data, form }: { data: HomeData; form?: ContactResult } = $props()

	const labels = $derived.by(getLabels())
	const home = $derived(data.home)
	const settings = $derived(data.settings)

	const ordered = $derived(home.sections.filter((section) => SECTION_IDS.includes(section.id as SectionId)))

	const counts = $derived<Partial<Record<SectionId, string>>>({
		approach: `${data.approachSteps.length} ${labels.steps}`,
		exhibits: `${data.exhibits.length} ${labels.exhibits}`,
		'case-studies': `${data.caseStudies.length} ${labels.studies}`,
		projects: `${data.projects.length} ${labels.projects}`
	})

	const person = $derived({
		'@type': 'Person',
		name: settings.name,
		jobTitle: settings.jobTitle,
		address: { '@type': 'PostalAddress', addressLocality: settings.contactLocation },
		sameAs: settings.socials.map((social) => social.href).filter((href) => /^https?:\/\//.test(href))
	})
</script>

<Seo
	description={settings.seoDescription}
	siteName={settings.name}
	structuredData={person}
	title={`${settings.name} · ${settings.jobTitle}`}
	type='website' />

{#snippet body(id: SectionId, heading: string)}
	{#if id === 'about'}
		<About
			{heading}
			lead={home.aboutLead}
			paragraphs={home.aboutParagraphs}
			skillGroups={data.skillGroups} />
	{:else if id === 'approach'}
		<Approach
			count={counts.approach ?? ''}
			{heading}
			intro={home.approachIntro}
			steps={data.approachSteps} />
	{:else if id === 'exhibits'}
		<Exhibits
			count={counts.exhibits ?? ''}
			exhibits={data.exhibits}
			{heading}
			intro={home.exhibitsIntro} />
	{:else if id === 'case-studies'}
		<CaseStudies
			cases={data.caseStudies}
			count={counts['case-studies'] ?? ''}
			{heading}
			intro={home.caseIntro} />
	{:else if id === 'projects'}
		<SideProjects
			count={counts.projects ?? ''}
			{heading}
			intro={home.projectsIntro}
			projects={data.projects} />
	{:else if id === 'contact'}
		<Contact
			email={settings.contactEmail}
			{form}
			{heading}
			lead={home.contactLead}
			location={settings.contactLocation}
			phone={settings.contactPhone}
			reasons={settings.contactReasons}
			resumeUrl={settings.resumeUrl} />
	{/if}
{/snippet}

<main
	id='main-content'
	tabindex='-1'>
	<Hero
		jobTitle={settings.jobTitle}
		lead={home.heroLead}
		name={settings.name}
		showAvailability={settings.showAvailability}
		socials={settings.socials} />
	{#each ordered as section, index (section.id)}
		<SectionShell
			count={counts[section.id]}
			divider={index < ordered.length - 1}
			id={section.id}
			label={section.label}
			variant={section.id === 'contact' ? 'contact' : 'default'}>
			{@render body(section.id, section.heading)}
		</SectionShell>
	{/each}
</main>
