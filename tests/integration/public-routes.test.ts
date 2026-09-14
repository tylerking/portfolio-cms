import { isHttpError } from '@sveltejs/kit'
import { describe, expect, it } from 'vitest'
import { clientKey } from '$lib/server/auth/rate-limit'
import { db } from '$lib/server/db'
import { saveHomeContent, saveSiteSettings } from '$lib/server/db/collections'
import * as tables from '$lib/server/db/schema'
import { PUBLIC_CACHE } from '$lib/server/http/cache'
import { storeUpload } from '$lib/server/media/blobs'
import { load as layout } from '../../src/routes/(site)/+layout.server'
import { actions, load as home } from '../../src/routes/(site)/+page.server'
import { load as rest } from '../../src/routes/(site)/[...rest]/+page.server'
import { load as caseStudy } from '../../src/routes/(site)/case-studies/[slug]/+page.server'
import { POST as beacon } from '../../src/routes/api/event/+server'
import { GET as media } from '../../src/routes/media/[...key]/+server'
import { GET as robots } from '../../src/routes/robots.txt/+server'
import { GET as sitemap } from '../../src/routes/sitemap.xml/+server'
import { action, outcome } from '../helpers/actions'
import { loaded, ORIGIN, requestEvent, thrown } from '../helpers/event'
import { insertCase, insertStep, pngFile } from '../helpers/factories'

describe('site loads', () => {
	it('hides the sections that have nothing published', async () => {
		await saveHomeContent({
			sections: [
				{ id: 'about', label: 'About', heading: 'Me' },
				{ id: 'approach', label: 'Approach', heading: 'How' },
				{ id: 'projects', label: 'Projects', heading: 'Side' }
			]
		})
		await insertStep()
		const data = await loaded(layout(requestEvent().event))
		expect(data.home.sections.map(({ id }: { id: string }) => id)).toEqual(['about', 'approach'])
	})

	it('serves the home lists with the shared CDN cache headers', async () => {
		const { event, responseHeaders } = requestEvent()
		const data = await home(event)
		expect(data).toMatchObject({ skillGroups: [], caseStudies: [] })
		expect(responseHeaders).toEqual(PUBLIC_CACHE)
	})

	it('serves a published case study and 404s anything else', async () => {
		await insertCase({ slug: 'live' })
		await insertCase({ slug: 'next-live', title: 'Next', sort: 1 })
		const { event, responseHeaders } = requestEvent({ params: { slug: 'live' } })
		expect(await caseStudy(event)).toMatchObject({
			study: { slug: 'live' },
			navigation: { index: 0, total: 2, previous: null, next: { slug: 'next-live', title: 'Next' } }
		})
		expect(responseHeaders).toEqual(PUBLIC_CACHE)
		expect(isHttpError(await thrown(() => caseStudy(requestEvent({ params: { slug: 'nope' } }).event)), 404)).toBe(true)
		expect(isHttpError(await thrown(() => rest(requestEvent().event)), 404)).toBe(true)
	})
})

describe('contact action', () => {
	const contact = action(actions, 'contact')
	const send = (form: Record<string, string>, ip?: string) => contact(requestEvent({ form, ip }).event)
	const valid = { name: 'Ada', email: 'ada@example.com', reason: 'New Project', message: 'Hello' }

	it('stores the lead and records a contact event', async () => {
		await saveSiteSettings({ contactReasons: ['New Project'] })
		expect(await send(valid)).toEqual({ success: true })
		expect(await db.select().from(tables.messages)).toMatchObject([
			{ name: 'Ada', reason: 'New Project', status: 'new' }
		])
		expect(await db.select().from(tables.events)).toMatchObject([{ type: 'contact' }])
	})

	it('drops a reason that is not on the list', async () => {
		await saveSiteSettings({ contactReasons: ['New Project'] })
		await send({ ...valid, reason: '<script>' })
		expect((await db.select().from(tables.messages))[0]?.reason).toBe('')
	})

	it('flags a honeypot hit for review instead of dropping it, and records no event', async () => {
		expect(await send({ ...valid, companyReference: 'Acme' })).toEqual({ success: true })
		expect(await db.select().from(tables.messages)).toMatchObject([{ status: 'needs-review' }])
		expect(await db.$count(tables.events)).toBe(0)
	})

	it('returns the failing field and echoes what was typed', async () => {
		expect(outcome(await send({ ...valid, email: 'nope' }))).toMatchObject({
			status: 400,
			field: 'email',
			values: { name: 'Ada', email: 'nope', message: 'Hello' }
		})
	})

	it('rate-limits one client after five messages, telling them how long to wait', async () => {
		for (let attempt = 0; attempt < 5; attempt++) await send(valid, '203.0.113.20')
		expect(outcome(await send(valid, '203.0.113.20'))).toMatchObject({
			status: 429,
			message: expect.stringContaining('10 minutes')
		})
		expect(await send(valid, '203.0.113.21')).toEqual({ success: true })
	})
})

describe('event beacon', () => {
	const post = (body: string, headers: Record<string, string> = {}, ip?: string) =>
		beacon(
			requestEvent({
				path: '/api/event',
				method: 'POST',
				body,
				ip,
				headers: { origin: ORIGIN, 'content-type': 'application/json', ...headers }
			}).event
		)
	const pageview = (path: string, referrer = '') => JSON.stringify({ type: 'pageview', path, referrer })

	it('records a pageview, keeping only the referring host', async () => {
		expect((await post(pageview('/case-studies/x', 'https://www.linkedin.com/feed?id=1'))).status).toBe(204)
		expect(await db.select().from(tables.events)).toMatchObject([
			{ type: 'pageview', path: '/case-studies/x', referrer: 'www.linkedin.com' }
		])
	})

	it('drops own-site and unparseable referrers', async () => {
		await post(pageview('/', `${ORIGIN}/case-studies/x`))
		await post(pageview('/', 'not a url'))
		expect((await db.select().from(tables.events)).map((row) => row.referrer)).toEqual(['', ''])
	})

	it.each([
		['a cross-origin request', { origin: 'https://evil.example' }, 403],
		['a non-JSON body', { 'content-type': 'text/plain' }, 415],
		['a declared oversized body', { 'content-length': '5000' }, 413]
	])('rejects %s', async (_case, headers, status) => {
		expect((await post(pageview('/'), headers)).status).toBe(status)
		expect(await db.$count(tables.events)).toBe(0)
	})

	it('rejects an oversized body that did not declare its length', async () => {
		expect((await post(`{"type":"pageview","path":"/${'x'.repeat(2100)}"}`)).status).toBe(413)
	})

	it.each([
		['a bot', pageview('/'), { 'user-agent': 'Googlebot/2.1' }],
		['an admin path', pageview('/admin/leads'), {}],
		['malformed JSON', '{nope', {}],
		['an invalid event', JSON.stringify({ type: 'contact', path: '/' }), {}]
	])('accepts but ignores %s', async (_case, body, headers) => {
		expect((await post(body, headers)).status).toBe(204)
		expect(await db.$count(tables.events)).toBe(0)
	})

	it('rate-limits a flooding client', async () => {
		await db
			.insert(tables.rateLimits)
			.values({ key: clientKey('event', '203.0.113.30'), count: 120, expiresAt: new Date(Date.now() + 60_000) })
		expect((await post(pageview('/'), {}, '203.0.113.30')).status).toBe(429)
	})
})

describe('media, robots and sitemap', () => {
	it('serves a stored image with a locked-down sandbox policy', async () => {
		const stored = await storeUpload(pngFile())
		const key = 'key' in stored ? stored.key : ''
		const response = await media(requestEvent({ params: { key } }).event)
		expect(response.headers.get('content-type')).toBe('image/png')
		expect(response.headers.get('content-security-policy')).toBe("default-src 'none'; sandbox")
		expect(response.headers.get('netlify-cache-tag')).toBe('media')
		expect(isHttpError(await thrown(() => media(requestEvent({ params: { key: '../.env' } }).event)), 404)).toBe(true)
	})

	it('keeps crawlers out of admin and points them at the sitemap', async () => {
		const text = await (await robots(requestEvent().event)).text()
		expect(text).toBe(`User-agent: *\nDisallow: /admin\n\nSitemap: ${ORIGIN}/sitemap.xml\n`)
	})

	it('lists the home page and every published case study', async () => {
		await insertCase({ slug: 'live' })
		await insertCase({ slug: 'draft', published: false })
		const response = await sitemap(requestEvent().event)
		const xml = await response.text()
		expect(response.headers.get('content-type')).toBe('application/xml; charset=utf-8')
		expect(xml).toContain(`<loc>${ORIGIN}/</loc>`)
		expect(xml).toContain(`<loc>${ORIGIN}/case-studies/live</loc>`)
		expect(xml).not.toContain('draft')
	})
})
