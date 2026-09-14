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
	it('shows a cover as the row thumbnail and keeps an empty frame for a study without one', () => {
		const { container } = renderLedger([
			caseStudy({ id: 1, slug: 'with-cover', title: 'With cover', coverKey: 'cover.png' }),
			caseStudy({ id: 2, slug: 'without-cover', title: 'Without cover' })
		])
		const frames = container.querySelectorAll('[aria-hidden="true"]:has(> img), [aria-hidden="true"]:empty')
		expect(frames).toHaveLength(2)
		const images = container.querySelectorAll('img')
		expect(images).toHaveLength(1)
		expect(images[0]).toHaveAttribute('src', '/media/cover.png')
		expect(images[0]).toHaveAttribute('alt', '')
		expect(screen.getByRole('link', { name: 'With cover' })).toHaveAttribute('href', '/case-studies/with-cover')
		expect(screen.getByRole('link', { name: 'Without cover' })).toHaveAttribute('href', '/case-studies/without-cover')
	})
})
