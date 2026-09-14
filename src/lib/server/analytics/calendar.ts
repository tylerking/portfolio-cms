const DAY_MILLISECONDS = 86_400_000

const calendarDate = (milliseconds: number) => new Date(milliseconds).toISOString().slice(0, 10)

function startOfToday(): number {
	const now = new Date()
	now.setUTCHours(0, 0, 0, 0)
	return now.getTime()
}

export function lastDays(count: number): string[] {
	const today = startOfToday()
	return Array.from({ length: count }, (_, index) => calendarDate(today - (count - 1 - index) * DAY_MILLISECONDS))
}

// ISO weeks start Monday, matching Postgres date_trunc('week').
export function lastMondays(count: number): string[] {
	const today = startOfToday()
	const monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY_MILLISECONDS
	return Array.from({ length: count }, (_, index) => calendarDate(monday - (count - 1 - index) * 7 * DAY_MILLISECONDS))
}
