import { fail, isActionFailure, type RequestEvent, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { altSchema, newEntrySchema, reorderSchema } from '$lib/schemas'
import { slugify } from '$lib/utils/format'
import { deleteImages, storeUpload } from '../media/blobs'
import { parseForm, parseId, uniqueSlug } from './forms'

type Store<Data> = {
	create: (data: Data & { sort: number }) => Promise<unknown>
	update: (id: number, data: Data) => Promise<unknown>
	remove: (id: number) => Promise<unknown>
	reorder: (ids: number[]) => Promise<boolean>
	nextSort: () => Promise<number>
}

type NewEntryStore = {
	create: (entry: { slug: string; title: string; published: boolean; sort: number }) => Promise<number>
	nextSort: () => Promise<number>
}

type Cover = { coverKey: string | null; coverAlt: string }
type CoverOwner = Cover & { id: number }

const coverAltSchema = z.object({ coverAlt: altSchema })

export function deleteAction(remove: (id: number) => Promise<unknown>) {
	return async ({ request }: RequestEvent) => {
		const id = parseId(await request.formData())
		if (!id.ok) return fail(400, { message: id.message })
		await remove(id.value)
		return { success: true }
	}
}

export function reorderAction(reorder: (ids: number[]) => Promise<boolean>) {
	return async ({ request }: RequestEvent) => {
		const ids = reorderSchema.safeParse((await request.formData()).get('order'))
		if (!ids.success || !(await reorder(ids.data))) return fail(400, { message: 'Invalid order' })
		return { success: true, reordered: true }
	}
}

export function collectionActions<Schema extends z.ZodType<Record<string, unknown>>>(
	schema: Schema,
	store: Store<z.infer<Schema>>,
	{ slugFromTitle = false } = {}
) {
	const read = async (request: Request) => {
		const form = await request.formData()
		if (slugFromTitle && !String(form.get('slug') ?? '').trim())
			form.set('slug', slugify(String(form.get('title') ?? '')))
		return form
	}
	const saved = async (save: () => Promise<unknown>) => {
		const result = await uniqueSlug(save)
		return isActionFailure(result) ? result : { success: true }
	}
	return {
		create: async ({ request }: RequestEvent) => {
			const parsed = parseForm(await read(request), schema)
			if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })
			const sort = await store.nextSort()
			return saved(() => store.create({ ...parsed.data, sort }))
		},
		update: async ({ request }: RequestEvent) => {
			const form = await read(request)
			const id = parseId(form)
			if (!id.ok) return fail(400, { message: id.message })
			const parsed = parseForm(form, schema)
			if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })
			return saved(() => store.update(id.value, parsed.data))
		},
		reorder: reorderAction(store.reorder),
		delete: deleteAction(store.remove)
	}
}

export function newEntryAction(basePath: string, store: NewEntryStore) {
	return async ({ request }: RequestEvent) => {
		const parsed = parseForm(await request.formData(), newEntrySchema)
		if (!parsed.ok) return fail(400, { message: parsed.message, field: parsed.field })
		const slug = parsed.data.slug || slugify(parsed.data.title)
		if (!slug) return fail(400, { message: 'Could not derive a slug from that title.', field: 'title' })
		const sort = await store.nextSort()
		const id = await uniqueSlug(() => store.create({ slug, title: parsed.data.title, published: false, sort }))
		if (isActionFailure(id)) return id
		throw redirect(303, `${basePath}/${id}?created=1`)
	}
}

export function coverActions(options: {
	locate: (event: RequestEvent, form: FormData) => Promise<CoverOwner | null>
	save: (id: number, cover: Cover) => Promise<unknown>
	scope?: string
}) {
	const failure = (status: number, message: string, field?: string) =>
		fail(status, { message, ...(field && { field }), scope: options.scope })
	return {
		uploadCover: async (event: RequestEvent) => {
			const form = await event.request.formData()
			const owner = await options.locate(event, form)
			if (!owner) return failure(404, 'Not found')
			const alt = parseForm(form, coverAltSchema)
			if (!alt.ok) return failure(400, alt.message, alt.field)
			const stored = await storeUpload(form.get('cover'))
			if ('error' in stored) return failure(400, stored.error)
			await options.save(owner.id, { coverKey: stored.key, coverAlt: alt.data.coverAlt })
			await deleteImages([owner.coverKey])
			return { success: true, scope: options.scope }
		},
		describeCover: async (event: RequestEvent) => {
			const form = await event.request.formData()
			const owner = await options.locate(event, form)
			if (!owner?.coverKey) return failure(404, 'Not found')
			const alt = parseForm(form, coverAltSchema)
			if (!alt.ok) return failure(400, alt.message, alt.field)
			await options.save(owner.id, { coverKey: owner.coverKey, coverAlt: alt.data.coverAlt })
			return { success: true, scope: options.scope }
		},
		removeCover: async (event: RequestEvent) => {
			const owner = await options.locate(event, await event.request.formData())
			if (!owner) return failure(404, 'Not found')
			await options.save(owner.id, { coverKey: null, coverAlt: '' })
			await deleteImages([owner.coverKey])
			return { success: true, scope: options.scope }
		}
	}
}
