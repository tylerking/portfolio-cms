<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { radius } from '$lib/styles/tokens'
	import * as chartStyles from '$lib/styles/visualization.css'
	import { series as seriesColors, visualization } from '$lib/styles/visualization-theme.css'
	import { formatShortDate } from '$lib/utils/format'

	interface Props {
		data: { week: string; counts: Record<string, number> }[]
		series: string[]
		label: string
		other?: string
		empty?: string
	}

	let { data, series, label, other, empty = 'No data yet.' }: Props = $props()

	const WIDTH = 720
	const HEIGHT = 240
	const NARROW_GROWTH = 0.7
	const GAP = 2
	const BAR_RADIUS = Number.parseFloat(radius.medium)
	const TOOLTIP_GAP = 12
	const TOOLTIP_TOP = 8

	const descriptionId = $props.id()

	const named = $derived(series.filter((seriesKey) => seriesKey !== other))
	const keys = $derived(other && series.includes(other) ? [...named, other] : named)
	const colorFor = (seriesKey: string) => seriesColors[named.indexOf(seriesKey)] ?? visualization.other
	const totals = $derived(
		data.map((datum) => keys.reduce((sum, seriesKey) => sum + (datum.counts[seriesKey] ?? 0), 0))
	)
	const tickStep = $derived.by(() => {
		const largest = Math.max(1, ...totals)
		return [1, 2, 5, 10, 20, 50, 100].find((step) => largest / step <= 5) ?? 100
	})
	const niceMax = $derived(Math.max(tickStep, Math.ceil(Math.max(1, ...totals) / tickStep) * tickStep))
	const ticks = $derived(Array.from({ length: niceMax / tickStep + 1 }, (_, index) => index * tickStep))

	let hostWidth = $state(0)
	let tooltipWidth = $state(0)
	let rootFontSize = $state(16)
	const axisScale = $derived(WIDTH / (hostWidth || WIDTH))
	const labelScale = $derived(Math.max(1, axisScale))
	const axisFontSize = $derived(chartStyles.axisFontRem * rootFontSize * axisScale)
	const dateEvery = $derived(axisFontSize > 20 ? 4 : axisFontSize > 14 ? 3 : 2)
	const height = $derived(Math.round(HEIGHT * Math.max(1, axisScale * NARROW_GROWTH)))
	const padding = $derived({ top: 6 + 12 * labelScale, right: 8, bottom: 16 + 12 * labelScale, left: 18 + 12 * labelScale })

	const plotWidth = $derived(WIDTH - padding.left - padding.right)
	const plotHeight = $derived(height - padding.top - padding.bottom)
	const slot = $derived(plotWidth / Math.max(1, data.length))
	const barWidth = $derived(Math.min(24, slot * 0.55))
	const yFor = (value: number) => padding.top + plotHeight - (value / niceMax) * plotHeight
	const peak = $derived(Math.max(0, ...totals))
	const maxIndex = $derived(totals.indexOf(peak))
	const isEmpty = $derived(totals.every((weekTotal) => weekTotal === 0))
	const summary = $derived(
		isEmpty
			? ''
			: `Peak of ${peak} in the week of ${formatShortDate(data[maxIndex]?.week ?? '')}; ${totals.reduce((sum, weekTotal) => sum + weekTotal, 0)} in total across ${data.length} weeks.`
	)

	function topRounded(left: number, top: number, width: number, height: number, maximumRadius: number) {
		const cornerRadius = Math.min(maximumRadius, height, width / 2)
		return `M${left},${top + height} V${top + cornerRadius} Q${left},${top} ${left + cornerRadius},${top} H${left + width - cornerRadius} Q${left + width},${top} ${left + width},${top + cornerRadius} V${top + height} Z`
	}

	let hover = $state<number | null>(null)
	const hovered = $derived(hover === null ? undefined : data[hover])
	const tooltipLeft = $derived(
		hover === null
			? 0
			: Math.max(
					0,
					Math.min(((padding.left + slot * (hover + 0.5)) * hostWidth) / WIDTH + TOOLTIP_GAP, hostWidth - tooltipWidth)
				)
	)

	function trackHover(svg: SVGSVGElement) {
		rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || rootFontSize
		const onMove = (event: PointerEvent) => {
			const bounds = svg.getBoundingClientRect()
			const index = Math.floor(((event.clientX - bounds.left) * (WIDTH / bounds.width) - padding.left) / slot)
			const next = index >= 0 && index < data.length ? index : null
			if (next !== hover) hover = next
		}
		const onDown = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') onMove(event)
		}
		const onLeave = (event: PointerEvent) => {
			if (event.pointerType === 'mouse') hover = null
		}
		const onOutside = (event: PointerEvent) => {
			if (!(event.target instanceof Node && svg.contains(event.target))) hover = null
		}
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') hover = null
		}
		svg.addEventListener('pointermove', onMove)
		svg.addEventListener('pointerdown', onDown)
		svg.addEventListener('pointerleave', onLeave)
		window.addEventListener('pointerdown', onOutside)
		window.addEventListener('keydown', onKeydown)
		return () => {
			svg.removeEventListener('pointermove', onMove)
			svg.removeEventListener('pointerdown', onDown)
			svg.removeEventListener('pointerleave', onLeave)
			window.removeEventListener('pointerdown', onOutside)
			window.removeEventListener('keydown', onKeydown)
		}
	}
</script>

{#if isEmpty}
	<Text
		class={chartStyles.tileDelta}
		variant='chip'>{empty}</Text>
{:else}
<div
	bind:clientWidth={hostWidth}
	class={chartStyles.chartBody}>
	<svg
		{@attach trackHover}
		aria-describedby={descriptionId}
		aria-label={label}
		class={chartStyles.svg}
		role='img'
		style={`${chartStyles.axisScaleProperty}: ${axisScale}`}
		viewBox={`0 0 ${WIDTH} ${height}`}>
		<desc
			id={descriptionId}>{summary}</desc>
		{#each ticks as tick (tick)}
			<line
				class={chartStyles.gridLine}
				x1={padding.left}
				x2={WIDTH - padding.right}
				y1={yFor(tick)}
				y2={yFor(tick)} />
			<text
				class={chartStyles.axisText}
				text-anchor='end'
				x={padding.left - 6}
				y={yFor(tick) + 4}>{tick}</text>
		{/each}
		{#each data as datum, index (datum.week)}
			{@const left = padding.left + slot * index + (slot - barWidth) / 2}
			{@const total = totals[index] ?? 0}
			{@const stack = keys.filter((seriesKey) => (datum.counts[seriesKey] ?? 0) > 0)}
			{#each stack as seriesKey, segmentIndex (seriesKey)}
				{@const below = stack.slice(0, segmentIndex).reduce((sum, belowKey) => sum + (datum.counts[belowKey] ?? 0), 0)}
				{@const value = datum.counts[seriesKey] ?? 0}
				{@const top = yFor(below + value)}
				{@const height = Math.max(0, yFor(below) - top - (segmentIndex > 0 ? GAP : 0))}
				{@const isTop = segmentIndex === stack.length - 1}
				{#if isTop}
					<path
						class={chartStyles.segment}
						d={topRounded(left, top, barWidth, height, BAR_RADIUS)}
						data-dim={hover !== null && hover !== index}
						fill={colorFor(seriesKey)} />
				{:else}
					<rect
						class={chartStyles.segment}
						data-dim={hover !== null && hover !== index}
						fill={colorFor(seriesKey)}
						{height}
						width={barWidth}
						x={left}
						y={top} />
				{/if}
			{/each}
			{#if index === maxIndex && total > 0}
				<text
					class={chartStyles.axisText}
					text-anchor='middle'
					x={left + barWidth / 2}
					y={yFor(total) - 6}>{total}</text>
			{/if}
			{#if index % dateEvery === 0}
				<text
					class={chartStyles.axisText}
					text-anchor='middle'
					x={padding.left + slot * index + slot / 2}
					y={height - 8}>{formatShortDate(datum.week)}</text>
			{/if}
		{/each}
	</svg>

	{#if hovered}
		<div
			aria-hidden='true'
			bind:clientWidth={tooltipWidth}
			class={chartStyles.tooltip}
			style:left={`${tooltipLeft}px`}
			style:top={`${TOOLTIP_TOP}px`}>
			<Text
				class={chartStyles.tooltipTitle}
				variant='machine'>Week of {formatShortDate(hovered.week)}</Text>
			{#each keys as seriesKey (seriesKey)}
				<div
					class={chartStyles.tooltipRow}>
					<span
						class={chartStyles.tooltipKey}
						style:background={colorFor(seriesKey)}></span>
					<Text
						class={chartStyles.tooltipLabel}
						tone='muted'
						variant='machine'>{seriesKey}</Text>
					<Text
						class={chartStyles.tooltipValue}
						variant='machine'>{hovered.counts[seriesKey] ?? 0}</Text>
				</div>
			{/each}
		</div>
	{/if}

	<div
		class={chartStyles.legend}>
		{#each keys as seriesKey (seriesKey)}
			<Text
				class={chartStyles.legendItem}
				tone='inherit'
				variant='machine'><span
					class={chartStyles.swatch}
					style:background={colorFor(seriesKey)}></span>{seriesKey}</Text>
		{/each}
	</div>
</div>
{/if}
