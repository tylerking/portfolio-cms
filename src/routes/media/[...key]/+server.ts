import { error } from '@sveltejs/kit'
import { getImage } from '$lib/server/media/blobs'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
	const image = await getImage(params.key)
	if (!image) throw error(404, 'Not found')
	return new Response(image.data, {
		headers: {
			'content-type': image.contentType,
			'cache-control': 'public, max-age=31536000, immutable',
			'netlify-cache-tag': 'media',
			'content-security-policy': "default-src 'none'; sandbox"
		}
	})
}
