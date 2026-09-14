import { z } from 'zod'
import { EXHIBIT_STATUSES, MESSAGE_STATUSES } from './enums'
import { LABELS, type LabelKey } from './labels/label-defaults'
import { SECTION_IDS } from './sections'

const string = () => z.string({ error: (issue) => (issue.input === undefined ? 'is required' : undefined) })
const text = (max: number) => string().trim().max(max)
const safeUrl = (max: number) =>
	text(max).refine(
		(value) => value === '' || /^\/(?!\/)/.test(value) || /^(https?:\/\/|mailto:)/i.test(value),
		'must be a /path, an http(s):// URL or a mailto: link'
	)
const slug = z
	.string()
	.trim()
	.min(1, 'is required')
	.max(100)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, numbers and dashes only')
const checkbox = z.preprocess((value) => value === 'on' || value === true || value === 'true', z.boolean())
const jsonField = <Schema extends z.ZodTypeAny>(inner: Schema) =>
	z.preprocess((value) => {
		if (typeof value !== 'string') return value
		try {
			return JSON.parse(value)
		} catch {
			return undefined
		}
	}, inner)
const splitBy = <Schema extends z.ZodType>(separator: string | RegExp, schema: Schema, { unique = false } = {}) =>
	z.preprocess((value) => {
		if (typeof value !== 'string') return value
		const parts = value
			.split(separator)
			.map((part) => part.trim())
			.filter(Boolean)
		return unique ? [...new Set(parts)] : parts
	}, schema)
const csv = splitBy(',', z.array(string().max(50)), { unique: true })
const lines = splitBy('\n', z.array(string().max(100)), { unique: true })
const paragraphs = splitBy(/\n\s*\n/, z.array(text(2000)).max(20))

export const exhibitStatusSchema = z.enum(EXHIBIT_STATUSES)
export const caseMetaSchema = z.object({
	label: text(100).min(1, 'is required'),
	value: text(300).min(1, 'is required')
})
export const caseSectionSchema = z.object({
	tag: text(100),
	heading: text(200).min(1, 'is required'),
	paragraphs: z.array(text(4000)).max(20)
})

const dropBlankRows = <Row extends Record<string, unknown>>(rows: Row[]) =>
	rows.filter((row) =>
		Object.values(row).some((value) => (Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== ''))
	)
export const altSchema = z
	.string({ error: (issue) => (issue.input === undefined ? 'text is required' : undefined) })
	.trim()
	.max(300)
	.min(1, 'text is required')
export const caseFigureSchema = z.object({
	key: text(120).min(1, 'is required'),
	title: text(120).min(1, 'is required'),
	description: text(400),
	alt: altSchema
})
export const figureMoveSchema = z.object({ key: text(120).min(1, 'is required'), direction: z.enum(['up', 'down']) })
export const socialSchema = z.object({
	label: text(50).min(1, 'is required'),
	href: safeUrl(300).min(1, 'is required')
})

export const sectionSchema = z.object({
	id: z.enum(SECTION_IDS),
	label: text(40),
	heading: text(200)
})

export const sectionOrderSchema = z
	.string()
	.transform((value) => value.split(',').filter(Boolean))
	.pipe(z.array(z.enum(SECTION_IDS)).length(SECTION_IDS.length))
	.refine((ids) => new Set(ids).size === ids.length)

const labelShape = Object.fromEntries(
	Object.entries(LABELS).map(([key, [value, max]]) => [key, text(max).default(value)])
) as Record<LabelKey, z.ZodDefault<z.ZodString>>

export const labelsSchema = z.object(labelShape)

export const contactSchema = z.object({
	name: text(200).min(1, 'is required'),
	email: string().trim().pipe(z.email().max(200)),
	phone: text(50).default(''),
	reason: text(100).default(''),
	message: text(5000).min(1, 'is required'),
	companyReference: string().max(200).default('')
})

export const userRoleSchema = z.enum(['admin'])

export const loginSchema = z.object({
	email: string().trim().toLowerCase().pipe(z.email().max(200)),
	password: string().min(1, 'is required')
})

export const settingsSchema = z.object({
	name: text(100).min(1, 'is required'),
	jobTitle: text(120).min(1, 'is required'),
	seoDescription: text(400),
	footerText: text(200),
	showAvailability: checkbox,
	contactEmail: text(200).min(1, 'is required').pipe(z.email('must be an email address')),
	contactPhone: text(50),
	contactLocation: text(100).min(1, 'is required'),
	contactReasons: lines,
	resumeUrl: safeUrl(300).min(1, 'is required'),
	socials: splitBy(
		'\n',
		z.array(
			z
				.string()
				.transform((line) => {
					const [label = '', href = ''] = line.split('|').map((part) => part.trim())
					return { label, href }
				})
				.pipe(socialSchema)
		)
	)
})

export const homeContentSchema = z.object({
	heroLead: text(600),
	aboutLead: text(1000),
	aboutParagraphs: paragraphs,
	approachIntro: text(600),
	exhibitsIntro: text(600),
	caseIntro: text(600),
	projectsIntro: text(600),
	contactLead: text(400)
})

export const skillSchema = z.object({
	title: text(100).min(1, 'is required'),
	description: text(500).min(1, 'is required')
})
export const approachSchema = z.object({
	title: text(200).min(1, 'is required'),
	description: text(1000).min(1, 'is required')
})

export const reorderSchema = jsonField(z.array(z.coerce.number().int().positive()).min(1, 'is required').max(500))
export const projectSchema = z.object({
	title: text(200).min(1, 'is required'),
	description: text(1000),
	tags: csv,
	url: safeUrl(300),
	coverAlt: text(300).default('')
})

export const exhibitSchema = z.object({
	slug,
	title: text(200).min(1, 'is required'),
	description: text(500),
	category: text(100),
	status: exhibitStatusSchema,
	published: checkbox
})

export const caseSchema = z.object({
	slug,
	year: text(10),
	title: text(200).min(1, 'is required'),
	summary: text(800),
	tags: csv,
	meta: jsonField(
		z.array(z.record(string(), z.unknown())).transform(dropBlankRows).pipe(z.array(caseMetaSchema).max(20))
	),
	sections: jsonField(
		z.array(z.record(string(), z.unknown())).transform(dropBlankRows).pipe(z.array(caseSectionSchema).max(20))
	),
	published: checkbox
})

export const newEntrySchema = z.object({
	title: text(200).min(1, 'is required'),
	slug: string().trim().max(100).default('')
})

export const idSchema = z.coerce.number().int().positive()

export const messageStatusSchema = z.enum(MESSAGE_STATUSES)
export const eventTypeSchema = z.enum(['pageview', 'resume', 'outbound', 'contact'])
export const beaconSchema = z
	.object({
		type: z.enum(['pageview', 'resume', 'outbound']),
		path: string().trim().min(1, 'is required').max(300),
		referrer: string().trim().max(500).default('')
	})
	.refine(
		(beacon) => (beacon.type === 'outbound' ? /^https?:\/\//.test(beacon.path) : beacon.path.startsWith('/')),
		'invalid path'
	)
