import type { z } from 'zod'
import type {
	caseFigureSchema,
	caseMetaSchema,
	caseSectionSchema,
	eventTypeSchema,
	exhibitStatusSchema,
	labelsSchema,
	messageStatusSchema,
	sectionSchema,
	socialSchema,
	userRoleSchema
} from '$lib/schemas'
import type * as tables from '$lib/server/db/schema'

export type ExhibitStatus = z.infer<typeof exhibitStatusSchema>
export type CaseMeta = z.infer<typeof caseMetaSchema>
export type CaseSection = z.infer<typeof caseSectionSchema>
export type CaseFigure = z.infer<typeof caseFigureSchema>
export type Social = z.infer<typeof socialSchema>
export type Labels = z.infer<typeof labelsSchema>
export type Section = z.infer<typeof sectionSchema>
export type SectionId = Section['id']
export type MessageStatus = z.infer<typeof messageStatusSchema>
export type EventType = z.infer<typeof eventTypeSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type SkillGroup = typeof tables.skillGroups.$inferSelect
export type ApproachStep = typeof tables.approachSteps.$inferSelect
export type Project = typeof tables.projects.$inferSelect
export type Exhibit = typeof tables.exhibits.$inferSelect
export type CaseStudy = typeof tables.caseStudies.$inferSelect
export type HomeContent = typeof tables.homeContent.$inferSelect

export type SiteSettings = Omit<typeof tables.siteSettings.$inferSelect, 'labels'> & { labels: Labels }

export interface CaseNavigation {
	index: number
	total: number
	previous: { slug: string; title: string } | null
	next: { slug: string; title: string } | null
}

export interface HomeLists {
	skillGroups: SkillGroup[]
	approachSteps: ApproachStep[]
	projects: Project[]
	exhibits: Exhibit[]
	caseStudies: CaseStudy[]
}

export interface HomeData extends HomeLists {
	settings: SiteSettings
	home: HomeContent
}

export type DataSource = 'real' | 'mock'

export interface Analytics {
	source: DataSource
	reasons: string[]
	stats: {
		unanswered: number
		leadsThisMonth: number
		resumeDownloadsLast30Days: number
		pageviewsLast30Days: number
		contactRateLast30Days: number
	}
	leadsByWeek: { week: string; counts: Record<string, number> }[]
	topContent: { path: string; title: string; views: number }[]
	sources: { host: string; views: number }[]
	intent: { day: string; resume: number; outbound: number }[]
}

export type ContactResult = {
	success?: boolean
	message?: string
	field?: string
	values?: Record<string, string>
} | null
