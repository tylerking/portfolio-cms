import { getTableConfig } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'
import { sessions, users } from './schema'

describe('sessions', () => {
	it('belong to a user and are deleted with them', () => {
		const [foreignKey] = getTableConfig(sessions).foreignKeys
		expect(foreignKey?.reference().foreignTable).toBe(users)
		expect(foreignKey?.onDelete).toBe('cascade')
	})
})
