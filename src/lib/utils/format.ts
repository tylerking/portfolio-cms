const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export const formatCompact = (value: number) => compact.format(value)

export function formatPercent(ratio: number): string {
	return `${(ratio * 100).toFixed(1)}%`
}

export function formatShortDate(date: string): string {
	const [, month, day] = date.split('-')
	return `${Number(month)}/${Number(day)}`
}

export const padTwoDigits = (value: number) => String(value).padStart(2, '0')

export const slugify = (text: string) =>
	text
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
