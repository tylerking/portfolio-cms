import { screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import CaseArticle from '$lib/components/sections/CaseArticle'
import * as articleStyles from '$lib/components/sections/CaseArticle/CaseArticle.css'
import { DEFAULT_LABELS } from '$lib/labels/label-defaults'
import { caseFigures, caseNavigation, caseStudy } from '../helpers/content'
import { renderWithLabels } from '../helpers/labels'

const FIGURES_HEADING = { name: DEFAULT_LABELS.figuresHeading, level: 2 }
const TAGS = ['The problem', 'The constraints', 'The approach', 'Key decisions', 'The outcome']

const pick = (container: HTMLElement, className: string) =>
	container.querySelector(`.${className.split(' ').join('.')}`)

const renderStudy = (figures: number, navigation = caseNavigation()) =>
	renderWithLabels(CaseArticle, { study: caseStudy({ figures: caseFigures(figures) }), navigation })

describe('the rail', () => {
	it('puts every section tag in the gutter beside its heading', () => {
		const sections = TAGS.map((tag) => ({ tag, heading: `${tag} heading`, paragraphs: ['Body copy.'] }))
		const { container } = renderWithLabels(CaseArticle, {
			study: caseStudy({ sections }),
			navigation: caseNavigation()
		})
		const rails = [...container.querySelectorAll(`.${articleStyles.railTag}`)]
		expect(rails.map((rail) => rail.textContent)).toEqual(TAGS)
		expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual(
			TAGS.map((tag) => `${tag} heading`)
		)
	})

	it('leaves the gutter empty for a section an editor saved without a tag', () => {
		const { container } = renderWithLabels(CaseArticle, {
			study: caseStudy({ sections: [{ tag: '', heading: 'Untagged', paragraphs: ['Body copy.'] }] }),
			navigation: caseNavigation()
		})
		expect(container.querySelectorAll(`.${articleStyles.railTag}`)).toHaveLength(0)
		expect(screen.getByRole('heading', { level: 2, name: 'Untagged' })).toBeInTheDocument()
	})
})

describe('the title block', () => {
	it.each([3, 4])('holds %i rows without changing shape', (rows) => {
		const meta = Array.from({ length: rows - 1 }, (_, index) => ({
			label: `Label ${index + 1}`,
			value: `Value ${index + 1}`
		}))
		const { container } = renderWithLabels(CaseArticle, { study: caseStudy({ meta }), navigation: caseNavigation() })
		expect(container.querySelectorAll('dl')).toHaveLength(1)
		expect(container.querySelectorAll('dl > div')).toHaveLength(rows)
		expect([...container.querySelectorAll('dl > div')].at(-1)).toHaveTextContent(`${DEFAULT_LABELS.caseYear} 2026`)
	})

	it('drops the year row, and the stamp suffix, when a study has no year', () => {
		renderWithLabels(CaseArticle, {
			study: caseStudy({ year: '' }),
			navigation: caseNavigation({ index: 0, total: 2 })
		})
		expect(screen.getByText(`${DEFAULT_LABELS.caseStamp} 1 / 2`)).toBeInTheDocument()
		expect(screen.queryByText(DEFAULT_LABELS.caseYear)).not.toBeInTheDocument()
	})

	it('stamps the position in the collection and the year', () => {
		renderWithLabels(CaseArticle, {
			study: caseStudy({ year: '2019' }),
			navigation: caseNavigation({ index: 1, total: 5 })
		})
		expect(screen.getByText(`${DEFAULT_LABELS.caseStamp} 2 / 5 · 2019`)).toBeInTheDocument()
	})
})

describe('the figures block', () => {
	it('does not render at all, heading and intro included, without a figure', () => {
		renderStudy(0)
		expect(screen.queryByRole('heading', FIGURES_HEADING)).not.toBeInTheDocument()
		expect(screen.queryByText(DEFAULT_LABELS.figuresIntro)).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /^Enlarge image/ })).not.toBeInTheDocument()
	})

	it.each([1, 2, 6])('lists %i figures as ledger rows in seed order', (count) => {
		renderStudy(count)
		expect(screen.getByRole('heading', FIGURES_HEADING)).toBeInTheDocument()
		const rows = screen.getAllByRole('button', { name: /^Enlarge image/ })
		expect(rows).toHaveLength(count)
		for (const [index, row] of rows.entries()) {
			expect(row).toHaveAccessibleName(
				`${DEFAULT_LABELS.popoverOpen}: ${DEFAULT_LABELS.figurePrefix}0${index + 1} Figure ${index + 1}`
			)
			expect(row).toHaveAccessibleDescription(`What figure ${index + 1} shows.`)
			expect(row).toHaveTextContent(`${DEFAULT_LABELS.figurePrefix}0${index + 1}`)
			expect(row).toHaveTextContent(`Figure ${index + 1}`)
			expect(row).toHaveTextContent(`What figure ${index + 1} shows.`)
			expect(row.querySelector('img')).toHaveAttribute('src', `/media/figure-${index + 1}.png`)
		}
	})
})

describe('study to study navigation', () => {
	const neighbours = {
		previous: { slug: 'before', title: 'The one before' },
		next: { slug: 'after', title: 'The one after' }
	}

	it('links both neighbours by title', () => {
		renderWithLabels(CaseArticle, {
			study: caseStudy(),
			navigation: caseNavigation({ index: 1, total: 3, ...neighbours })
		})
		expect(screen.getByRole('link', { name: 'The one before' })).toHaveAttribute('href', '/case-studies/before')
		expect(screen.getByRole('link', { name: 'The one after' })).toHaveAttribute('href', '/case-studies/after')
	})

	it.each([
		['first', { next: neighbours.next }, DEFAULT_LABELS.casePrevious, articleStyles.pagerPrevious],
		['last', { previous: neighbours.previous }, DEFAULT_LABELS.caseNext, articleStyles.pagerNext]
	])('leaves the missing side of the %s study an empty cell', (_position, ends, missing, side) => {
		const { container } = renderWithLabels(CaseArticle, {
			study: caseStudy(),
			navigation: caseNavigation({ index: 0, total: 2, ...ends })
		})
		expect(screen.queryByText(missing)).not.toBeInTheDocument()
		const empty = pick(container, side)
		expect(empty).toBeEmptyDOMElement()
		expect(pick(container, articleStyles.pager)?.children).toHaveLength(2)
	})

	it('keeps the only all-studies link at the top, since the footer carries the neighbours', () => {
		renderWithLabels(CaseArticle, {
			study: caseStudy(),
			navigation: caseNavigation({ next: { slug: 'after', title: 'After' } })
		})
		const back = screen.getAllByRole('link', { name: DEFAULT_LABELS.allCases.replace('←', '').trim() })
		expect(back).toHaveLength(1)
		expect(back[0]?.compareDocumentPosition(screen.getByRole('heading', { level: 1 }))).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		)
	})
})
