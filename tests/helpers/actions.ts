import { isActionFailure, type RequestEvent } from '@sveltejs/kit'

type Handler = (event: RequestEvent<never, never>) => unknown

export function action(actions: Record<string, Handler>, name: string): Handler {
	const run = actions[name]
	if (!run) throw new Error(`No action named "${name}"`)
	return run
}

export const outcome = (result: unknown) =>
	isActionFailure(result) ? Object.assign({ status: result.status }, result.data) : result
