import { describe, expect, it } from 'vitest'
import headersFile from '../../../../_headers?raw'
import { globalHeaders } from './headers'

describe('globalHeaders', () => {
	it('reads the indented lines of the /* block and stops at the next path', () => {
		expect(globalHeaders('/*\n  A: 1\n  B: two: parts\n/media/*\n  C: 3')).toEqual([
			['A', '1'],
			['B', 'two: parts']
		])
	})

	it('reads to the end of the file and skips lines that are not headers', () => {
		expect(globalHeaders('/*\n  A: 1\n  # note')).toEqual([['A', '1']])
	})

	it('refuses a file with no /* block', () => {
		expect(() => globalHeaders('/media/*\n  C: 3')).toThrow('_headers must define a /* block')
	})

	it('keeps the font cache rule out of the headers every rendered page carries', () => {
		const names = globalHeaders(headersFile).map(([name]) => name)
		expect(names).toContain('Strict-Transport-Security')
		expect(names).not.toContain('Cache-Control')
		expect(headersFile).toMatch(/^\/fonts\/\*\n\s+Cache-Control: public, max-age=31536000, immutable$/m)
	})
})
