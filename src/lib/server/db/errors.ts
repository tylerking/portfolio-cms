function postgresCode(error: unknown): unknown {
	if (typeof error !== 'object' || error === null) return undefined
	if ('code' in error) return error.code
	return 'cause' in error ? postgresCode(error.cause) : undefined
}

export const isUniqueViolation = (error: unknown) => postgresCode(error) === '23505'
