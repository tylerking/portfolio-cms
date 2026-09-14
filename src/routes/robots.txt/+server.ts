import { PUBLIC_CACHE } from '$lib/server/http/cache'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = ({ url }) =>
	new Response(`User-agent: *\nDisallow: /admin\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
		headers: { ...PUBLIC_CACHE, 'content-type': 'text/plain; charset=utf-8' }
	})
