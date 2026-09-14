import type { Attachment } from 'svelte/attachments'

// Hidden only here, after scripts run: markup without JavaScript must never ship at opacity 0.
export const revealOnScroll: Attachment<HTMLElement> = (element) => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
	let measured = false
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry) return
			if (!measured) {
				measured = true
				if (entry.boundingClientRect.top < window.innerHeight) {
					observer.disconnect()
					return
				}
				element.dataset.reveal = ''
			}
			if (!entry.isIntersecting) return
			delete element.dataset.reveal
			observer.disconnect()
		},
		{ rootMargin: '0px 0px -10% 0px' }
	)
	observer.observe(element)
	return () => observer.disconnect()
}
