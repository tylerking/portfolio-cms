export const slate = {
	950: '#08090d',
	900: '#0c0e14',
	880: '#10131b',
	850: '#15171d',
	820: '#1a1e29',
	800: '#242a38',
	700: '#3a3f4b',
	600: '#5c6273',
	550: '#666c7b',
	500: '#797f90',
	450: '#878c99',
	350: '#b9becb',
	150: '#e8eaf0'
} as const

export const sand = {
	100: '#f6f6f3',
	200: '#f0f0ec',
	300: '#e4e4df',
	400: '#d5d6d0'
} as const

export const white = '#ffffff'

export const mint = { 400: '#3ddc97', 700: '#077d50' } as const
export const coral = { 400: '#ff6b4a', 700: '#c23718' } as const

export const teal = { 500: '#00a6b9', 600: '#008094', 650: '#007488' } as const

// Fixed order (mint, violet, coral, blue), CVD-validated per mode. Do not reorder.
export const chart = {
	dark: { series1: '#1aa86e', series2: '#7c5cff', series3: '#ef5535', series4: '#4a8cf2' },
	light: { series1: '#118f5a', series2: '#7c5cff', series3: '#d94826', series4: '#2f6fe0' }
} as const

export const font = {
	sansSerif: "'Recursive', 'Recursive Fallback Sans', ui-sans-serif, system-ui, sans-serif",
	monospace: "'Recursive', 'Recursive Fallback Mono', ui-monospace, monospace"
} as const

export const space = {
	0.5: '2px',
	1: '4px',
	1.5: '6px',
	2: '8px',
	2.5: '10px',
	3: '12px',
	3.5: '14px',
	4: '16px',
	4.5: '18px',
	5: '20px',
	6: '24px',
	7: '28px',
	8: '32px',
	9: '36px',
	10: '40px',
	12: '48px',
	14: '56px',
	16: '64px',
	18: '72px',
	20: '80px',
	24: '96px',
	30: '120px',
	35: '140px'
} as const

export const radius = {
	extraSmall: '2px',
	small: '3px',
	medium: '4px',
	round: '50%'
} as const

export const motion = {
	ease: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
	easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
	fast: '0.12s',
	quick: '0.15s',
	base: '0.18s',
	slow: '0.2s',
	slower: '0.25s',
	reveal: '0.6s',
	crawl: '2s'
} as const

export const layout = {
	maxWidth: '1200px',
	readWidth: '820px',
	articleWidth: '700px',
	leadWidth: '640px',
	summaryWidth: '560px',
	headerHeight: '3.75rem',
	gutterColumn: '150px',
	adminSidebar: '220px',
	adminWidth: '860px',
	loginWidth: '380px',
	thumbnailColumn: '160px'
} as const

// em, so a larger browser font-size collapses the layout earlier instead of overflowing.
export const breakpoint = {
	large: '67.5em',
	medium: '56.25em',
	admin: '45em',
	small: '35em',
	extraSmall: '22.5em'
} as const

export const zIndex = {
	progress: 200,
	skip: 100,
	header: 50,
	mobileNavigation: 49
} as const

export const touch = {
	fine: '24px',
	control: '36px',
	min: '44px'
} as const
