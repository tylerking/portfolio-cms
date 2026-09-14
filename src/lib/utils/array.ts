export function moveItem<Item>(items: readonly Item[], from: number, to: number): Item[] {
	const next = [...items]
	if (Math.min(from, to) < 0 || Math.max(from, to) >= next.length) return next
	next.splice(to, 0, ...next.splice(from, 1))
	return next
}
