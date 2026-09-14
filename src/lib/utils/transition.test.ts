import { describe, expect, it } from 'vitest'
import { caseSlug, morphName, morphsTitle } from './transition'

describe('morphName', () => {
	it('names the pair after the slug', () => {
		expect(morphName('this-site')).toBe('case-this-site')
	})
})

describe('caseSlug', () => {
	it('reads the slug from a study path', () => {
		expect(caseSlug('/case-studies/this-site')).toBe('this-site')
	})

	it.each([['/'], ['/case-studies/this-site/extra'], ['/case-studies/'], [undefined]])(
		'finds no study in %s',
		(path) => {
			expect(caseSlug(path)).toBeNull()
		}
	)
})

describe('morphsTitle', () => {
	it.each([
		['the list to a study', '/', '/case-studies/this-site'],
		['a study back to the list', '/case-studies/this-site', '/'],
		['a study to its neighbour', '/case-studies/this-site', '/case-studies/risknet']
	])('morphs %s', (_case, from, to) => {
		expect(morphsTitle(from, to)).toBe(true)
	})

	it.each([
		['an anchor on the same page', '/', '/'],
		['a page with no study on either side', '/', '/colophon'],
		['a nested path that is not a study', '/', '/case-studies/this-site/extra'],
		['a navigation with no origin', undefined, '/case-studies/this-site'],
		['a navigation with no destination', '/case-studies/this-site', undefined]
	])('leaves %s alone', (_case, from, to) => {
		expect(morphsTitle(from, to)).toBe(false)
	})
})
