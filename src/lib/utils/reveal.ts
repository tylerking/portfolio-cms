import type { Attachment } from 'svelte/attachments'

const queued = new Map<HTMLElement, () => void>()

function measureQueued() {
	const rows = [...queued]
	queued.clear()
	const below = rows.filter(([element]) => element.getBoundingClientRect().top >= window.innerHeight)
	for (const [, hide] of below) hide()
}

// Hidden only here, after scripts run: markup without JavaScript must never ship at opacity 0.
export const revealOnScroll: Attachment<HTMLElement> = (element) => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
	let observer: IntersectionObserver | undefined
	if (queued.size === 0) queueMicrotask(measureQueued)
	queued.set(element, () => {
		element.dataset.reveal = ''
		observer = new IntersectionObserver(
			([entry]) => {
				if (!entry?.isIntersecting) return
				delete element.dataset.reveal
				observer?.disconnect()
			},
			{ rootMargin: '0px 0px -10% 0px' }
		)
		observer.observe(element)
	})
	return () => {
		queued.delete(element)
		observer?.disconnect()
	}
}
