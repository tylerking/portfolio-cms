import { randomUUID } from 'node:crypto'
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

const figureDetailsSchema = caseFigureSchema.pick({ title: true, description: true, alt: true })
const figureEditSchema = caseFigureSchema.pick({ id: true, title: true, description: true, alt: true })
const SCOPE = 'media'

const mediaFailure = (status: number, message: string) => fail(status, { message, scope: SCOPE })

const hasFile = (value: FormDataEntryValue | null) => value instanceof File && value.size > 0

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

async function findFigure(studyId: number, figureId: string) {
	const study = await caseStudies.get(studyId)
	if (!study) return { failure: mediaFailure(404, 'Case study not found') }
	const figure = study.figures.find((entry) => entry.id === figureId)
	return figure ? { figures: study.figures, figure } : { failure: mediaFailure(400, 'Figure not found') }
}

async function saveFigures(studyId: number, figures: CaseFigure[], replacedKey: string | null) {
	await caseStudies.update(studyId, { figures })
	await deleteImages([replacedKey])
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
		let key: string | null = null
		if (hasFile(form.get('image'))) {
			const stored = await storeUpload(form.get('image'))
			if ('error' in stored) return mediaFailure(400, stored.error)
			key = stored.key
		}
		return withFigures(id, (figures) => [...figures, { id: randomUUID(), key, ...details.data }])
	},
	updateFigure: async ({ request, params }) => {
		const parsed = parseForm(await request.formData(), figureEditSchema)
		if (!parsed.ok) return mediaFailure(400, parsed.message)
		const { id, ...details } = parsed.data
		return withFigures(routeId(params.id), (figures) =>
			figures.some((figure) => figure.id === id)
				? figures.map((figure) => (figure.id === id ? { ...figure, ...details } : figure))
				: 'Figure not found'
		)
	},
	uploadFigureImage: async ({ request, params }) => {
		const form = await request.formData()
		const parsed = parseForm(form, figureEditSchema)
		if (!parsed.ok) return mediaFailure(400, parsed.message)
		const studyId = routeId(params.id)
		const found = await findFigure(studyId, parsed.data.id)
		if ('failure' in found) return found.failure
		const stored = await storeUpload(form.get('image'))
		if ('error' in stored) return mediaFailure(400, stored.error)
		const figures = found.figures.map((figure) =>
			figure.id === found.figure.id ? { ...figure, ...parsed.data, key: stored.key } : figure
		)
		return saveFigures(studyId, figures, found.figure.key)
	},
	moveFigure: async ({ request, params }) => {
		const parsed = parseForm(await request.formData(), figureMoveSchema)
		if (!parsed.ok) return mediaFailure(400, parsed.message)
		return withFigures(routeId(params.id), (figures) => {
			const index = figures.findIndex((figure) => figure.id === parsed.data.id)
			return moveItem(figures, index, parsed.data.direction === 'up' ? index - 1 : index + 1)
		})
	},
	removeFigure: async ({ request, params }) => {
		const studyId = routeId(params.id)
		const found = await findFigure(studyId, String((await request.formData()).get('id') ?? ''))
		if ('failure' in found) return found.failure
		const figures = found.figures.filter((figure) => figure.id !== found.figure.id)
		return saveFigures(studyId, figures, found.figure.key)
	},
	delete: async ({ params }) => {
		await destroyCaseStudy(routeId(params.id))
		throw redirect(303, '/admin/case-studies')
	}
})
