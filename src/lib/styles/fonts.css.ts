import { globalFontFace } from '@vanilla-extract/css'

const RECURSIVE = '/fonts/recursive-latin-ee841c65.woff2'

globalFontFace('Recursive', {
	src: `url('${RECURSIVE}') format('woff2') tech(variations), url('${RECURSIVE}') format('woff2-variations')`,
	fontDisplay: 'optional'
})

globalFontFace('Recursive Fallback Mono', {
	// Chromium matches local() by full font name, and Menlo's is "Menlo Regular".
	src: "local('Menlo Regular'), local('Menlo'), local('Consolas'), local('DejaVu Sans Mono')",
	sizeAdjust: '104%',
	ascentOverride: '95%',
	descentOverride: '26%',
	lineGapOverride: '0%'
})

globalFontFace('Recursive Fallback Sans', {
	src: "local('Arial'), local('Helvetica Neue'), local('Liberation Sans')",
	sizeAdjust: '106%',
	ascentOverride: '95%',
	descentOverride: '26%',
	lineGapOverride: '0%'
})
