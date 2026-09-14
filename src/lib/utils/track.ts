import { browser } from '$app/environment'

type BeaconType = 'pageview' | 'resume' | 'outbound'

function send(type: BeaconType, path: string, referrer = '') {
	if (!browser || navigator.doNotTrack === '1') return
	const body = JSON.stringify({ type, path, referrer })
	if (navigator.sendBeacon) {
		navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))
	} else {
		fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true })
	}
}

export function trackPageview(path: string, referrer: string) {
	send('pageview', path, referrer)
}

export function initClickTracking(resumeUrl: string): () => void {
	const onClick = (event: MouseEvent) => {
		const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
		if (!link) return
		if (link.getAttribute('href') === resumeUrl) send('resume', resumeUrl)
		else if (link.origin !== location.origin) send('outbound', `${link.origin}${link.pathname}`.slice(0, 300))
	}
	document.addEventListener('click', onClick, { capture: true })
	return () => document.removeEventListener('click', onClick, { capture: true })
}
