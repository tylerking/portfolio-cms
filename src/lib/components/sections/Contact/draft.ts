const STORAGE_KEY = 'contact-draft'
const TIME_TO_LIVE = 7 * 24 * 60 * 60 * 1000

export const DRAFT_FIELDS = ['name', 'email', 'phone', 'reason', 'message'] as const

export type Draft = Record<(typeof DRAFT_FIELDS)[number], string>

export const emptyDraft = (): Draft => ({ name: '', email: '', phone: '', reason: '', message: '' })

function attempt<Result>(callback: () => Result): Result | undefined {
	try {
		return callback()
	} catch {
		return undefined
	}
}

function filled(source: Record<string, unknown>): Partial<Draft> {
	const out: Partial<Draft> = {}
	for (const key of DRAFT_FIELDS) {
		const value = source[key]
		if (typeof value === 'string' && value) out[key] = value
	}
	return out
}

export function loadDraft(): Partial<Draft> {
	return (
		attempt(() => {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (!raw) return {}
			const stored: Record<string, unknown> = JSON.parse(raw)
			if (typeof stored.savedAt === 'number' && Date.now() - stored.savedAt > TIME_TO_LIVE) {
				localStorage.removeItem(STORAGE_KEY)
				return {}
			}
			return filled(stored)
		}) ?? {}
	)
}

export function saveDraft(values: Draft) {
	attempt(() => {
		const draft = filled(values)
		if (Object.keys(draft).length) localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
		else localStorage.removeItem(STORAGE_KEY)
	})
}

export function clearDraft() {
	attempt(() => localStorage.removeItem(STORAGE_KEY))
}
