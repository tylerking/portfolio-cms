const CASE_ROUTE = /^\/case-studies\/([^/]+)$/

export const morphName = (slug: string) => `case-${slug}`

export const caseSlug = (pathname: string | undefined) => (pathname && CASE_ROUTE.exec(pathname)?.[1]) || null

export const morphsTitle = (from: string | undefined, to: string | undefined) =>
	!!from && !!to && from !== to && (CASE_ROUTE.test(from) || CASE_ROUTE.test(to))
