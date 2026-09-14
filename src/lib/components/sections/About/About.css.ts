import { globalStyle, style } from '@vanilla-extract/css'
import { measure } from '$lib/styles/patterns.css'
import { splitGrid } from '$lib/styles/rules'
import { space } from '$lib/styles/tokens'

export const columns = style(splitGrid('1fr 1fr', space[12]))

export const stack = style({ display: 'flex', flexDirection: 'column', gap: space[4.5] })

export const paragraph = style({ maxWidth: measure })

const trailingOrphan = ':last-child:nth-child(3n + 1)'

export const skills = style({ marginTop: space[12] })
globalStyle(`${skills} > ${trailingOrphan}`, { gridColumn: '1 / -1' })

export const cell = style({ padding: `${space[4.5]} ${space[5]}` })

export const skillLabel = style({ marginBottom: space[2] })

export const skillItems = style({ maxWidth: measure })
