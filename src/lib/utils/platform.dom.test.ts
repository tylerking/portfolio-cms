import { afterEach, describe, expect, it } from 'vitest'
import { isApplePlatform } from './platform'

const original = navigator.userAgent
const agent = (value: string) => Object.defineProperty(navigator, 'userAgent', { value, configurable: true })

afterEach(() => {
	agent(original)
})

describe('isApplePlatform', () => {
	it.each([
		['Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)', true],
		['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', true],
		['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', false]
	])('%s is Apple: %s', (userAgent, expected) => {
		agent(userAgent)
		expect(isApplePlatform()).toBe(expected)
	})
})
