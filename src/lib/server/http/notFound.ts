import { error } from '@sveltejs/kit'

// Without this, unmatched URLs hit the root error page, which has no layout data.
export const notFoundLoad = () => {
	throw error(404, 'Not found')
}
