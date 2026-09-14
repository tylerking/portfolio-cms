import { describe, expect, it } from 'vitest'
import { MESSAGE_STATUSES, toOptions } from './enums'

describe('toOptions', () => {
	it('capitalises and spaces each value for display', () => {
		expect(toOptions(MESSAGE_STATUSES)).toEqual([
			{ value: 'new', label: 'New' },
			{ value: 'replied', label: 'Replied' },
			{ value: 'archived', label: 'Archived' },
			{ value: 'needs-review', label: 'Needs review' }
		])
	})
})
