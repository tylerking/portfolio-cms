import { expect, test } from '@playwright/test'
import { BASE_URL } from './env'

test('an encoded admin path is still guarded', async ({ request }) => {
	const page = await request.get('/%61dmin/leads', { maxRedirects: 0 })
	expect(page.status()).toBe(303)
	expect(page.headers().location).toBe('/admin/login')
	expect(await (await request.get('/%61dmin/leads/__data.json')).text()).toContain('"type":"redirect"')
})

test('a signed-out post to an admin action is redirected without running', async ({ request }) => {
	const response = await request.post('/admin/leads?/setStatus', {
		form: { id: '1', status: 'archived' },
		headers: { origin: BASE_URL, accept: 'text/html' },
		maxRedirects: 0
	})
	expect(response.status()).toBe(303)
	expect(response.headers().location).toBe('/admin/login')
})

test('rendered pages carry the security headers, and admin is kept out of search', async ({ request }) => {
	for (const path of ['/', '/case-studies/this-site', '/no-such-page']) {
		const headers = (await request.get(path)).headers()
		expect(headers['x-frame-options'], path).toBe('DENY')
		expect(headers['x-content-type-options'], path).toBe('nosniff')
		expect(headers['strict-transport-security'], path).toBeTruthy()
		expect(headers['content-security-policy'], path).toContain("frame-ancestors 'none'")
	}
	expect((await request.get('/admin/login')).headers()['x-robots-tag']).toBe('noindex, nofollow')
})

test('media serves stored images sandboxed and refuses path traversal', async ({ request }) => {
	const image = await request.get('/media/seed-portfolio-dashboard.png')
	expect(image.status()).toBe(200)
	expect(image.headers()['content-type']).toBe('image/png')
	expect(image.headers()['content-security-policy']).toBe("default-src 'none'; sandbox")
	expect((await request.get('/media/..%2F..%2F.env')).status()).toBe(404)
})

test('the event beacon only accepts same-origin JSON', async ({ request }) => {
	const data = { type: 'pageview', path: '/', referrer: '' }
	const post = (headers: Record<string, string>, body: unknown = data) =>
		request.post('/api/event', { data: body, headers }).then((response) => response.status())
	expect(await post({ origin: 'https://example.com' })).toBe(403)
	expect(await post({ origin: BASE_URL, 'content-type': 'text/plain' }, 'x')).toBe(415)
	expect(await post({ origin: BASE_URL })).toBe(204)
})

test('robots.txt and the sitemap point crawlers at published pages only', async ({ request }) => {
	expect(await (await request.get('/robots.txt')).text()).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`)
	const sitemap = await (await request.get('/sitemap.xml')).text()
	expect(sitemap).toContain(`${BASE_URL}/case-studies/this-site`)
	expect(sitemap).not.toContain('/admin')
})
