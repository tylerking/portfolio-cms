import { type ActionFailure, error, fail } from '@sveltejs/kit'
import type { z } from 'zod'
import { idSchema } from '$lib/schemas'
import { isUniqueViolation } from '../db/errors'

type Parsed<Schema extends z.ZodTypeAny> =
	| { ok: true; data: z.infer<Schema> }
	| { ok: false; message: string; field?: string }

function toObject(form: FormData): Record<string, unknown> {
	const out: Record<string, unknown> = {}
	for (const [key, value] of form) if (typeof value === 'string') out[key] = value
	return out
}

export function firstIssue(error: z.ZodError): { message: string; path: PropertyKey[] } {
	return error.issues[0] ?? { message: 'Invalid input', path: [] }
}

function fieldLabel(path: PropertyKey[]): string {
	const words = path.map((segment) =>
		typeof segment === 'number'
			? String(segment + 1)
			: String(segment).replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)
	)
	const label = words.join(' ').trim()
	return label.charAt(0).toUpperCase() + label.slice(1)
}

export function parseForm<Schema extends z.ZodTypeAny>(form: FormData, schema: Schema): Parsed<Schema> {
	const result = schema.safeParse(toObject(form))
	if (result.success) return { ok: true, data: result.data }
	const issue = firstIssue(result.error)
	if (issue.path.length === 0) return { ok: false, message: issue.message }
	const label = fieldLabel(issue.path)
	// Our own messages start lowercase ("is required"); nothing else tells them apart from Zod's.
	const ours = /^[a-z]/.test(issue.message)
	const field = String(issue.path[0])
	return { ok: false, field, message: ours ? `${label} ${issue.message}.` : `${label}: ${issue.message}` }
}

export function parseId(form: FormData): { ok: true; value: number } | { ok: false; message: string } {
	const parsed = idSchema.safeParse(form.get('id'))
	return parsed.success ? { ok: true, value: parsed.data } : { ok: false, message: 'Missing id' }
}

export function routeId(raw: string | undefined): number {
	const parsed = idSchema.safeParse(raw)
	if (!parsed.success) throw error(404, 'Not found')
	return parsed.data
}

export async function uniqueSlug<Result>(
	save: () => Promise<Result>
): Promise<Result | ActionFailure<{ message: string; field: string }>> {
	try {
		return await save()
	} catch (caught) {
		if (isUniqueViolation(caught))
			return fail(400, { message: 'That slug is already used by another entry.', field: 'slug' })
		throw caught
	}
}
