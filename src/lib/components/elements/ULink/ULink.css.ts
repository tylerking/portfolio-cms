import { styleVariants } from '@vanilla-extract/css'
import { theme } from '$lib/styles/theme.css'

export const tone = styleVariants({
	muted: { color: theme.muted },
	ink: { color: theme.foreground },
	accent: { color: theme.accentText }
})
