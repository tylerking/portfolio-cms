import { z } from 'zod'
import { env as raw } from '$env/dynamic/private'

const databaseUrl = z.string().min(1)
const appSecret = z.string().min(32)
const firstAdmin = z.object({
	email: z.string().trim().toLowerCase().pipe(z.email()),
	password: z.string().min(12)
})

// Read lazily: validating at import would take the public site down whenever an admin-only secret is missing.
export const env = {
	databaseUrl: () => databaseUrl.safeParse(raw.DATABASE_URL),
	appSecret: () => appSecret.safeParse(raw.APP_SECRET),
	firstAdmin: () =>
		raw.ADMIN_EMAIL || raw.ADMIN_PASSWORD
			? firstAdmin.safeParse({ email: raw.ADMIN_EMAIL, password: raw.ADMIN_PASSWORD })
			: null
}
