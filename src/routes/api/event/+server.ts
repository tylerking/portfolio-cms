import { beaconSchema } from '$lib/schemas'
import { allow, clientKey } from '$lib/server/auth/rate-limit'
import { events } from '$lib/server/db/collections'
import type { RequestHandler } from './$types'

const MAX_BODY_BYTES = 2048
const EVENTS_PER_WINDOW = 120
const WINDOW_SECONDS = 600
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor/i

const respond = (status: number) => new Response(null, { status })

function parseJson(body: string): unknown {
	try {
		return JSON.parse(body)
	} catch {
		return null
	}
}

function referrerHost(referrer: string, own: string): string {
	try {
		const host = new URL(referrer).hostname
		return host === own || host === 'localhost' ? '' : host
	} catch {
		return ''
	}
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin) return respond(403)
	if (!request.headers.get('content-type')?.startsWith('application/json')) return respond(415)
	if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return respond(413)
	if (BOT.test(request.headers.get('user-agent') ?? '')) return respond(204)

	const body = await request.text()
	if (body.length > MAX_BODY_BYTES) return respond(413)
	if (!(await allow(clientKey('event', getClientAddress()), EVENTS_PER_WINDOW, WINDOW_SECONDS))) return respond(429)

	const parsed = beaconSchema.safeParse(parseJson(body))
	if (!parsed.success || parsed.data.path.startsWith('/admin')) return respond(204)
	const { type, path, referrer } = parsed.data
	await events.create({ type, path, referrer: referrerHost(referrer, url.hostname) })
	return respond(204)
}
