const ARROWS = /([←→↑↓↗↘↙↖]+)/u

export function splitArrows(text: string) {
	return text
		.split(ARROWS)
		.filter(Boolean)
		.map((part) => ({ text: part, arrow: ARROWS.test(part) }))
}
