import { describe, expect, it } from 'vitest'
import { DEFAULT_LABELS } from './labels/label-defaults'
import {
	beaconSchema,
	caseSchema,
	contactSchema,
	homeContentSchema,
	idSchema,
	labelsSchema,
	loginSchema,
	newEntrySchema,
	projectSchema,
	reorderSchema,
	sectionOrderSchema,
	settingsSchema
} from './schemas'
import { SECTION_IDS } from './sections'

type Result = { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }
const failedAt = (result: Result) => (result.success ? null : (result.error?.issues[0]?.path.join('.') ?? ''))

describe('contactSchema', () => {
	const valid = { name: ' Ada ', email: 'ada@example.com', message: 'Hello' }

	it('trims and fills the optional fields', () => {
		expect(contactSchema.parse(valid)).toEqual({
			name: 'Ada',
			email: 'ada@example.com',
			phone: '',
			reason: '',
			message: 'Hello',
			companyReference: ''
		})
	})

	it.each([
		['name', { ...valid, name: '  ' }],
		['email', { ...valid, email: 'not-an-email' }],
		['message', { ...valid, message: 'x'.repeat(5001) }],
		['companyReference', { ...valid, companyReference: 'x'.repeat(201) }]
	])('rejects a bad %s', (field, input) => {
		expect(failedAt(contactSchema.safeParse(input))).toBe(field)
	})
})

describe('loginSchema', () => {
	it('normalises the email', () => {
		expect(loginSchema.parse({ email: '  Ada@Example.COM ', password: 'x' }).email).toBe('ada@example.com')
	})

	it('requires a password', () => {
		expect(failedAt(loginSchema.safeParse({ email: 'ada@example.com', password: '' }))).toBe('password')
	})
})

describe('settingsSchema', () => {
	const valid = {
		name: 'Tyler',
		jobTitle: 'Engineer',
		seoDescription: '',
		footerText: '',
		contactEmail: 'tk@example.com',
		contactPhone: '',
		contactLocation: 'Portland',
		contactReasons: 'New Project\n\n Consultation \nNew Project',
		resumeUrl: '/assets/resume.pdf',
		socials: 'GitHub | https://github.com/example\n\nMail | mailto:tk@example.com'
	}

	it('splits the multi-line fields, drops repeated reasons and treats a missing checkbox as off', () => {
		const parsed = settingsSchema.parse(valid)
		expect(parsed.contactReasons).toEqual(['New Project', 'Consultation'])
		expect(parsed.socials).toEqual([
			{ label: 'GitHub', href: 'https://github.com/example' },
			{ label: 'Mail', href: 'mailto:tk@example.com' }
		])
		expect(parsed.showAvailability).toBe(false)
		expect(settingsSchema.parse({ ...valid, showAvailability: 'on' }).showAvailability).toBe(true)
	})

	it.each(['javascript:alert(1)', '//evil.example/x', 'ftp://example.com/file'])('rejects the resume URL %s', (url) => {
		expect(failedAt(settingsSchema.safeParse({ ...valid, resumeUrl: url }))).toBe('resumeUrl')
	})

	it('rejects a social line without a URL', () => {
		expect(failedAt(settingsSchema.safeParse({ ...valid, socials: 'GitHub' }))).toBe('socials.0.href')
	})
})

describe('caseSchema', () => {
	const valid = {
		slug: 'this-site',
		year: '2025',
		title: 'This site',
		summary: '',
		tags: 'SvelteKit, Drizzle, SvelteKit,',
		meta: JSON.stringify([
			{ label: 'Role', value: 'Everything' },
			{ label: ' ', value: '' }
		]),
		sections: JSON.stringify([{ tag: '', heading: 'Why', paragraphs: ['One'] }])
	}

	it('splits tags, drops repeated tags and blank editor rows', () => {
		const parsed = caseSchema.parse(valid)
		expect(parsed.tags).toEqual(['SvelteKit', 'Drizzle'])
		expect(parsed.meta).toEqual([{ label: 'Role', value: 'Everything' }])
		expect(parsed.published).toBe(false)
	})

	it.each([
		['slug', { ...valid, slug: 'This Site' }],
		['meta', { ...valid, meta: '{not json' }],
		['meta.0.value', { ...valid, meta: JSON.stringify([{ label: 'Role', value: '' }]) }]
	])('rejects %s', (path, input) => {
		expect(failedAt(caseSchema.safeParse(input))).toBe(path)
	})
})

describe('sectionOrderSchema', () => {
	it('accepts every section exactly once', () => {
		expect(sectionOrderSchema.parse(SECTION_IDS.join(','))).toEqual([...SECTION_IDS])
	})

	it.each([
		['a duplicate', [...SECTION_IDS.slice(1), SECTION_IDS[1]].join(',')],
		['a missing section', SECTION_IDS.slice(1).join(',')],
		['an unknown section', [...SECTION_IDS.slice(1), 'blog'].join(',')]
	])('rejects %s', (_case, input) => {
		expect(sectionOrderSchema.safeParse(input).success).toBe(false)
	})
})

describe('reorderSchema', () => {
	it('parses and coerces a JSON id list', () => {
		expect(reorderSchema.parse('[3, 1, "2"]')).toEqual([3, 1, 2])
	})

	it.each(['[]', 'not json', '[0]', '[1.5]'])('rejects %s', (input) => {
		expect(reorderSchema.safeParse(input).success).toBe(false)
	})
})

describe('beaconSchema', () => {
	it.each([
		[{ type: 'pageview', path: '/case-studies/x' }, true],
		[{ type: 'pageview', path: 'case-studies/x' }, false],
		[{ type: 'outbound', path: 'https://github.com/example' }, true],
		[{ type: 'outbound', path: '/relative' }, false],
		[{ type: 'contact', path: '/' }, false]
	])('%o is valid: %s', (input, valid) => {
		expect(beaconSchema.safeParse(input).success).toBe(valid)
	})

	it('defaults the referrer', () => {
		expect(beaconSchema.parse({ type: 'pageview', path: '/' }).referrer).toBe('')
	})
})

describe('labelsSchema', () => {
	it('fills every label from the defaults table', () => {
		expect(labelsSchema.parse({})).toEqual(DEFAULT_LABELS)
	})

	it('trims values and enforces each label length', () => {
		expect(labelsSchema.parse({ skipToContent: '  Jump  ' }).skipToContent).toBe('Jump')
		expect(labelsSchema.safeParse({ figurePrefix: 'x'.repeat(21) }).success).toBe(false)
	})
})

describe('other form schemas', () => {
	it('defaults a new entry slug to empty so it can be derived from the title', () => {
		expect(newEntrySchema.parse({ title: 'New' })).toEqual({ title: 'New', slug: '' })
	})

	it('splits about paragraphs on blank lines and caps them at twenty', () => {
		const copy = {
			heroLead: '',
			aboutLead: '',
			approachIntro: '',
			exhibitsIntro: '',
			caseIntro: '',
			projectsIntro: '',
			contactLead: ''
		}
		expect(homeContentSchema.parse({ ...copy, aboutParagraphs: 'One\n\n\nTwo' }).aboutParagraphs).toEqual([
			'One',
			'Two'
		])
		expect(homeContentSchema.safeParse({ ...copy, aboutParagraphs: Array(21).fill('p').join('\n\n') }).success).toBe(
			false
		)
	})

	it('caps each project tag', () => {
		expect(failedAt(projectSchema.safeParse({ title: 'P', description: '', tags: 'x'.repeat(51), url: '' }))).toBe(
			'tags.0'
		)
	})

	it('accepts only positive integer ids', () => {
		expect(idSchema.parse('5')).toBe(5)
		expect(idSchema.safeParse('0').success).toBe(false)
		expect(idSchema.safeParse('1.5').success).toBe(false)
	})
})
