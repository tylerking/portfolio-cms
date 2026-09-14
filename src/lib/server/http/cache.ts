import { purgeCache } from '@netlify/functions'
import { dev } from '$app/environment'

export const PUBLIC_CACHE = {
	'cache-control': 'public, max-age=0, must-revalidate',
	'netlify-cdn-cache-control': 'public, durable, s-maxage=86400, stale-while-revalidate=604800',
	'netlify-cache-tag': 'content'
}

export async function purgeTags(tags: string[]): Promise<void> {
	if (dev) return
	try {
		await purgeCache({ tags })
	} catch (error) {
		console.error(`Could not purge cache tags: ${tags.join(', ')}`, error)
	}
}
