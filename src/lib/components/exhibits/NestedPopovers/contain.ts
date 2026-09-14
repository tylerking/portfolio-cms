import type { Attachment } from 'svelte/attachments'

const place = (stage: HTMLElement) => {
	const { left, top, width, height } = stage.getBoundingClientRect()
	stage.style.setProperty('--popover-center', `${left + window.scrollX + width / 2}px`)
	stage.style.setProperty('--popover-top', `${top + window.scrollY}px`)
	stage.style.setProperty('--popover-width', `${width}px`)
	stage.style.setProperty('--popover-height', `${height}px`)
}

export const containInStage: Attachment<HTMLElement> = (level) => {
	const stage = level.parentElement
	if (!stage || stage.hasAttribute('popover')) return
	const measure = () => place(stage)
	let frame = 0
	const onResize = () => {
		if (frame) return
		frame = requestAnimationFrame(() => {
			frame = 0
			measure()
		})
	}
	measure()
	const observer = new ResizeObserver(measure)
	observer.observe(stage)
	level.addEventListener('beforetoggle', measure)
	window.addEventListener('resize', onResize)
	return () => {
		observer.disconnect()
		cancelAnimationFrame(frame)
		level.removeEventListener('beforetoggle', measure)
		window.removeEventListener('resize', onResize)
	}
}

export const focusOnOpen: Attachment<HTMLElement> = (level) => {
	const onToggle = (event: Event) => {
		if (!('newState' in event) || event.newState !== 'open') return
		const own = [...level.querySelectorAll<HTMLElement>('button')].find(
			(button) => button.closest('[popover]') === level && button.getClientRects().length > 0
		)
		;(own ?? level).focus()
	}
	level.addEventListener('toggle', onToggle)
	return () => level.removeEventListener('toggle', onToggle)
}
