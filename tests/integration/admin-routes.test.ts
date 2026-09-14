import { isHttpError, isRedirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { SECTION_IDS } from '$lib/sections'
import { db } from '$lib/server/db'
import { caseStudies, exhibits, projects, saveSiteSettings } from '$lib/server/db/collections'
import { getHomeContent, getSettings } from '$lib/server/db/queries'
import * as tables from '$lib/server/db/schema'
import { getImage } from '$lib/server/media/blobs'
import { load as adminLayout } from '../../src/routes/admin/+layout.server'
import * as dashboard from '../../src/routes/admin/+page.server'
import { load as adminRest } from '../../src/routes/admin/[...rest]/+page.server'
import * as approach from '../../src/routes/admin/approach/+page.server'
import * as caseList from '../../src/routes/admin/case-studies/+page.server'
import * as caseEditor from '../../src/routes/admin/case-studies/[id]/+page.server'
import * as exhibitList from '../../src/routes/admin/exhibits/+page.server'
import * as globals from '../../src/routes/admin/globals/+page.server'
import * as homeEditor from '../../src/routes/admin/home/+page.server'
import * as leads from '../../src/routes/admin/leads/+page.server'
import * as projectList from '../../src/routes/admin/projects/+page.server'
import * as skills from '../../src/routes/admin/skills/+page.server'
import { action, outcome } from '../helpers/actions'
import { loaded, requestEvent, thrown } from '../helpers/event'
import {
	insertCase,
	insertExhibit,
	insertMessage,
	insertProject,
	insertSkill,
	insertStep,
	pngFile
} from '../helpers/factories'

const asAdmin = (init: Parameters<typeof requestEvent>[0] = {}) =>
	requestEvent({ admin: true, routeId: '/admin', ...init })
const run = (
	actions: Parameters<typeof action>[0],
	name: string,
	form: Record<string, string | Blob>,
	params?: Record<string, string>
) => action(actions, name)(asAdmin({ form, params }).event)

describe('admin shell', () => {
	it('requires a session for every admin page but the login form', async () => {
		expect(isRedirect(await thrown(() => adminLayout(requestEvent({ routeId: '/admin' }).event)))).toBe(true)
		expect(await adminLayout(asAdmin().event)).toEqual({ admin: true, name: expect.any(String) })
		expect(isHttpError(await thrown(() => adminRest(asAdmin().event)), 404)).toBe(true)
	})

	it('refuses an action to a signed-out visitor before it reads the form', async () => {
		const error = await thrown(() =>
			action(
				skills.actions,
				'create'
			)(requestEvent({ routeId: '/admin/skills', form: { label: 'X', items: 'Y' } }).event)
		)
		expect(isRedirect(error)).toBe(true)
		expect(await db.$count(tables.skillGroups)).toBe(0)
	})
})

describe('dashboard', () => {
	it('shows real analytics and entry counts by default, and sample data on request', async () => {
		await insertSkill()
		await insertCase()
		const real = await loaded(dashboard.load(asAdmin().event))
		expect(real.analytics.source).toBe('real')
		expect(real.counts).toEqual({ exhibits: 0, cases: 1, skills: 1, approach: 0, projects: 0 })
		const mock = await loaded(dashboard.load(asAdmin({ cookies: { admin_data_source: 'mock' } }).event))
		expect(mock.analytics.source).toBe('mock')
	})

	it('switches the data source and reloads the dashboard', async () => {
		const { event, jar } = asAdmin({ form: { source: 'mock' } })
		const error = await thrown(() => action(dashboard.actions, 'setSource')(event))
		expect(isRedirect(error) && error.location).toBe('/admin')
		expect(jar.get('admin_data_source')?.value).toBe('mock')
	})
})

describe('leads', () => {
	it('lists leads and changes their status', async () => {
		const lead = await insertMessage()
		expect((await loaded(leads.load(asAdmin().event))).messages).toHaveLength(1)
		expect(await run(leads.actions, 'setStatus', { id: String(lead.id), status: 'replied' })).toEqual({ success: true })
		expect((await db.select().from(tables.messages))[0]?.status).toBe('replied')
		expect(outcome(await run(leads.actions, 'setStatus', { id: String(lead.id), status: 'spam' }))).toEqual({
			status: 400,
			message: 'Invalid status update'
		})
		expect(await run(leads.actions, 'delete', { id: String(lead.id) })).toEqual({ success: true })
		expect(await db.$count(tables.messages)).toBe(0)
	})
})

describe('globals', () => {
	const valid = {
		name: 'Tyler',
		jobTitle: 'Engineer',
		seoDescription: '',
		footerText: '',
		contactEmail: 'tk@example.com',
		contactPhone: '',
		contactLocation: 'Portland',
		contactReasons: 'New Project',
		resumeUrl: '/assets/resume.pdf',
		socials: ''
	}

	it('saves the settings and every submitted label', async () => {
		expect(await run(globals.actions, 'update', { ...valid, label__skipToContent: 'Jump to content' })).toEqual({
			success: true
		})
		const settings = await getSettings()
		expect(settings).toMatchObject({ name: 'Tyler', contactReasons: ['New Project'] })
		expect(settings.labels.skipToContent).toBe('Jump to content')
		expect((await loaded(globals.load(asAdmin().event))).settings.name).toBe('Tyler')
	})

	it('rejects an invalid field or an over-long label', async () => {
		expect(outcome(await run(globals.actions, 'update', { ...valid, name: '' }))).toMatchObject({
			status: 400,
			field: 'name'
		})
		expect(
			outcome(await run(globals.actions, 'update', { ...valid, label__figurePrefix: 'x'.repeat(21) }))
		).toMatchObject({
			status: 400,
			message: expect.stringMatching(/^labels: /)
		})
	})
})

describe('home editor', () => {
	const copy = {
		heroLead: 'Hi',
		aboutLead: '',
		aboutParagraphs: '',
		approachIntro: '',
		exhibitsIntro: '',
		caseIntro: '',
		projectsIntro: '',
		contactLead: ''
	}
	const sections = Object.fromEntries(
		SECTION_IDS.flatMap((id) => [
			[`section__${id}__label`, id],
			[`section__${id}__heading`, `${id} heading`]
		])
	)

	it('saves the copy and the section order', async () => {
		const order = [...SECTION_IDS].reverse().join(',')
		expect(await run(homeEditor.actions, 'update', { ...copy, ...sections, sectionOrder: order })).toEqual({
			success: true
		})
		const home = await getHomeContent()
		expect(home.heroLead).toBe('Hi')
		expect(home.sections.map((section) => section.id).join(',')).toBe(order)
		expect((await loaded(homeEditor.load(asAdmin().event))).home.heroLead).toBe('Hi')
	})

	it('rejects an incomplete order or an invalid section', async () => {
		expect(outcome(await run(homeEditor.actions, 'update', { ...copy, ...sections, sectionOrder: 'about' }))).toEqual({
			status: 400,
			message: 'Section order must list every section once.'
		})
		expect(
			outcome(
				await run(homeEditor.actions, 'update', {
					...copy,
					...sections,
					section__about__label: 'x'.repeat(41),
					sectionOrder: SECTION_IDS.join(',')
				})
			)
		).toMatchObject({ status: 400, message: expect.stringMatching(/^sections: /) })
		expect(
			outcome(
				await run(homeEditor.actions, 'update', {
					...sections,
					sectionOrder: SECTION_IDS.join(','),
					heroLead: 'x'.repeat(601)
				})
			)
		).toMatchObject({
			status: 400,
			field: 'heroLead'
		})
	})
})

describe('collection pages', () => {
	it('wire approach, skills and projects to their stores', async () => {
		await insertStep()
		await insertSkill()
		expect((await loaded(approach.load(asAdmin().event))).steps).toHaveLength(1)
		expect((await loaded(skills.load(asAdmin().event))).skills).toHaveLength(1)
		expect(await run(approach.actions, 'create', { title: 'Plan', description: 'Think' })).toEqual({ success: true })
		expect(
			await run(projectList.actions, 'create', {
				title: 'Tool',
				description: '',
				tags: 'a, b',
				url: 'https://example.com'
			})
		).toEqual({
			success: true
		})
		expect((await loaded(projectList.load(asAdmin().event))).projects[0]).toMatchObject({
			title: 'Tool',
			tags: ['a', 'b']
		})
	})

	it('uploads a project cover by the project id in the form', async () => {
		const project = await insertProject()
		const id = String(project.id)
		expect(outcome(await run(projectList.actions, 'uploadCover', { id, cover: pngFile() }))).toEqual({
			status: 400,
			message: 'Cover alt text is required.',
			field: 'coverAlt'
		})
		expect((await projects.get(project.id))?.coverKey).toBeNull()
		expect(await run(projectList.actions, 'uploadCover', { id, cover: pngFile(), coverAlt: 'A map.' })).toEqual({
			success: true
		})
		expect((await projects.get(project.id))?.coverKey).toMatch(/\.png$/)
		expect(
			outcome(await run(projectList.actions, 'uploadCover', { id: 'x', cover: pngFile(), coverAlt: 'A map.' }))
		).toMatchObject({
			status: 404
		})
	})

	it('refuses to save a project that has a cover without alt text', async () => {
		const fields = { title: 'Tool', description: '', tags: '', url: '' }
		const bare = await insertProject()
		expect(await run(projectList.actions, 'update', { ...fields, id: String(bare.id), coverAlt: '' })).toEqual({
			success: true
		})
		const covered = await insertProject({ coverKey: 'cover.png', coverAlt: 'A map.' })
		expect(
			outcome(await run(projectList.actions, 'update', { ...fields, id: String(covered.id), coverAlt: ' ' }))
		).toEqual({ status: 400, message: 'Cover alt text is required.', field: 'coverAlt' })
		expect((await projects.get(covered.id))?.coverAlt).toBe('A map.')
	})

	it('create case studies and exhibits as drafts, and delete them with their images', async () => {
		expect(isRedirect(await thrown(() => run(caseList.actions, 'create', { title: 'New Case' })))).toBe(true)
		expect(
			await run(exhibitList.actions, 'create', {
				title: 'New Exhibit',
				slug: '',
				description: '',
				category: '',
				status: 'experimental'
			})
		).toEqual({ success: true })
		expect((await loaded(caseList.load(asAdmin().event))).cases[0]).toMatchObject({
			slug: 'new-case',
			published: false
		})
		expect((await loaded(exhibitList.load(asAdmin().event))).exhibits[0]).toMatchObject({
			slug: 'new-exhibit',
			published: false
		})
		const [study] = await caseStudies.list()
		expect(await run(caseList.actions, 'delete', { id: String(study?.id) })).toEqual({ success: true })
		expect(await caseStudies.count()).toBe(0)
	})
})

describe('case study editor', () => {
	const fields = { slug: 'case', title: 'Case', year: '2025', summary: '', tags: '', meta: '[]', sections: '[]' }
	const editor = async () => {
		const study = await insertCase()
		return { study, params: { id: String(study.id) } }
	}

	it('loads by id and 404s a bad or missing one', async () => {
		const { study, params } = await editor()
		expect((await loaded(caseEditor.load(asAdmin({ params }).event))).study.id).toBe(study.id)
		expect(isHttpError(await thrown(() => caseEditor.load(asAdmin({ params: { id: '9999' } }).event)), 404)).toBe(true)
		expect(isHttpError(await thrown(() => caseEditor.load(asAdmin({ params: { id: 'abc' } }).event)), 404)).toBe(true)
	})

	it('saves details and reports a taken slug on the slug field', async () => {
		const { params } = await editor()
		await insertCase({ slug: 'taken' })
		expect(await run(caseEditor.actions, 'update', { ...fields, title: 'Renamed', published: 'on' }, params)).toEqual({
			success: true
		})
		expect(outcome(await run(caseEditor.actions, 'update', { ...fields, slug: 'taken' }, params))).toMatchObject({
			status: 400,
			field: 'slug'
		})
		expect(outcome(await run(caseEditor.actions, 'update', { ...fields, title: '' }, params))).toMatchObject({
			status: 400,
			field: 'title'
		})
	})

	it('keeps every media result in the media scope', async () => {
		const { study, params } = await editor()
		const alt = 'A bar chart.'
		expect(await run(caseEditor.actions, 'uploadCover', { cover: pngFile(), coverAlt: alt }, params)).toEqual({
			success: true,
			scope: 'media'
		})
		expect(await run(caseEditor.actions, 'removeCover', {}, params)).toEqual({ success: true, scope: 'media' })
		expect(
			await run(caseEditor.actions, 'addFigure', { image: pngFile(), title: 'One', description: '', alt }, params)
		).toEqual({ success: true, scope: 'media' })
		expect(
			outcome(await run(caseEditor.actions, 'addFigure', { image: pngFile(), title: '', description: '', alt }, params))
		).toEqual({ status: 400, message: 'Title is required.', scope: 'media' })
		expect(
			outcome(await run(caseEditor.actions, 'addFigure', { image: pngFile(), title: 'T', description: '' }, params))
		).toEqual({ status: 400, message: 'Alt text is required.', scope: 'media' })
		expect(
			outcome(
				await run(
					caseEditor.actions,
					'addFigure',
					{ image: new File(['x'], 'x.png'), title: 'T', description: '', alt },
					params
				)
			)
		).toMatchObject({
			status: 400,
			scope: 'media'
		})
		expect(
			outcome(
				await run(
					caseEditor.actions,
					'addFigure',
					{ image: pngFile(), title: 'T', description: '', alt },
					{ id: '9999' }
				)
			)
		).toMatchObject({
			status: 404,
			scope: 'media'
		})
		expect(
			outcome(await run(caseEditor.actions, 'updateFigure', { key: '', title: 'T', description: '' }, params))
		).toMatchObject({ scope: 'media' })
		expect(
			outcome(await run(caseEditor.actions, 'moveFigure', { key: 'k', direction: 'sideways' }, params))
		).toMatchObject({
			scope: 'media'
		})
		expect((await caseStudies.get(study.id))?.figures).toHaveLength(1)
	})

	it('edits, moves and removes figures, deleting the removed image', async () => {
		const { study, params } = await editor()
		await run(
			caseEditor.actions,
			'addFigure',
			{ image: pngFile(), title: 'One', description: '', alt: 'A bar chart.' },
			params
		)
		await run(
			caseEditor.actions,
			'addFigure',
			{ image: pngFile(), title: 'Two', description: '', alt: 'A line chart.' },
			params
		)
		const [first, second] = (await caseStudies.get(study.id))?.figures ?? []
		const firstKey = first?.key ?? ''
		expect([first?.alt, second?.alt]).toEqual(['A bar chart.', 'A line chart.'])

		await run(
			caseEditor.actions,
			'updateFigure',
			{ key: firstKey, title: 'First', description: 'Note', alt: 'Weekly leads by reason.' },
			params
		)
		expect(
			outcome(
				await run(
					caseEditor.actions,
					'updateFigure',
					{ key: firstKey, title: 'First', description: '', alt: ' ' },
					params
				)
			)
		).toEqual({ status: 400, message: 'Alt text is required.', scope: 'media' })
		await run(caseEditor.actions, 'moveFigure', { key: firstKey, direction: 'down' }, params)
		expect((await caseStudies.get(study.id))?.figures.map((figure) => [figure.title, figure.alt])).toEqual([
			['Two', 'A line chart.'],
			['First', 'Weekly leads by reason.']
		])

		expect(
			outcome(
				await run(
					caseEditor.actions,
					'updateFigure',
					{ key: 'missing.png', title: 'X', description: '', alt: 'A chart.' },
					params
				)
			)
		).toEqual({
			status: 400,
			message: 'Figure not found',
			scope: 'media'
		})
		expect(outcome(await run(caseEditor.actions, 'removeFigure', { key: 'missing.png' }, params))).toMatchObject({
			status: 400
		})

		expect(await run(caseEditor.actions, 'removeFigure', { key: firstKey }, params)).toEqual({
			success: true,
			scope: 'media'
		})
		expect((await caseStudies.get(study.id))?.figures.map((figure) => figure.key)).toEqual([second?.key])
		expect(await getImage(firstKey)).toBeNull()
	})

	it('deletes the case study and returns to the list', async () => {
		const { study, params } = await editor()
		const error = await thrown(() => run(caseEditor.actions, 'delete', {}, params))
		expect(isRedirect(error) && error.location).toBe('/admin/case-studies')
		expect(await caseStudies.get(study.id)).toBeNull()
	})
})

describe('exhibit list', () => {
	const fields = { slug: 'exhibit', title: 'Exhibit', description: '', category: '', status: 'emerging' }

	it('creates, saves, rejects a taken slug and deletes', async () => {
		const exhibit = await insertExhibit()
		await insertExhibit({ slug: 'taken' })
		expect(await run(exhibitList.actions, 'update', { ...fields, id: String(exhibit.id) })).toEqual({ success: true })
		expect((await db.select().from(tables.exhibits).where(eq(tables.exhibits.id, exhibit.id)))[0]?.status).toBe(
			'emerging'
		)
		expect(
			outcome(await run(exhibitList.actions, 'update', { ...fields, slug: 'taken', id: String(exhibit.id) }))
		).toMatchObject({
			field: 'slug'
		})
		expect(
			outcome(await run(exhibitList.actions, 'update', { ...fields, status: 'retired', id: String(exhibit.id) }))
		).toMatchObject({ field: 'status' })
		expect(await run(exhibitList.actions, 'create', { ...fields, slug: '', title: 'Derived Slug' })).toEqual({
			success: true
		})
		expect((await exhibits.list()).map((row) => row.slug)).toContain('derived-slug')
		expect(await run(exhibitList.actions, 'delete', { id: String(exhibit.id) })).toEqual({ success: true })
		expect(await exhibits.get(exhibit.id)).toBeNull()
	})
})

describe('settings survive a partial label save', () => {
	it('keeps labels that were not submitted at their defaults', async () => {
		await saveSiteSettings({ labels: { skipToContent: 'Custom' } })
		expect((await getSettings()).labels.errorTitle).toBe('Page not found')
	})
})
