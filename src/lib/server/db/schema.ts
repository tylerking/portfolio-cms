import { sql } from 'drizzle-orm'
import { boolean, check, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import type {
	CaseFigure,
	CaseMeta,
	CaseSection,
	EventType,
	ExhibitStatus,
	Labels,
	MessageStatus,
	Section,
	Social,
	UserRole
} from '$lib/types'
import { eventTypeSchema, exhibitStatusSchema, messageStatusSchema, userRoleSchema } from '../../schemas'

const oneOf = (values: readonly string[]) => sql.raw(values.map((value) => `'${value}'`).join(', '))

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}

export const siteSettings = pgTable('site_settings', {
	id: serial('id').primaryKey(),
	name: text('name').notNull().default(''),
	jobTitle: text('job_title').notNull().default(''),
	seoDescription: text('seo_description').notNull().default(''),
	footerText: text('footer_text').notNull().default(''),
	showAvailability: boolean('show_availability').notNull().default(true),
	contactEmail: text('contact_email').notNull().default(''),
	contactPhone: text('contact_phone').notNull().default(''),
	contactLocation: text('contact_location').notNull().default(''),
	contactReasons: jsonb('contact_reasons').$type<string[]>().notNull().default([]),
	resumeUrl: text('resume_url').notNull().default(''),
	socials: jsonb('socials').$type<Social[]>().notNull().default([]),
	labels: jsonb('labels').$type<Partial<Labels>>().notNull().default({})
})

export const homeContent = pgTable('home_content', {
	id: serial('id').primaryKey(),
	heroLead: text('hero_lead').notNull().default(''),
	aboutLead: text('about_lead').notNull().default(''),
	aboutParagraphs: jsonb('about_paragraphs').$type<string[]>().notNull().default([]),
	approachIntro: text('approach_intro').notNull().default(''),
	exhibitsIntro: text('exhibits_intro').notNull().default(''),
	caseIntro: text('case_intro').notNull().default(''),
	projectsIntro: text('projects_intro').notNull().default(''),
	contactLead: text('contact_lead').notNull().default(''),
	sections: jsonb('sections').$type<Section[]>().notNull().default([])
})

export const skillGroups = pgTable('skill_groups', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	sort: integer('sort').notNull().default(0)
})

export const approachSteps = pgTable('approach_steps', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	sort: integer('sort').notNull().default(0)
})

export const projects = pgTable('projects', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	tags: jsonb('tags').$type<string[]>().notNull().default([]),
	url: text('url').notNull().default(''),
	coverKey: text('cover_key'),
	coverAlt: text('cover_alt').notNull().default(''),
	sort: integer('sort').notNull().default(0)
})

export const exhibits = pgTable(
	'exhibits',
	{
		id: serial('id').primaryKey(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		description: text('description').notNull().default(''),
		category: text('category').notNull().default(''),
		status: text('status').$type<ExhibitStatus>().notNull().default('experimental'),
		published: boolean('published').notNull().default(true),
		sort: integer('sort').notNull().default(0),
		...timestamps
	},
	(table) => [check('exhibits_status_check', sql`${table.status} in (${oneOf(exhibitStatusSchema.options)})`)]
)

export const caseStudies = pgTable('case_studies', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	year: text('year').notNull().default(''),
	title: text('title').notNull(),
	summary: text('summary').notNull().default(''),
	tags: jsonb('tags').$type<string[]>().notNull().default([]),
	meta: jsonb('meta').$type<CaseMeta[]>().notNull().default([]),
	sections: jsonb('sections').$type<CaseSection[]>().notNull().default([]),
	figures: jsonb('figures').$type<CaseFigure[]>().notNull().default([]),
	coverKey: text('cover_key'),
	coverAlt: text('cover_alt').notNull().default(''),
	published: boolean('published').notNull().default(true),
	sort: integer('sort').notNull().default(0),
	...timestamps
})

export const messages = pgTable(
	'messages',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		phone: text('phone').notNull().default(''),
		reason: text('reason').notNull().default(''),
		message: text('message').notNull(),
		status: text('status').$type<MessageStatus>().notNull().default('new'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [check('messages_status_check', sql`${table.status} in (${oneOf(messageStatusSchema.options)})`)]
)

export const rateLimits = pgTable('rate_limits', {
	key: text('key').primaryKey(),
	count: integer('count').notNull().default(0),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
})

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		email: text('email').notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		role: text('role').$type<UserRole>().notNull().default('admin'),
		...timestamps
	},
	(table) => [check('users_role_check', sql`${table.role} in (${oneOf(userRoleSchema.options)})`)]
)

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
})

export const events = pgTable(
	'events',
	{
		id: serial('id').primaryKey(),
		type: text('type').$type<EventType>().notNull(),
		path: text('path').notNull().default(''),
		referrer: text('referrer').notNull().default(''),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('events_type_created_at_index').on(table.type, table.createdAt),
		check('events_type_check', sql`${table.type} in (${oneOf(eventTypeSchema.options)})`)
	]
)
