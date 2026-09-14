import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { labelsSchema } from '../src/lib/schemas'
import * as tables from '../src/lib/server/db/schema'

const url = process.env.DATABASE_URL
if (!url) throw new Error('Set DATABASE_URL to seed')

const host = new URL(url).hostname
if (!['localhost', '127.0.0.1', '[::1]'].includes(host) && !process.argv.includes('--force-production')) {
	throw new Error(`Refusing to overwrite content on ${host}. Pass --force-production to seed a remote database.`)
}

const pool = new pg.Pool({ connectionString: url })
const base = drizzle(pool, { schema: tables })
type Transaction = Parameters<Parameters<typeof base.transaction>[0]>[0]

const meta = (label: string, value: string) => ({ label, value })
const section = (tag: string, heading: string, ...paragraphs: string[]) => ({ tag, heading, paragraphs })

// Netlify Blobs need credentials, so on deploy images are uploaded from admin instead.
const onNetlify = !!(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT)
function seedCover(file: string): string | null {
	return onNetlify ? null : `seed-${file}`
}

const figures = (...list: [file: string, title: string, description: string, alt: string][]) =>
	list.map(([file, title, description, alt]) => ({ id: randomUUID(), key: seedCover(file), title, description, alt }))

async function main(db: Transaction) {
	await db.delete(tables.exhibits)
	await db.delete(tables.caseStudies)
	await db.delete(tables.projects)
	await db.delete(tables.approachSteps)
	await db.delete(tables.skillGroups)
	await db.delete(tables.homeContent)
	await db.delete(tables.siteSettings)

	await db.insert(tables.siteSettings).values({
		name: 'Tyler King',
		jobTitle: 'Product Engineer',
		seoDescription:
			'Product engineer building modern web applications end to end: architecture, interface, and the documentation that keeps them maintainable. Professional since 2010, across bio-science, health, energy, and fintech.',
		footerText: '© 2026 Tyler King · Built in Portland',
		showAvailability: true,
		contactEmail: 'tk@tylerking.io',
		contactPhone: '',
		contactLocation: 'Portland, OR',
		contactReasons: ['New Project', 'Consultation', 'Collaboration', 'General'],
		resumeUrl: '/assets/tyler-king-resume.pdf',
		socials: [
			{ label: 'GitHub', href: 'https://github.com/tylerking' },
			{ label: 'LinkedIn', href: 'https://linkedin.com/in/doitliketyler' }
		],
		labels: labelsSchema.parse({})
	})

	await db.insert(tables.homeContent).values({
		heroLead:
			'I build modern web applications end to end, handling the architecture, the interface, and the documentation that keeps them maintainable. I’ve been doing this since 2010, in bio-science, health, energy, and fintech.',
		aboutLead:
			'I’m self-taught, started coding early in the web’s evolution, and have stayed close to the tools and patterns shaping how people build for the browser today. Agencies came first, then startups and product teams, with work across advertising, bio-science, risk analytics, clean energy, and fintech.',
		aboutParagraphs: [
			'Over the years, I’ve designed and built everything from marketing sites and design systems to full application architectures. Most of my work lives at the intersection of design decisions and technical choices, ensuring what ships looks intentional and holds up under real-world use.'
		],
		approachIntro:
			'My goal is to understand the real problem, work within existing constraints, and deliver solutions that are reliable, maintainable, and understandable.',
		exhibitsIntro:
			'Demonstrations of platform features I’m using now. When a browser lacks support, the exhibit shows its fallback instead.',
		caseIntro:
			'Focused looks at real problems I’ve worked on, the constraints involved, and the decisions made along the way.',
		projectsIntro:
			'Built, shipped, and maintained on my own time, outside any client work. Each card links straight to the live project.',
		contactLead:
			'I’m open to full-time roles, contract engagements, and consulting. Contract work is scoped and remote from Portland, and I reply within two working days.',
		sections: [
			{ id: 'case-studies', label: 'Case Studies', heading: 'Selected work' },
			{ id: 'projects', label: 'Side Projects', heading: 'Self-directed products' },
			{ id: 'approach', label: 'Approach', heading: 'A repeatable process' },
			{ id: 'exhibits', label: 'Exhibits', heading: 'Live browser features' },
			{ id: 'about', label: 'About', heading: 'A self-taught background' },
			{ id: 'contact', label: 'Contact', heading: 'Current availability' }
		]
	})

	await db.insert(tables.skillGroups).values(
		[
			{
				title: 'Core competencies',
				description: 'Software Development, Architecture, Product Design, Data Visualization'
			},
			{
				title: 'Data visualization',
				description: 'D3, Highcharts, Chart.js, ECharts, Three.js, WebGL, SVG, Canvas'
			},
			{
				title: 'Product design',
				description: 'Design Systems, UI / UX, Accessibility, WCAG 2.2, Axe CLI, Figma, Adobe Suite'
			},
			{ title: 'Front-end', description: 'TypeScript, Svelte, Vue, React, Vite, HTML, CSS, SASS, Vanilla Extract' },
			{
				title: 'Back-end',
				description: 'Node.js, Python, PHP, SQL, PostgreSQL, MongoDB, Redis, RESTful APIs, GraphQL'
			},
			{ title: 'Full-stack', description: 'SvelteKit, Nuxt, Next, Laravel, Django, NestJS, FastAPI, Flask, Remix' },
			{ title: 'Testing', description: 'Vitest, Jest, Playwright, Cypress, Supertest, Storybook, Chromatic' },
			{ title: 'DevOps', description: 'Docker, GitHub Actions, GitLab, Jenkins, CI/CD, Terraform, AWS, GCP, Vercel' },
			{
				title: 'CMS & commerce',
				description: 'Payload, Sanity, Directus, Strapi, Contentful, WordPress, Shopify'
			}
		].map((group, index) => ({ ...group, sort: index }))
	)

	await db.insert(tables.approachSteps).values(
		[
			{
				title: 'Understand the product and its constraints',
				description: 'Learn how the product is used, who it serves, and the constraints shaping the work.'
			},
			{
				title: 'Analyze the system as it exists today',
				description: 'Evaluate the current architecture, data flow, and failure points before proposing changes.'
			},
			{
				title: 'Identify the core problem and define success',
				description: 'Determine root causes, and establish clear outcomes so improvements can be evaluated objectively.'
			},
			{
				title: 'Choose a solution and align on tradeoffs',
				description: 'Choose a balanced approach and make the tradeoffs transparent before implementation begins.'
			},
			{
				title: 'Implement incrementally and intentionally',
				description: 'Favor small, reviewable changes that reduce risk and preserve momentum for the team.'
			},
			{
				title: 'Test, ship, and stabilize in production',
				description: 'Use real behavior to refine the solution, deploy carefully, and address issues before moving on.'
			}
		].map((step, index) => ({ ...step, sort: index }))
	)

	await db.insert(tables.projects).values(
		[
			{
				title: 'American Bestiary',
				description:
					"American Bestiary is an illustrated field guide to fifty cryptids, one per state, kept as a naturalist's folio. Each legend is recorded with a straight face, then glossed with what the evidence says.",
				tags: ['TypeScript', 'SvelteKit', 'MongoDB', 'GraphQL'],
				url: 'https://american-bestiary.netlify.app/',
				coverKey: seedCover('american-bestiary.png'),
				coverAlt:
					'A parchment map of the United States titled Tabula of the Continent and Its Beasts, with a dot on every state and Oregon filled in red.'
			},
			{
				title: 'Fogline',
				description:
					'Fogline is a text platform where posts decay in real time, drifting through fog zones until they vanish. Fog events reshape visibility on independent timers, with no likes, dates, or engagement sorting.',
				tags: ['TypeScript', 'SvelteKit', 'Go', 'PostgreSQL'],
				url: 'https://fogline.sh',
				coverKey: seedCover('fogline.png'),
				coverAlt:
					'A near-black screen with a two-line poem in the centre, its letters drifting out of line as the post fades.'
			}
		].map((project, index) => ({ ...project, sort: index }))
	)

	await db.insert(tables.exhibits).values(
		[
			{
				slug: 'contrast-color',
				createdAt: new Date('2026-09-02T12:00:00Z'),
				category: 'Design Systems',
				status: 'emerging' as const,
				title: 'Automatic Contrast in CSS (contrast-color)',
				description:
					'Each tile’s label is colored by contrast-color(), which returns black or white against the tile behind it. The browser handles the contrast math without any values in the stylesheet.'
			},
			{
				slug: 'native-popovers',
				createdAt: new Date('2026-08-19T12:00:00Z'),
				category: 'Browser Capabilities',
				status: 'experimental' as const,
				title: 'Native Popovers for Lightweight UI Overlays',
				description:
					'The mirror is three native popovers, one nested inside the next. Escape closes one level at a time, and an outside click collapses the whole chain, without any overlay code.'
			},
			{
				slug: 'oklch',
				createdAt: new Date('2026-04-02T12:00:00Z'),
				category: 'Design Systems',
				status: 'stabilizing' as const,
				title: 'Perceptual Color in CSS (OKLCH)',
				description:
					'The ramp is one hue at five lightness steps, rebuilt live as the hue moves. Because OKLCH lightness is perceptual, the steps stay even at any hue the slider lands on.'
			},
			{
				slug: 'view-transitions',
				createdAt: new Date('2026-06-11T12:00:00Z'),
				category: 'Browser Capabilities',
				status: 'emerging' as const,
				title: 'View Transitions for Seamless UI Changes',
				description:
					'Shuffling the tiles is a single DOM update wrapped in a view transition. The browser animates each tile to its new position without any animation code written for the move.'
			},
			{
				slug: 'layered-motion',
				createdAt: new Date('2026-01-22T12:00:00Z'),
				category: 'Browser Capabilities',
				status: 'established' as const,
				title: 'Layered Motion for Stateful Interfaces',
				description:
					'Using native browser animation primitives to create smooth, coordinated motion without relying on external libraries. Each wave layer runs two looping animations created with element.animate.'
			}
		].map((exhibit, index) => ({ ...exhibit, sort: index }))
	)

	await db.insert(tables.caseStudies).values(
		[
			{
				slug: 'this-site',
				year: '2026',
				title: 'Building This Site and the CMS Behind It',
				summary:
					'A portfolio kept current through its own single-admin CMS, where every word on the page is editable and a change goes live without a rebuild.',
				tags: ['SvelteKit', 'Postgres', 'Drizzle', 'Netlify'],
				meta: [
					meta('Role', 'Design, build, and content'),
					meta('Stack', 'SvelteKit · Postgres · Netlify'),
					meta('Scope', 'App, CMS, analytics, design system')
				],
				coverKey: seedCover('portfolio-leads.png'),
				coverAlt: 'A screenshot of the dashboard leads section.',
				figures: figures([
					'portfolio-dashboard.png',
					'Admin dashboard with sample data',
					'Stat tiles and leads by week from the first-party event beacon, with the real-or-mock toggle set to sample data.',
					'Admin dashboard with four stat tiles (3 unanswered leads, 14 leads this month, 52 resume downloads, 1.7% contact rate), a stacked column chart of leads over twelve weeks, and bar lists of top pages and referring sites.'
				]),
				sections: [
					section(
						'The problem',
						'A portfolio has to stay current and prove its claims',
						'A static site needs a rebuild for every edit, so the edits stop. A hosted CMS keeps content current but shapes it around its own model and its own editor. And a site that claims to be accessible and well structured has to demonstrate both on the page itself, where any visitor can inspect the result.'
					),
					section(
						'The constraints',
						'One vendor, one person, no servers',
						'Everything had to run on Netlify: serverless functions, Netlify DB for Postgres, Netlify Blobs for images, no persistent process and no file writes. One admin, so no user table and no roles. Every word on the public site editable, including labels and error copy. Secure by default, because the editor is reachable from the internet.'
					),
					section(
						'The approach',
						'SvelteKit as the whole stack',
						'Server loads read Postgres through Drizzle and render the public pages; form actions write. Zod validates every untrusted boundary from the contact form to the reorder payload. The CMS is thin routes over typed mutations: two singletons, five sortable collections with drag-to-reorder built once, a leads inbox with status, and a dashboard fed by a first-party event beacon with a real-or-mock data toggle.'
					),
					section(
						'The decisions',
						'Derived state and role-based color',
						'Nothing derivable is stored: section numbers, case indices, and reading order come from position. Tokens are primitives and the theme is the only place a role meets a mode; a contrast audit later split the accent into a fill step and a text step so both themes clear 4.5:1 without a second hue. Analytics are first-party and privacy-respecting rather than a third-party script.'
					),
					section(
						'The outcome',
						'Editable in a minute, verifiable in the browser',
						'Content changes go live without a rebuild. Both themes pass WCAG 2.2 AA, verified by script and by axe on every page. The design system is documented from the code it ships, and the site you are reading is the running proof.'
					)
				]
			},
			{
				slug: 'client-demos',
				year: '2026',
				title: 'Letting Sales Build Client Demos Themselves',
				summary:
					'Built demo tooling for the sales team, where a branded environment is created, provisioned, and handed off without an engineer in the loop.',
				tags: ['SvelteKit', 'TypeScript', 'Tooling'],
				meta: [
					meta('Role', 'Product Engineer'),
					meta('Stack', 'SvelteKit · TypeScript'),
					meta('Scope', 'Creation, handoff, provisioning')
				],
				coverKey: seedCover('array.png'),
				coverAlt: 'A sales engineer showing a client demo on their mobile phone.',
				figures: figures(
					[
						'client-demo-1-list.png',
						'Every demo and the state it is in',
						'Live, building, failed, and expired demos in one list, with the step a failed run stopped at and the date each one expires.',
						'Client Demos list: counts of 2 live, 1 building, 1 needing attention and 1 expiring soon, above a table of five clients with creator, date, platform, products, sessions, viewers and status.'
					],
					[
						'client-demo-2-create.png',
						'Step one: identity and shell',
						'The first of four steps, with a live preview of the shell and a running summary of what the run will create.',
						'Create client prototype, step 1 of 4: client name and URL fields, a logo upload and a choice of Portal, Vantage or Perch shell, beside a live preview of the shell and a summary of the run.'
					],
					[
						'client-demo-3-review.png',
						'Step four: what the run will write',
						'Every operation the run will perform, in order and named by the service that owns it. Nothing is written until the confirm.',
						'Create client prototype, step 4 of 4: six numbered operations from creating the Portal user to publishing to demos.inlay.com, each tagged with the service that performs it, above a Create prototype button.'
					],
					[
						'client-demo-4-building.png',
						'The build, step by step',
						'Each provisioning step reports as it lands, and the run keeps going if the page is closed.',
						'Building Foundry prototype: a progress bar over seven steps, the first three checked with their timings, the fourth in progress and the last three waiting, with Run in background and Skip to result buttons.'
					],
					[
						'client-demo-5-handoff.png',
						'Handoff, beside what was created',
						'The credentials to pass on, next to a record of everything the run wrote and when the environment expires.',
						'Foundry prototype is live: prototype URL, login email, password and shell, each with a copy button, beside a checklist of the five things the run created.'
					],
					[
						'client-demo-6-detail.png',
						'A demo part way through its build',
						'The configuration as saved, the step the build is on, and the activity that got it there.',
						'Foundry demo detail: a configuration table of URL, platform, products and theme, an activity log, and a Building now panel reporting step 4 of 7.'
					]
				),
				sections: [
					section(
						'The problem',
						'Every demo was an engineering request',
						'Sales engineering needed a branded demo environment for every serious prospect call, and each one was an engineering request. Someone cloned a setup, themed it by hand, loaded plausible data, and handed it over.',
						'The requests queued behind feature work, so demos arrived late or already stale, and the people running the calls could not change what they showed.'
					),
					section(
						'The constraints',
						'Real behavior, sample data, nobody on call',
						'A demo had to look and behave like the real product while containing nothing real, so every environment needed its own provisioned demo users and sample data. The tooling also had to route each demo to the correct environment, and it had to be operable by sales and support without an engineer on call.'
					),
					section(
						'The approach',
						'A creation and handoff workflow, end to end',
						'I built the demo tooling as a product of its own, where a demo is created from a form, provisioned with its own users and data, and handed off to whoever runs the call.',
						'A shared data grid gave every demo the same plausible records, and environment aware routing sent each one to the right API without per-demo configuration. Consolidating the surrounding admin shell was a side effect of this work, done so the tooling had one coherent place to live.'
					),
					section(
						'The decisions',
						'Handoff as the unit of work',
						'The workflow was designed around handoff rather than creation, because the person who builds a demo is rarely the person who presents it. Every demo carries its configuration and data with it, so it survives the exchange.',
						'Provisioning happens inside creation instead of as a separate step, so a demo is usable the moment it exists and nobody assembles credentials by hand.'
					),
					section(
						'The outcome',
						'Demos created without waiting on engineering',
						'Sales engineering and customer support create, provision, and hand off their own branded demos, and engineering left the request path. A new demo takes minutes of form filling, with provisioning included.'
					)
				]
			},
			{
				slug: 'isolated-e2e',
				year: '2024',
				title: 'Isolated End-to-End Testing System',
				summary:
					'An ephemeral testing setup that provisions a full application stack for every CI run, so tests stop sharing state and failures reproduce locally.',
				tags: ['CI/CD', 'Docker', 'MySQL', 'Laravel', 'Cypress'],
				meta: [
					meta('Role', 'Principal Full-Stack Engineer'),
					meta('Stack', 'Laravel · Cypress · Docker'),
					meta('Scope', 'Full stack provisioned per CI run')
				],
				coverKey: seedCover('learnewable.jpg'),
				coverAlt: 'A group of wind turbines in a green pasture next to a winding pathway.',
				figures: figures(
					[
						'learnewable-e2e-tests.png',
						'E2E Test Environment Architecture',
						'Test system structure showing isolated services and teardown flow.',
						'Diagram: Developer or CI starts an ephemeral test environment where Cypress end-to-end tests drive the application under test, which reads a seeded database, and the environment reports test results.'
					],
					[
						'learnewable-dashboard.png',
						'Learnewable Dashboard',
						'The Learnewable platform dashboard design',
						'Learnewable dashboard for the Big Leaf Solar project: status, capacity, storage and location tiles above a world map of stakeholder locations, bar and pie charts of stakeholder sentiment, and a line chart of interaction sentiment by week.'
					]
				),
				sections: [
					section(
						'The problem',
						'Shared test databases were making CI unreliable',
						'End-to-end tests ran against a shared, long-lived environment. State leaked between runs, tests interfered with each other, and failures were often impossible to reproduce locally. The team had started ignoring red builds.',
						'The underlying cause sat below the tests: no run had a clean, isolated stack to execute against.'
					),
					section(
						'The constraints',
						'Real budgets, real pipelines, no rewrites',
						'The suite had to run inside the existing GitHub Actions pipeline without extending build times past what the team would tolerate, and without rewriting the Cypress tests themselves. Provisioning also had to stay cheap enough to run on every pull request instead of only nightly.'
					),
					section(
						'The approach',
						'Provision a full stack per run, then tear it down',
						'Each CI job spins up its own containerized application stack (app server, MySQL, and dependencies) seeded to a known baseline. Real user flows run against that isolated stack, and everything is destroyed on completion regardless of pass or fail.',
						'Because every run starts from an identical baseline, nothing about a failure is unique to CI.'
					),
					section(
						'The decisions',
						'Trade-offs that shaped the architecture',
						'Seeding from fixtures instead of production snapshots kept runs fast and deterministic, at the cost of maintaining the fixture set, a cost the team could see and own. Docker Compose was chosen over a Kubernetes-based setup because it matched what developers already ran locally.',
						'Teardown runs unconditionally, even on failure, so no half-alive environment survives to debug against.'
					),
					section(
						'The outcome',
						'Isolated runs, and a suite the team trusts again',
						'Runs stopped sharing state, so tests could no longer interfere with each other. The same provisioning script doubled as the local debugging tool: a failed CI run replays on a developer machine with a single command. The team went back to treating a red build as a real signal.'
					)
				]
			},
			{
				slug: 'risknet',
				year: '2021',
				title: 'Rebuilding Risknet Around Daily Decisions',
				summary:
					'Rebuilt the Risknet dashboard so the metrics analysts act on lead the layout, with reference detail on demand and new metrics added as data.',
				tags: ['TypeScript', 'React', 'Highcharts'],
				meta: [
					meta('Role', 'Senior Product Engineer & Director, Product Development'),
					meta('Stack', 'React · TypeScript · Highcharts'),
					meta('Scope', 'Dashboard IA and front-end rebuild')
				],
				coverKey: seedCover('mobius-risk-group.png'),
				coverAlt: 'Energy executives working in a board room.',
				figures: figures(
					[
						'risknet-dashboard-before.jpg',
						'Risknet v1 Dashboard',
						'Before: A data-heavy layout built for reporting, with little visual hierarchy or prioritization.',
						'Risknet v1 dashboard: dense tables of counterparty risk exposure, commodity risk limits with one row highlighted in orange, and invoices, each under a dark blue panel header.'
					],
					[
						'risknet-dashboard-after.png',
						'Risknet v2 Dashboard',
						'After: A clearer, task-focused overview designed around how people actually use the system.',
						'Risknet v2 overview: four tinted tiles for dashboards, metrics, reports and documents, a news row, a recent activity timeline, a task list, a calendar and a corporate progress ring chart.'
					]
				),
				sections: [
					section(
						'The problem',
						'Everything was on screen, so nothing stood out',
						'The existing dashboard showed every available metric with equal visual weight. Analysts had to hunt for the handful of metrics they acted on, and the density made the tool exhausting to use for hours at a time.',
						'All of the data was present and none of it was ranked. Every improvement request came back as another panel, which compounded the problem it was meant to solve.'
					),
					section(
						'The constraints',
						'Working analysts, live workflows',
						'The dashboard was in daily use, so the redesign had to ship incrementally, with no big-bang cutover and no retraining week. Existing data contracts and the Highcharts investment stayed, and the work was scoped to information architecture and interface.'
					),
					section(
						'The approach',
						'Find what analysts act on, then design the hierarchy',
						'I worked with analysts to identify which metrics changed what they did that day, then rebuilt the layout so those led, with reference detail available on demand. Chart types were chosen for how the data is read.',
						'The front-end was rebuilt in typed React so the charting layer stayed maintainable as new metric types were added.'
					),
					section(
						'The decisions',
						'Hierarchy over density',
						'The hardest calls were subtractive: demoting metrics analysts said they wanted but never acted on, and moving them behind progressive disclosure instead of deleting them. Chart types were standardized to one encoding per data shape, trading visual variety for instant readability.',
						'A typed metric model made each new metric a data change rather than a UI change, so the layout held as metrics were added.'
					),
					section(
						'The outcome',
						'A calmer tool ranked by daily use',
						'The dashboard now leads with what analysts act on, and it stays calm as it grows. A new metric is a data entry, and the layout does not change.'
					)
				]
			},
			{
				slug: 'genotype',
				year: '2019',
				title: 'Restructuring a Genotype Report for Two Audiences',
				summary:
					'Reorganized a dense genotype report around the questions its readers ask, with one visual language across the charts.',
				tags: ['Vue', 'Express', 'Highcharts'],
				meta: [
					meta('Role', 'Senior Software Engineer & Creative Team Lead'),
					meta('Stack', 'Vue · Express · Highcharts'),
					meta('Scope', 'Report IA, visual system, and rendering pipeline')
				],
				coverKey: seedCover('phylos-bioscience.png'),
				coverAlt: 'A small batch of cannabis seedlings in a research greenhouse.',
				figures: figures(
					[
						'genotype-report-mobile.webp',
						'Redesigned Genotype Report',
						'Clearer structure, improved responsiveness, and more approachable presentation of complex genetic data.',
						'The redesigned genotype report on a phone: a Phylos Tested seal on a teal card, then the variety name Trident with who submitted it and the test date.'
					],
					[
						'genotype-report.png',
						'Closest Genetic Relatives',
						'The report header and the closest genetic relatives, ordered by relatedness.',
						'Genotype report for G-GSVXU: a teal header with the Phylos Tested seal and test details, above a list of its 36 closest genetic relatives with clone counts beside some names.'
					]
				),
				sections: [
					section(
						'The problem',
						'Scientifically correct, but hard to read',
						'The report was dense with accurate genomic data, but its structure made it difficult for readers to extract meaning.',
						'Two audiences read the same document (scientists validating results and customers making decisions from them) and the existing structure served neither well.'
					),
					section(
						'The constraints',
						'Accuracy checked at every step',
						'Every value, confidence interval, and marker had to survive the redesign untouched, reviewed by the science team at each step. The report also had to render identically on screen and in print, since printed copies were part of the delivery.'
					),
					section(
						'The approach',
						'Restructure the narrative without softening the science',
						'I reorganized the report around the questions readers were actually asking, introduced consistent visual encodings for the data, and rebuilt the rendering pipeline so charts and layout stayed precise across output formats.',
						'Every design change was validated against the underlying data to ensure nothing was simplified into inaccuracy.'
					),
					section(
						'The decisions',
						'One visual language for the data',
						'A single encoding system, with consistent color, scale, and annotation rules across every chart, replaced per-chart styling, so readers learn the language once and apply it everywhere. The Vue rendering layer was split from the data layer so the same report definition could drive both the interactive and print versions.'
					),
					section(
						'The outcome',
						'A report both audiences can read',
						'The interactive and print versions are generated from one report definition, so they cannot drift apart. Every value and confidence interval survived the redesign unchanged.'
					)
				]
			}
		].map((study, index) => ({ ...study, sort: index }))
	)
}

base
	.transaction(main)
	.then(() => console.log('Seeded successfully.'))
	.finally(() => pool.end())
