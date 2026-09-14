import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearDraft, emptyDraft, loadDraft, saveDraft } from './draft'

afterEach(() => {
	vi.restoreAllMocks()
	localStorage.clear()
})

describe('contact draft', () => {
	it('saves only filled fields and reads them back', () => {
		saveDraft({ ...emptyDraft(), name: 'Ada', message: 'Hello' })
		const stored = JSON.parse(localStorage.getItem('contact-draft') ?? '{}')
		expect(Object.keys(stored).sort()).toEqual(['message', 'name', 'savedAt'])
		expect(loadDraft()).toEqual({ name: 'Ada', message: 'Hello' })
	})

	it('removes the draft once every field is empty', () => {
		saveDraft({ ...emptyDraft(), name: 'Ada' })
		saveDraft(emptyDraft())
		expect(localStorage.getItem('contact-draft')).toBeNull()
	})

	it('drops a week-old draft, and ignores non-text or corrupt values', () => {
		localStorage.setItem('contact-draft', JSON.stringify({ name: 'Old', savedAt: Date.now() - 8 * 86_400_000 }))
		expect(loadDraft()).toEqual({})
		expect(localStorage.getItem('contact-draft')).toBeNull()
		localStorage.setItem('contact-draft', JSON.stringify({ name: 42, email: 'ada@example.com' }))
		expect(loadDraft()).toEqual({ email: 'ada@example.com' })
		localStorage.setItem('contact-draft', '{corrupt')
		expect(loadDraft()).toEqual({})
	})

	it('treats blocked storage as no draft', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('blocked', 'SecurityError')
		})
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
			throw new DOMException('blocked', 'SecurityError')
		})
		expect(loadDraft()).toEqual({})
		expect(() => clearDraft()).not.toThrow()
	})
})
