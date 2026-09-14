# Tyler King — Portfolio

A portfolio and its own CMS in one SvelteKit app on Netlify. Everything on the public site is
edited live at `/admin`; nothing needs a rebuild.

## Stack

- **SvelteKit 2 / Svelte 5 / TypeScript** with `@sveltejs/adapter-netlify`: pages, the admin
  and the API run as Netlify Functions.
- **Postgres via Drizzle ORM** (`node-postgres`). Netlify DB (Neon) in production, Docker locally.
- **Netlify Blobs** for uploaded images (side project covers, case study covers and figures).
  Under `pnpm dev`, seeded images are read straight from `scripts/seed-assets/` and uploads go to
  a `portfolio-cms-media` folder in the system temp directory instead. On Netlify, `VITE_IMAGE_CDN` in
  `netlify.toml` makes `src/lib/media.ts` request each image through the Netlify Image CDN at the
  widths its slot needs; any other build serves the stored original from `/media/`.
- **vanilla-extract** for styling: `tokens.ts` holds primitives, `theme.css.ts` maps roles for
  both themes, and all type goes through the `Text` component.
- **Tooling:** Biome (format and lint), svelte-check, knip, jscpd, Vitest, Playwright with axe.

```
netlify.toml          the build migrates, then builds
_headers              security headers, applied by Netlify and by hooks.server.ts; /fonts/* cached immutably
.github/              CI workflow and Dependabot
src/routes/           (site) public pages · admin/ CMS · api/event · media/ · robots.txt · sitemap.xml
src/lib/components/   elements · layout · sections · pages · exhibits · admin
src/lib/server/       analytics · auth · db · http · media
src/lib/labels/       every interface label and its default
src/lib/styles/       tokens · theme · recipes · patterns · rules
src/lib/utils/        small helpers
drizzle/              SQL migrations generated from src/lib/server/db/schema.ts
scripts/              seed.ts · set-password.ts · seed-assets/
tests/                component · integration · e2e, with shared helpers and setup
```

## Local setup

Node 24 (`.nvmrc`), pnpm 12 and Docker.

```bash
docker run -d --name portfolio-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio -p 5433:5432 postgres:16

cp .env.example .env    # then fill it in, see below
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev                # http://localhost:5173
```

`pnpm db:seed` replaces the content tables and never touches leads, analytics or users. It
refuses any database that is not on localhost unless given `--force-production`.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string. Set it in Netlify's environment variables; locally `postgresql://postgres:postgres@localhost:5433/portfolio`. |
| `APP_SECRET` | At least 32 characters (`openssl rand -base64 48`). Keys the HMAC that keeps raw IP addresses out of rate-limit rows. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The first admin, created on the first sign-in attempt while the `users` table is empty and ignored after that. Remove them once you can sign in. |

`pnpm set-password <email>` changes a password in whichever database `DATABASE_URL`
points at and signs that user out everywhere.

## Scripts

| Script | Does |
|---|---|
| `dev` · `build` · `preview` | Vite dev server, production build, preview of the build |
| `check` | `svelte-check` over app and tests |
| `lint` · `lint:fix` | Biome |
| `knip` · `dup` | Unused files, exports and dependencies; copy-paste detection over `src` and `tests` |
| `db:generate` · `db:migrate` · `db:seed` | Generate a migration from the schema, apply migrations, load content |
| `test:unit` · `test:component` · `test:integration` | One Vitest project each |
| `test` · `test:coverage` | All three, the second with coverage thresholds |
| `test:e2e` | Builds, then runs Playwright |
| `verify` | lint → check → knip → dup → coverage → e2e |

## Tests

- **Unit** (`src/**/*.test.ts`, node) and **component** (`src/**/*.dom.test.ts` and
  `tests/component`, jsdom with Testing Library).
- **Integration** (`tests/integration`) runs loads, actions, hooks and queries against real
  Postgres. It uses `<database>_test`, derived from `DATABASE_URL`, created if missing
  and rebuilt from the migrations on every run. Every variable the server reads is pinned in
  `vite.config.ts`, so no test depends on your `.env`.
- **End to end** (`tests/e2e`) runs against the production build. `tests/e2e/serve.ts` rebuilds
  `<database>_e2e`, seeds it, starts the Netlify Blobs emulator with the seed images, and serves
  `vite preview` with a throwaway admin. Public pages run on Chromium, Firefox, WebKit, a Pixel 7
  and an iPhone 14 with axe (WCAG 2.2 AA) in both themes; admin, security and no-JavaScript flows
  run on Chromium.
- **Coverage:** all TypeScript must reach 100% lines and functions, 99% statements and 90%
  branches. Svelte templates are covered by the component and end-to-end suites.

## CI and deploys

`.github/workflows/ci.yml` runs on every push to `main` and every pull request, with a Postgres 16
service: install, lint, check, knip, dup, a check that the schema has no ungenerated migration,
coverage, then the full end-to-end matrix. Playwright reports are uploaded when it fails.
Dependabot opens weekly updates for npm packages and actions.

Netlify builds with `pnpm run db:migrate && pnpm run build`, so pending
migrations apply before each deploy. Make the CI check required on `main` so only green commits
reach it. Set `DATABASE_URL`, `APP_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Netlify, sign in
once, then remove the last two.

## Admin

- **Dashboard:** visits, resume downloads, outbound clicks and leads, with a real/mock data
  toggle. Every chart has a table view.
- **Leads:** contact form messages with a status (new, replied, archived, needs review).
- **Globals** and **Home:** site settings, contact details, socials, every interface label, and
  each home section's copy, label, heading and order.
- **Approach**, **Exhibits**, **Side Projects**, **Skills:** sortable collections, edited in
  place on the list page. Side projects take a cover.
- **Case Studies:** a sortable list into a per-study editor, because a case study has a page of
  its own on the site. It takes a cover and ordered figures; a figure can be added before its
  image and stays hidden on the site until one is uploaded.

Section numbers, case indices, the SEO title and the hero name lines are derived, not edited.

## Theming

Colour is a two-layer system and both surfaces, public and admin, read from the same layer.

- `src/lib/styles/tokens.ts` holds the raw palettes, the chart series, and the `font`, `space`,
  `radius`, `motion`, `layout`, `breakpoint`, `zIndex` and `touch` scales. Nothing outside this file
  names a hex value. `space` is a 4px grid keyed by multiples of four (`space[3]` is 12px), with
  the half steps the type-led rhythm needs; spacing never uses a raw pixel value.
- `src/lib/styles/theme.css.ts` maps those primitives onto **roles** (`background`, `panel`, `raised`,
  `foreground`, `line`, `accent`, `scrim` and so on) for each theme. `src/lib/styles/visualization-theme.css.ts` does the
  same for the chart series, which stay separate because they are CVD-validated per mode.

The theme follows the operating system's light or dark setting through `prefers-color-scheme`,
with no switch and no script: dark values sit on `:root` and a media query swaps in light, so the
page changes the moment the OS setting does. Every role compiles to a CSS custom property on
`:root`, so a fork can recolour the whole site **without a rebuild** by shipping one style block
that wins on specificity:

```css
html:root {
  --theme-accent: #0f766e;
  --theme-accent-text: #0f766e;
}
```

The names are the contract's mapped values, so they stay kebab-case and stable: renaming one
breaks a fork's overrides. The full set is `--theme-` plus `background`, `panel`, `panel-secondary`, `raised`, `foreground`,
`foreground-secondary`, `muted`, `faint`, `line`, `line-secondary`, `control`, `accent`, `accent-text`, `accent-ink`,
`positive`, `negative`, `shadow` and `scrim`. `faint` and `control` draw input borders, outline
buttons and chart marks, so an override must keep them at 3:1 against `raised` and `panel-secondary`.
Editing `theme.css.ts` instead changes the shipped defaults and needs a build.
`src/error.html` renders without the app's CSS, so it repeats the background, foreground and
theme-color values by hand; `src/lib/styles/error-page.test.ts` fails when they drift from `tokens.ts`.

### The dataviz palette

`src/lib/styles/visualization-theme.css.ts` is the one palette for everything that encodes data: the admin
charts and the exhibit demos both read from it, so recolouring it moves both. It holds only the palette, so
public pages that show exhibits never load the chart component styles in `visualization.css.ts`. Its roles are
`--visualization-series-1` to `--visualization-series-4` (the categorical slots, in fixed order), `--visualization-other` (the fold for a
fifth series), `--visualization-grid`, `--visualization-track` and `--visualization-surface`.

The rules it is built on, worth keeping if you change the values:

- The slots stay clear of the brand accent, and the accent moves rather than the palette. The
  four hues sit 100 degrees or more apart, which is what makes them separable under colour
  blindness, so re-tinting one to dodge the brand costs more than it buys. The brand instead
  lives at hue 209, the middle of the widest gap in the set: it is OKLab dE 15 from its nearest
  series, where a brand sharing a slot's hue would be dE 2. It is one value across both themes;
  only its link step differs, because no single colour clears 4.5:1 against a near-black page
  and a sand one at once.
- Categorical slots are assigned in fixed order and never cycled. A fifth series folds into
  `other` rather than inventing a hue, and colour follows the entity rather than its rank, so
  filtering never repaints the remaining series.
- Both modes are selected against their own surface, not flipped. Each set clears a lightness
  band, a chroma floor, adjacent CVD separation, a normal-vision floor and 3:1 contrast.
- Identity is never colour alone: charts carry a legend and a table view, and the shuffle demo
  labels each mark.
- Text never wears a series colour. Labels and values stay in the `--theme-` ink roles, and the
  coloured mark beside them carries the identity.

## Analytics and privacy

The public site sends first-party beacons to `POST /api/event` (pageviews, resume downloads,
outbound clicks); the contact action records leads itself. The endpoint accepts only same-origin
JSON, is rate limited, ignores bots and `/admin` paths, keeps only the referrer's hostname, and
strips query strings from outbound links. Do Not Track is respected, and no cookie is set.
Rate-limit rows hold an HMAC of the IP address, never the address itself. Leads and events are
kept until deleted in the admin.

## Security

Security headers are defined once in `_headers`. Netlify applies them to static files
and `hooks.server.ts` adds them to every rendered response, together with a hash-based CSP that
allows only same-origin scripts and SvelteKit's own inline scripts. Admin routes are guarded by their resolved
route id, so encoded paths such as `/%61dmin` cannot slip past, and every admin action checks
the session again.

`_headers` also caches `/fonts/*` for a year as immutable, so font filenames carry a hash of the
file contents. Give a rebuilt font a new filename and update `fonts.css.ts`, the preload in
`src/app.html` and `src/error.html` together.
