export const OTHER = 'Other'

const NAMED_SERIES = 4

type Week = { week: string; counts: Record<string, number> }

export function foldSeries(reasons: string[], weeks: Week[]) {
	const named = [...new Set(reasons)].filter((reason) => reason !== OTHER).slice(0, NAMED_SERIES)
	const data = weeks.map(({ week, counts }) => {
		const folded: Record<string, number> = Object.fromEntries(named.map((reason) => [reason, counts[reason] ?? 0]))
		folded[OTHER] = Object.entries(counts).reduce(
			(sum, [reason, count]) => (named.includes(reason) ? sum : sum + count),
			0
		)
		return { week, counts: folded }
	})
	const series = data.some((entry) => (entry.counts[OTHER] ?? 0) > 0) ? [...named, OTHER] : named
	return { series, data }
}
