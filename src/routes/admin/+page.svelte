<script
	lang='ts'>
	import { ADMIN_NAVIGATION, AdminPage, ChartCard, foldSeries, HorizontalBars, OTHER, StackedColumns, StatTile } from '$lib/components/admin'
	import Text from '$lib/components/elements/Text'
	import * as styles from '$lib/styles/admin.css'
	import { screenReaderOnly } from '$lib/styles/recipes.css'
	import { bareFieldset } from '$lib/styles/reset.css'
	import * as chartStyles from '$lib/styles/visualization.css'
	import { formatCompact, formatPercent, formatShortDate } from '$lib/utils/format'
	import type { PageData } from './$types'

	interface ViewRow {
		key: string
		label: string
		value: number
	}

	let { data }: { data: PageData } = $props()

	const analytics = $derived(data.analytics)
	const isMock = $derived(analytics.source === 'mock')
	const leads = $derived(foldSeries(analytics.reasons, analytics.leadsByWeek))
	const resumeTrend = $derived(analytics.intent.slice(-12).map((day) => day.resume))
	const outboundTotal = $derived(analytics.intent.reduce((total, day) => total + day.outbound, 0))
	const topContent = $derived<ViewRow[]>(analytics.topContent.map((content) => ({ key: content.path, label: content.title, value: content.views })))
	const sources = $derived<ViewRow[]>(analytics.sources.map((source) => ({ key: source.host, label: source.host, value: source.views })))
	const editable = ADMIN_NAVIGATION.filter((group) => group.title)
</script>

{#snippet viewsTable(caption: string, column: string, rows: ViewRow[])}
	<div
		class={chartStyles.tableScroll}>
		<table
			class={chartStyles.table}>
			<caption
				class={screenReaderOnly}>{caption}</caption>
			<thead>
				<tr><th
					class={chartStyles.tableHeader}
					scope='col'><Text
						tone='inherit'
						variant='label'>{column}</Text></th><th
						class={chartStyles.tableHeaderNumeric}
						scope='col'><Text
							tone='inherit'
							variant='label'>Views</Text></th></tr>
			</thead>
			<tbody>
				{#each rows as row (row.key)}
					<tr><th
						class={chartStyles.rowHeader}
						scope='row'><Text
							tone='inherit'>{row.label}</Text></th><Text
							as='td'
							class={chartStyles.tableCellNumeric}
							variant='numeral'>{row.value}</Text></tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

<AdminPage
	title='Dashboard'>
	<form
		action='?/setSource'
		class={styles.filterRow}
		method='POST'>
		<fieldset
			aria-label='Data source'
			class={[bareFieldset, styles.segmented]}>
			<button
				aria-pressed={!isMock}
				class={styles.segment}
				name='source'
				type='submit'
				value='real'><Text
					tone='inherit'
					variant='button'>Real</Text></button>
			<button
				aria-pressed={isMock}
				class={styles.segment}
				name='source'
				type='submit'
				value='mock'><Text
					tone='inherit'
					variant='button'>Mock</Text></button>
		</fieldset>
		<Text
			tone='muted'
			variant='machine'>{isMock ? 'Sample data, until real events accumulate.' : 'First-party events from this site.'}</Text>
	</form>

	<div
		class={styles.statisticsRow}>
		<StatTile
			href='/admin/leads'
			label='Unanswered leads'
			note={isMock ? 'new · sample data' : 'new'}
			value={String(analytics.stats.unanswered)} />
		<StatTile
			label='Leads this month'
			note='contact form'
			value={String(analytics.stats.leadsThisMonth)} />
		<StatTile
			label='Resume downloads'
			note='last 30 days'
			trend={resumeTrend}
			trendLabel='Downloads per day over the last 12 days'
			value={formatCompact(analytics.stats.resumeDownloadsLast30Days)} />
		<StatTile
			label='Contact rate'
			note={`${formatCompact(analytics.stats.pageviewsLast30Days)} pageviews · ${formatCompact(outboundTotal)} outbound clicks`}
			value={formatPercent(analytics.stats.contactRateLast30Days)} />
	</div>

	<ChartCard
		heading='Leads by week'
		subtitle='Last 12 weeks, stacked by reason'>
		{#snippet chart()}
			<StackedColumns
				data={leads.data}
				empty='No leads recorded in the last 12 weeks.'
				label='Leads per week, stacked by reason'
				other={OTHER}
				series={leads.series} />
		{/snippet}
		{#snippet table()}
			<div
				class={chartStyles.tableScroll}>
				<table
					class={chartStyles.table}>
					<caption
						class={screenReaderOnly}>Leads by week, by reason</caption>
					<thead>
						<tr>
							<th
								class={chartStyles.tableHeader}
								scope='col'><Text
									tone='inherit'
									variant='label'>Week of</Text></th>
							{#each leads.series as key (key)}
								<th
									class={chartStyles.tableHeaderNumeric}
									scope='col'><Text
										tone='inherit'
										variant='label'>{key}</Text></th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each leads.data as week (week.week)}
							<tr>
								<th
									class={chartStyles.rowHeader}
									scope='row'><Text
										tone='inherit'
											variant='machine'>{formatShortDate(week.week)}</Text></th>
								{#each leads.series as key (key)}
									<Text
										as='td'
										class={chartStyles.tableCellNumeric}
										variant='numeral'>{week.counts[key] ?? 0}</Text>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/snippet}
	</ChartCard>

	<div
		class={styles.chartsRow}>
		<ChartCard
			heading='Top content'
			subtitle='Views, last 30 days'>
			{#snippet chart()}
				<HorizontalBars
					empty='No pageviews recorded yet.'
					items={topContent} />
			{/snippet}
			{#snippet table()}
				{@render viewsTable('Top content by views', 'Page', topContent)}
			{/snippet}
		</ChartCard>

		<ChartCard
			heading='Sources'
			subtitle='Referrers, last 30 days'>
			{#snippet chart()}
				<HorizontalBars
					empty='No referrers recorded yet.'
					items={sources} />
			{/snippet}
			{#snippet table()}
				{@render viewsTable('Referring sources by views', 'Source', sources)}
			{/snippet}
		</ChartCard>
	</div>

	<div
		class={styles.dashboardLists}>
		{#each editable as group (group.title)}
			<Text
				as='h2'
				class={styles.sectionHeading}
				variant='title'>{group.title}</Text>
			<div
				class={styles.list}>
				{#each group.links as link (link.href)}
					<a
						class={styles.listRow}
						href={link.href}>
						<span>{link.label}</span>
						<Text
							tone='muted'
							variant='machine'>{link.count ? `${data.counts[link.count]} entries` : 'edit'} <span
								aria-hidden='true'>→</span></Text>
					</a>
				{/each}
			</div>
		{/each}
	</div>
</AdminPage>
