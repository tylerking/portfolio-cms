export const EXHIBIT_STATUSES = ['experimental', 'emerging', 'stabilizing', 'established'] as const

export const MESSAGE_STATUSES = ['new', 'replied', 'archived', 'needs-review'] as const

export const toOptions = (values: readonly string[]) =>
	values.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ') }))
