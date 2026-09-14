import { describe, expect, it } from 'vitest'
import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
import { SECTION_IDS } from '$lib/sections'
import { saveHomeContent, saveSiteSettings } from '$lib/server/db/collections'
import {
	getCaseBySlug,
	getCaseNavigation,
	getEmptySections,
	getHomeContent,
	getHomeLists,
	getSettings,
	getSitemapCases
} from '$lib/server/db/queries'
import { insertCase, insertExhibit, insertProject, insertStep } from '../helpers/factories'

describe('settings and home content', () => {
	it('fall back to empty defaults before anything is saved', async () => {
		const settings = await getSettings()
		expect(settings.name).toBe('')
		expect(settings.labels).toEqual(DEFAULT_LABELS)
		expect((await getHomeContent()).sections.map((section) => section.id)).toEqual([...SECTION_IDS])
	})

	it('complete saved labels with the defaults', async () => {
		await saveSiteSettings({ name: 'Tyler', labels: { skipToContent: 'Jump' } })
		const settings = await getSettings()
		expect(settings.name).toBe('Tyler')
		expect(settings.labels.skipToContent).toBe('Jump')
		expect(settings.labels.errorTitle).toBe(DEFAULT_LABELS.errorTitle)
	})

	it('return saved home content as stored', async () => {
		await saveHomeContent({ heroLead: 'Hello', sections: [{ id: 'about', label: 'About', heading: 'Me' }] })
		expect(await getHomeContent()).toMatchObject({ heroLead: 'Hello', sections: [{ id: 'about' }] })
	})
})

describe('published content', () => {
	it('lists only published exhibits and case studies, in sort order', async () => {
		await insertExhibit({ slug: 'draft', published: false })
		await insertExhibit({ slug: 'second', sort: 1 })
		await insertExhibit({ slug: 'first', sort: 0 })
		await insertCase({ slug: 'draft-case', published: false })
		await insertCase({ slug: 'live-case' })
		const lists = await getHomeLists()
		expect(lists.exhibits.map((row) => row.slug)).toEqual(['first', 'second'])
		expect(lists.caseStudies.map((row) => row.slug)).toEqual(['live-case'])
	})

	it('finds a case study by slug only once it is published', async () => {
		await insertCase({ slug: 'live' })
		await insertCase({ slug: 'hidden', published: false })
		expect(await getCaseBySlug('live')).toMatchObject({ slug: 'live' })
		expect(await getCaseBySlug('hidden')).toBeNull()
		expect(await getCaseBySlug('missing')).toBeNull()
		expect((await getSitemapCases()).map((row) => row.slug)).toEqual(['live'])
	})

	it('places a case study in the published order, with its neighbours', async () => {
		await insertCase({ slug: 'first', title: 'First', sort: 0 })
		await insertCase({ slug: 'draft', title: 'Draft', published: false, sort: 1 })
		await insertCase({ slug: 'middle', title: 'Middle', sort: 2 })
		await insertCase({ slug: 'last', title: 'Last', sort: 3 })
		expect(await getCaseNavigation('middle')).toEqual({
			index: 1,
			total: 3,
			previous: { slug: 'first', title: 'First' },
			next: { slug: 'last', title: 'Last' }
		})
		expect(await getCaseNavigation('first')).toMatchObject({ index: 0, previous: null, next: { slug: 'middle' } })
		expect(await getCaseNavigation('last')).toMatchObject({ index: 2, previous: { slug: 'middle' }, next: null })
	})

	it('reports the sections that have nothing published to show', async () => {
		expect([...(await getEmptySections())].sort()).toEqual(['approach', 'case-studies', 'exhibits', 'projects'])
		await insertStep()
		await insertProject()
		await insertExhibit({ published: false })
		await insertCase()
		expect([...(await getEmptySections())]).toEqual(['exhibits'])
	})
})
