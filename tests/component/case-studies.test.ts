import { screen } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import CaseStudies from '$lib/components/sections/CaseStudies'
import type { CaseStudy } from '$lib/types'
import { caseStudy } from '../helpers/content'
import { renderWithLabels } from '../helpers/labels'

vi.mock('$app/navigation', () => ({ onNavigate: vi.fn(), afterNavigate: vi.fn() }))

const renderLedger = (cases: CaseStudy[]) =>
	renderWithLabels(CaseStudies, { heading: 'Selected work', intro: '', count: `${cases.length} studies`, cases })

describe('the case study ledger', () => {
	it('shows a cover as the row thumbnail with its alt text, and hides the empty frame of a study without one', () => {
		const { container } = renderLedger([
			caseStudy({
				id: 1,
				slug: 'with-cover',
				title: 'With cover',
				coverKey: 'cover.png',
				coverAlt: 'A bar chart of leads by week.'
			}),
			caseStudy({ id: 2, slug: 'without-cover', title: 'Without cover' })
		])
		const cover = screen.getByRole('img', { name: 'A bar chart of leads by week.' })
		expect(cover).toHaveAttribute('src', '/media/cover.png')
		expect(cover.parentElement).not.toHaveAttribute('aria-hidden')
		expect(container.querySelectorAll('img')).toHaveLength(1)
		expect(container.querySelectorAll('[aria-hidden="true"]:empty')).toHaveLength(1)
		expect(screen.getByRole('link', { name: 'With cover' })).toHaveAttribute('href', '/case-studies/with-cover')
		expect(screen.getByRole('link', { name: 'Without cover' })).toHaveAttribute('href', '/case-studies/without-cover')
	})
})
