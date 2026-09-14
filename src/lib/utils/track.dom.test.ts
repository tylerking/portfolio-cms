import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('$app/environment', () => ({ browser: true, dev: true }))

const { initClickTracking, trackPageview } = await import('./track')

const beacon = vi.fn((_url: string, _body: Blob) => true)
const sentBody = async () => JSON.parse((await beacon.mock.calls[0]?.[1].text()) ?? '')

beforeEach(() => {
	Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true })
	Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
})

afterEach(() => {
	beacon.mockClear()
	vi.unstubAllGlobals()
	document.body.innerHTML = ''
})

describe('trackPageview', () => {
	it('sends a JSON beacon', async () => {
		trackPageview('/case-studies/x', 'https://linkedin.com/')
		expect(beacon).toHaveBeenCalledWith('/api/event', expect.any(Blob))
		expect(await sentBody()).toEqual({ type: 'pageview', path: '/case-studies/x', referrer: 'https://linkedin.com/' })
	})

	it('respects Do Not Track', () => {
		Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
		trackPageview('/', '')
		expect(beacon).not.toHaveBeenCalled()
	})

	it('falls back to a keepalive fetch without sendBeacon', () => {
		Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true })
		const fetch = vi.fn(() => Promise.resolve(new Response()))
		vi.stubGlobal('fetch', fetch)
		trackPageview('/', '')
		expect(fetch).toHaveBeenCalledWith('/api/event', expect.objectContaining({ method: 'POST', keepalive: true }))
	})
})

describe('initClickTracking', () => {
	const click = (href: string) => {
		const link = document.createElement('a')
		link.href = href
		link.textContent = 'link'
		document.body.append(link)
		link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
	}

	it('records resume downloads and outbound clicks without their query strings', async () => {
		const stop = initClickTracking('/resume.pdf')
		click('/resume.pdf')
		expect(await sentBody()).toMatchObject({ type: 'resume', path: '/resume.pdf' })
		beacon.mockClear()
		click('https://github.com/example/repo?token=secret#readme')
		expect(await sentBody()).toMatchObject({ type: 'outbound', path: 'https://github.com/example/repo' })
		beacon.mockClear()
		click('/case-studies/x')
		document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(beacon).not.toHaveBeenCalled()
		stop()
		click('/resume.pdf')
		expect(beacon).not.toHaveBeenCalled()
	})
})
