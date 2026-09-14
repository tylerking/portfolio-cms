import { tick } from 'svelte'

export const live = $state({ message: '' })

// Cleared first so the same sentence twice in a row is still announced.
export async function announce(message: string): Promise<void> {
	live.message = ''
	await tick()
	live.message = message
}
