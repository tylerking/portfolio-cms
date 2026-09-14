import { and, asc, eq } from 'drizzle-orm'
import { labelsSchema } from '$lib/schemas'
import { SECTION_IDS } from '$lib/sections'
import type { CaseNavigation, HomeContent, HomeLists, SectionId, SiteSettings } from '$lib/types'
import { db } from './'
import { approachSteps, projects, skillGroups } from './collections'
import * as tables from './schema'

const defaultSettings = (): SiteSettings => ({
	id: 0,
	name: '',
	jobTitle: '',
	seoDescription: '',
	footerText: '',
	showAvailability: false,
	contactEmail: '',
	contactPhone: '',
	contactLocation: '',
	contactReasons: [],
	resumeUrl: '',
	socials: [],
	labels: labelsSchema.parse({})
})

const defaultHome = (): HomeContent => ({
	id: 0,
	heroLead: '',
	aboutLead: '',
	aboutParagraphs: [],
	approachIntro: '',
	exhibitsIntro: '',
	caseIntro: '',
	projectsIntro: '',
	contactLead: '',
	sections: SECTION_IDS.map((id) => ({ id, label: '', heading: '' }))
})

const publishedExhibits = eq(tables.exhibits.published, true)
const publishedCases = eq(tables.caseStudies.published, true)

export async function getSettings(): Promise<SiteSettings> {
	const [row] = await db.select().from(tables.siteSettings).limit(1)
	if (!row) return defaultSettings()
	return { ...row, labels: labelsSchema.parse(row.labels ?? {}) }
}

export async function getHomeContent(): Promise<HomeContent> {
	const [row] = await db.select().from(tables.homeContent).limit(1)
	return row ?? defaultHome()
}

export async function getEmptySections(): Promise<Set<SectionId>> {
	const [approach, exhibits, cases, sideProjects] = await Promise.all([
		db.$count(tables.approachSteps),
		db.$count(tables.exhibits, publishedExhibits),
		db.$count(tables.caseStudies, publishedCases),
		db.$count(tables.projects)
	])
	const counts: Partial<Record<SectionId, number>> = {
		approach,
		exhibits,
		'case-studies': cases,
		projects: sideProjects
	}
	return new Set(SECTION_IDS.filter((id) => counts[id] === 0))
}

export async function getHomeLists(): Promise<HomeLists> {
	const [skills, steps, sideProjects, exhibitRows, caseRows] = await Promise.all([
		skillGroups.list(),
		approachSteps.list(),
		projects.list(),
		db.select().from(tables.exhibits).where(publishedExhibits).orderBy(asc(tables.exhibits.sort)),
		db.select().from(tables.caseStudies).where(publishedCases).orderBy(asc(tables.caseStudies.sort))
	])
	return {
		skillGroups: skills,
		approachSteps: steps,
		projects: sideProjects,
		exhibits: exhibitRows,
		caseStudies: caseRows
	}
}

export async function getCaseBySlug(slug: string) {
	const [row] = await db
		.select()
		.from(tables.caseStudies)
		.where(and(eq(tables.caseStudies.slug, slug), publishedCases))
		.limit(1)
	return row ?? null
}

export async function getCaseNavigation(slug: string): Promise<CaseNavigation> {
	const rows = await db
		.select({ slug: tables.caseStudies.slug, title: tables.caseStudies.title })
		.from(tables.caseStudies)
		.where(publishedCases)
		.orderBy(asc(tables.caseStudies.sort))
	const index = rows.findIndex((row) => row.slug === slug)
	return { index, total: rows.length, previous: rows[index - 1] ?? null, next: rows[index + 1] ?? null }
}

export const getSitemapCases = () =>
	db
		.select({ slug: tables.caseStudies.slug, updatedAt: tables.caseStudies.updatedAt })
		.from(tables.caseStudies)
		.where(publishedCases)
		.orderBy(asc(tables.caseStudies.sort))
