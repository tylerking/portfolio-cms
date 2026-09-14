<script
	lang='ts'>
	import Text from '$lib/components/elements/Text'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { theme } from '$lib/styles/theme.css'
	import * as chartStyles from '$lib/styles/visualization.css'
	import { visualization } from '$lib/styles/visualization-theme.css'

	interface Props {
		label: string
		value: string
		note?: string
		trend?: number[]
		trendLabel?: string
		href?: string
	}

	let { label, value, note, trend, trendLabel = 'Trend', href }: Props = $props()

	const WIDTH = 240
	const HEIGHT = 32
	const coordinates = $derived.by(() => {
		if (!trend || trend.length < 2) return []
		const max = Math.max(1, ...trend)
		return trend.map(
			(value, index) =>
				[(index / (trend.length - 1)) * (WIDTH - 8) + 4, HEIGHT - 4 - (value / max) * (HEIGHT - 8)] as const
		)
	})
	const points = $derived(coordinates.map(([left, top]) => `${left.toFixed(1)},${top.toFixed(1)}`).join(' '))
	const last = $derived(coordinates.at(-1))
</script>

<svelte:element
	class={[chartStyles.tile, href && chartStyles.tileLink]}
	{href}
	this={href ? 'a' : 'div'}>
	<Text
		class={chartStyles.tileLabel}
		tone='muted'
		variant='label'>{label}</Text>
	<Text
		class={chartStyles.tileValue}
		variant='numeral'>{value}</Text>
	{#if note}
		<Text
			class={chartStyles.tileDelta}
			variant='chip'>{note}</Text>
	{/if}
	{#if trend && trend.length > 1}
		<span
			class={screenReaderOnly}>{trendLabel}: {trend[0]} to {trend.at(-1)}.</span>
		<svg
			aria-hidden='true'
			class={[chartStyles.svg, chartStyles.tileTrend]}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
			<polyline
				fill='none'
				{points}
				stroke={theme.faint}
				stroke-linecap='round'
				stroke-linejoin='round'
				stroke-width='2' />
			{#if last}
				<circle
					cx={last[0]}
					cy={last[1]}
					fill={visualization.surface}
					r='5' />
				<circle
					cx={last[0]}
					cy={last[1]}
					fill={theme.accent}
					r='4' />
			{/if}
		</svg>
	{/if}
</svelte:element>
