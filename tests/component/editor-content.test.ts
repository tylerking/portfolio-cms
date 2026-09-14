import { screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import SocialLinks from '$lib/components/elements/SocialLinks'
import CaseArticle from '$lib/components/sections/CaseArticle'
import { caseNavigation, caseStudy } from '../helpers/content'
import { renderWithLabels } from '../helpers/labels'

const study = caseStudy({
	meta: [
		{ label: 'Role', value: 'Lead' },
		{ label: 'Role', value: 'Engineer' }
	],
	sections: [
		{ tag: '', heading: 'First', paragraphs: ['Same'] },
		{ tag: '', heading: 'Second', paragraphs: ['Same'] }
	]
})

describe('content an editor can save', () => {
	it('renders repeated meta labels and blank section tags', () => {
		renderWithLabels(CaseArticle, { study, navigation: caseNavigation() })
		expect(screen.getByText('Lead')).toBeInTheDocument()
		expect(screen.getByText('Engineer')).toBeInTheDocument()
		expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
			'First',
			'Second'
		])
	})

	it('renders two social links to the same address', () => {
		renderWithLabels(SocialLinks, {
			socials: [
				{ label: 'Mail', href: 'mailto:tk@example.com' },
				{ label: 'Email', href: 'mailto:tk@example.com' }
			]
		})
		expect(screen.getAllByRole('link')).toHaveLength(2)
	})
})
