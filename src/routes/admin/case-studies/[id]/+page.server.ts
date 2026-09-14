import { error, fail, isActionFailure, redirect } from '@sveltejs/kit'
import { caseFigureSchema, caseSchema, figureMoveSchema } from '$lib/schemas'
import { adminActions } from '$lib/server/auth/auth'
import { caseStudies } from '$lib/server/db/collections'
import { destroyCaseStudy } from '$lib/server/db/destroy'
import { coverActions } from '$lib/server/http/actions'
import { parseForm, routeId, uniqueSlug } from '$lib/server/http/forms'
import { deleteImages, storeUpload } from '$lib/server/media/blobs'
import type { CaseFigure } from '$lib/types'
import { moveItem } from '$lib/utils/array'
import type { Actions, PageServerLoad } from './$types'

const figureDetailsSchema = caseFigureSchema.omit({ key: true })
const SCOPE = 'media'

const mediaFailure = (status: number, message: string) => fail(status, { message, scope: SCOPE })

export const load: PageServerLoad = async ({ params }) => {
	const study = await caseStudies.get(routeId(params.id))
	if (!study) throw error(404, 'Case study not found')
	return { study }
}

async function withFigures(id: number, edit: (figures: CaseFigure[]) => CaseFigure[] | string) {
	const current = await caseStudies.get(id)
	if (!current) return mediaFailure(404, 'Case study not found')
	const next = edit(current.figures)
	if (typeof next === 'string') return mediaFailure(400, next)
	await caseStudies.update(id, { figures: next })
	return { success: true, scope: SCOPE }
}

export const actions: Actions = adminActions({
	update: async ({ request, params }) => {
		const parsed = parseForm(await request.formData(), caseSchema)
		if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })
		const saved = await uniqueSlug(() => caseStudies.update(routeId(params.id), parsed.data))
		return isActionFailure(saved) ? saved : { success: true }
	},
	...coverActions({
		locate: ({ params }) => caseStudies.get(routeId(params.id)),
		save: (id, cover) => caseStudies.update(id, cover),
		scope: SCOPE
	}),
	addFigure: async ({ request, params }) => {
		const id = routeId(params.id)
		if (!(await caseStudies.get(id))) return mediaFailure(404, 'Case study not found')
		const form = await request.formData()
		const details = parseForm(form, figureDetailsSchema)
		if (!details.ok) return mediaFailure(400, details.message)
		const stored = await storeUpload(form.get('image'))
		if ('error' in stored) return mediaFailure(400, stored.error)
		return withFigures(id, (figures) => [...figures, { key: stored.key, ...details.data }])
	},
	updateFigure: async ({ request, params }) => {
		const parsed = parseForm(await request.formData(), caseFigureSchema)
		if (!parsed.ok) return mediaFailure(400, parsed.message)
		const { key } = parsed.data
		return withFigures(routeId(params.id), (figures) =>
			figures.some((figure) => figure.key === key)
				? figures.map((figure) => (figure.key === key ? parsed.data : figure))
				: 'Figure not found'
		)
	},
	moveFigure: async ({ request, params }) => {
		const parsed = parseForm(await request.formData(), figureMoveSchema)
		if (!parsed.ok) return mediaFailure(400, parsed.message)
		return withFigures(routeId(params.id), (figures) => {
			const index = figures.findIndex((figure) => figure.key === parsed.data.key)
			return moveItem(figures, index, parsed.data.direction === 'up' ? index - 1 : index + 1)
		})
	},
	removeFigure: async ({ request, params }) => {
		const key = String((await request.formData()).get('key') ?? '')
		const result = await withFigures(routeId(params.id), (figures) =>
			figures.some((figure) => figure.key === key) ? figures.filter((figure) => figure.key !== key) : 'Figure not found'
		)
		if (!isActionFailure(result)) await deleteImages([key])
		return result
	},
	delete: async ({ params }) => {
		await destroyCaseStudy(routeId(params.id))
		throw redirect(303, '/admin/case-studies')
	}
})
