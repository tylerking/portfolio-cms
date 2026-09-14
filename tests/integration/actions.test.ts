import { isRedirect } from '@sveltejs/kit'
import { describe, expect, it } from 'vitest'
import { skillSchema } from '$lib/schemas'
import { exhibits, projects, skillGroups } from '$lib/server/db/collections'
import { destroyCaseStudy, destroyProject } from '$lib/server/db/destroy'
import { collectionActions, coverActions, deleteAction, newEntryAction, reorderAction } from '$lib/server/http/actions'
import { getImage } from '$lib/server/media/blobs'
import { outcome } from '../helpers/actions'
import { requestEvent, thrown } from '../helpers/event'
import { insertCase, insertExhibit, insertProject, insertSkill, pngFile } from '../helpers/factories'

const post = (form: Record<string, string | Blob>) => requestEvent({ form }).event

describe('collectionActions', () => {
	const actions = collectionActions(skillSchema, skillGroups)

	it('creates at the end of the list', async () => {
		await insertSkill({ sort: 3 })
		expect(await actions.create(post({ title: 'Testing', description: 'Vitest' }))).toEqual({ success: true })
		expect((await skillGroups.list()).at(-1)).toMatchObject({ title: 'Testing', sort: 4 })
	})

	it('returns the failing field on invalid input', async () => {
		expect(outcome(await actions.create(post({ title: '', description: 'x' })))).toEqual({
			status: 400,
			message: 'Title is required.',
			field: 'title'
		})
	})

	it('updates a row by id and rejects a missing id', async () => {
		const skill = await insertSkill()
		expect(await actions.update(post({ id: String(skill.id), title: 'Renamed', description: 'y' }))).toEqual({
			success: true
		})
		expect(await skillGroups.get(skill.id)).toMatchObject({ title: 'Renamed' })
		expect(outcome(await actions.update(post({ title: 'x', description: 'y' })))).toEqual({
			status: 400,
			message: 'Missing id'
		})
		expect(outcome(await actions.update(post({ id: String(skill.id), title: '', description: 'y' })))).toMatchObject({
			field: 'title'
		})
	})

	it('reorders and deletes', async () => {
		const first = await insertSkill({ title: 'A', sort: 0 })
		const second = await insertSkill({ title: 'B', sort: 1 })
		expect(await actions.reorder(post({ order: JSON.stringify([second.id, first.id]) }))).toEqual({
			success: true,
			reordered: true
		})
		expect(outcome(await actions.reorder(post({ order: JSON.stringify([second.id]) })))).toEqual({
			status: 400,
			message: 'Invalid order'
		})
		expect(outcome(await actions.reorder(post({ order: 'nonsense' })))).toEqual({
			status: 400,
			message: 'Invalid order'
		})
		expect(await actions.delete(post({ id: String(first.id) }))).toEqual({ success: true })
		expect(outcome(await deleteAction(skillGroups.remove)(post({})))).toEqual({ status: 400, message: 'Missing id' })
		expect(reorderAction).toBeTypeOf('function')
	})
})

describe('newEntryAction', () => {
	const create = newEntryAction('/admin/exhibits', exhibits)

	it('creates an unpublished draft and opens its editor', async () => {
		const error = await thrown(() => create(post({ title: 'Anchor Positioning' })))
		expect(isRedirect(error) && error.location).toMatch(/^\/admin\/exhibits\/\d+\?created=1$/)
		expect((await exhibits.list())[0]).toMatchObject({ slug: 'anchor-positioning', published: false })
	})

	it('turns a taken slug into a field error', async () => {
		await insertExhibit({ slug: 'taken' })
		expect(outcome(await create(post({ title: 'Anything', slug: 'taken' })))).toMatchObject({
			status: 400,
			field: 'slug'
		})
	})

	it('explains when no slug can be derived', async () => {
		expect(outcome(await create(post({ title: '!!!' })))).toMatchObject({ status: 400, field: 'title' })
		expect(outcome(await create(post({ title: '' })))).toMatchObject({ status: 400, field: 'title' })
	})
})

describe('coverActions', () => {
	const covers = coverActions({
		locate: async (_event, form) => projects.get(Number(form.get('id'))),
		save: (id, cover) => projects.update(id, cover),
		scope: 'media'
	})

	it('stores an upload, points the row at it and removes the old image', async () => {
		const project = await insertProject()
		const coverAlt = 'A map of the states.'
		expect(await covers.uploadCover(post({ id: String(project.id), cover: pngFile(), coverAlt }))).toEqual({
			success: true,
			scope: 'media'
		})
		const first = (await projects.get(project.id))?.coverKey ?? ''
		await covers.uploadCover(post({ id: String(project.id), cover: pngFile(), coverAlt }))
		const second = (await projects.get(project.id))?.coverKey ?? ''
		expect(second).not.toBe(first)
		expect(await getImage(first)).toBeNull()
		expect(await getImage(second)).not.toBeNull()

		expect(await covers.removeCover(post({ id: String(project.id) }))).toEqual({ success: true, scope: 'media' })
		expect((await projects.get(project.id))?.coverKey).toBeNull()
		expect(await getImage(second)).toBeNull()
	})

	it('keeps alt text with the cover it describes and drops it with the cover', async () => {
		const project = await insertProject()
		const id = String(project.id)
		await covers.uploadCover(post({ id, cover: pngFile(), coverAlt: 'A map of the states.' }))
		expect((await projects.get(project.id))?.coverAlt).toBe('A map of the states.')

		expect(await covers.describeCover(post({ id, coverAlt: '  Oregon in red.  ' }))).toEqual({
			success: true,
			scope: 'media'
		})
		const described = await projects.get(project.id)
		expect(described?.coverAlt).toBe('Oregon in red.')
		expect(await getImage(described?.coverKey ?? '')).not.toBeNull()

		expect(outcome(await covers.describeCover(post({ id, coverAlt: 'x'.repeat(301) })))).toMatchObject({
			status: 400,
			scope: 'media'
		})
		expect((await projects.get(project.id))?.coverAlt).toBe('Oregon in red.')

		await covers.removeCover(post({ id }))
		expect((await projects.get(project.id))?.coverAlt).toBe('')
		expect(outcome(await covers.describeCover(post({ id, coverAlt: 'Nothing to describe.' })))).toMatchObject({
			status: 404
		})
	})

	it('reports a missing owner and a rejected file', async () => {
		const project = await insertProject()
		expect(outcome(await covers.uploadCover(post({ id: '9999', cover: pngFile() })))).toEqual({
			status: 404,
			message: 'Not found',
			scope: 'media'
		})
		expect(outcome(await covers.removeCover(post({ id: '9999' })))).toEqual({
			status: 404,
			message: 'Not found',
			scope: 'media'
		})
		expect(
			outcome(
				await covers.uploadCover(
					post({ id: String(project.id), cover: new File(['<svg/>'], 'x.png'), coverAlt: 'A drawing.' })
				)
			)
		).toMatchObject({
			status: 400,
			scope: 'media'
		})
	})

	it('refuses a cover without alt text, before storing anything', async () => {
		const project = await insertProject()
		const id = String(project.id)
		const missing = { status: 400, message: 'Cover alt text is required.', field: 'coverAlt', scope: 'media' }
		expect(outcome(await covers.uploadCover(post({ id, cover: pngFile(), coverAlt: '  ' })))).toEqual(missing)
		expect((await projects.get(project.id))?.coverKey).toBeNull()

		await covers.uploadCover(post({ id, cover: pngFile(), coverAlt: 'A map of the states.' }))
		expect(outcome(await covers.describeCover(post({ id, coverAlt: '' })))).toEqual(missing)
		expect((await projects.get(project.id))?.coverAlt).toBe('A map of the states.')
	})
})

describe('cascading deletes', () => {
	it('remove a project and its cover image', async () => {
		const project = await insertProject()
		await coverActions({
			locate: async () => projects.get(project.id),
			save: (id, cover) => projects.update(id, cover)
		}).uploadCover(post({ cover: pngFile(), coverAlt: 'A map of the states.' }))
		const key = (await projects.get(project.id))?.coverKey ?? ''
		await destroyProject(project.id)
		expect(await projects.get(project.id)).toBeNull()
		expect(await getImage(key)).toBeNull()
	})

	it('remove a case study with its cover and every figure', async () => {
		const study = await insertCase({
			coverKey: 'cover.png',
			figures: [{ key: 'figure.png', title: 'F', description: '', alt: '' }]
		})
		await destroyCaseStudy(study.id)
		await expect(destroyCaseStudy(study.id)).resolves.toBeUndefined()
	})
})
