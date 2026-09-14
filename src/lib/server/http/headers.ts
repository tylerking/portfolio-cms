export function globalHeaders(file: string): [string, string][] {
	const lines = file.split('\n')
	const start = lines.indexOf('/*') + 1
	if (start === 0) throw new Error('_headers must define a /* block')
	const end = lines.findIndex((line, index) => index >= start && !/^\s/.test(line))
	return lines.slice(start, end === -1 ? undefined : end).flatMap((line) => {
		const colon = line.indexOf(':')
		return colon === -1 ? [] : [[line.slice(0, colon).trim(), line.slice(colon + 1).trim()] as [string, string]]
	})
}
