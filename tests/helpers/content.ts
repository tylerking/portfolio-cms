import type { CaseNavigation, CaseStudy, ShownFigure } from '$lib/types'

export const caseStudy = (overrides: Partial<CaseStudy> = {}): CaseStudy => ({
	id: 1,
	slug: 'repeats',
	year: '2026',
	title: 'Repeats',
	summary: 'A study.',
	tags: ['Svelte'],
	meta: [],
	sections: [],
	figures: [],
	coverKey: null,
	coverAlt: '',
	published: true,
	sort: 0,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides
})

export const caseNavigation = (overrides: Partial<CaseNavigation> = {}): CaseNavigation => ({
	index: 0,
	total: 1,
	previous: null,
	next: null,
	...overrides
})

export const caseFigures = (count: number): ShownFigure[] =>
	Array.from({ length: count }, (_, index) => ({
		id: `figure-${index + 1}`,
		key: `figure-${index + 1}.png`,
		title: `Figure ${index + 1}`,
		description: `What figure ${index + 1} shows.`,
		alt: `Screenshot ${index + 1}.`
	}))
