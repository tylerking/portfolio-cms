import { createContext } from 'svelte'
import type { Labels } from '$lib/types'

// A getter rather than the object: settings can be reloaded under a mounted shell.
export const [getLabels, setLabels] = createContext<() => Labels>()
