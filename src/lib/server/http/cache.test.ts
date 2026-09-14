import { beforeEach, describe, expect, it, vi } from 'vitest'

const environment = vi.hoisted(() => ({ dev: false }))
const purgeCache = vi.hoisted(() => vi.fn())
vi.mock('$app/environment', () => environment)
vi.mock('@netlify/functions', () => ({ purgeCache }))

const { purgeTags } = await import('./cache')

beforeEach(() => {
	purgeCache.mockReset()
	environment.dev = false
})

describe('purgeTags', () => {
	it('purges the given tags', async () => {
		await purgeTags(['content'])
		expect(purgeCache).toHaveBeenCalledWith({ tags: ['content'] })
	})

	it('does nothing in development', async () => {
		environment.dev = true
		await purgeTags(['content'])
		expect(purgeCache).not.toHaveBeenCalled()
	})

	it('logs rather than fails when the purge is rejected', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {})
		purgeCache.mockRejectedValueOnce(new Error('no token'))
		await expect(purgeTags(['media'])).resolves.toBeUndefined()
		expect(log).toHaveBeenCalledWith('Could not purge cache tags: media', expect.any(Error))
		log.mockRestore()
	})
})
