import { getEmptySections, getHomeContent, getSettings } from '$lib/server/db/queries'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async () => {
	const [settings, home, empty] = await Promise.all([getSettings(), getHomeContent(), getEmptySections()])
	return { settings, home: { ...home, sections: home.sections.filter((section) => !empty.has(section.id)) } }
}
