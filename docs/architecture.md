# Architecture

One page, and the only architecture page this project keeps.
Product behaviour and user setup live in the project's root `README.md` and are not repeated here.

## Purpose

A static, browser-only Estonian astrology app that reads one real transit against the user's on-device natal chart and renders it as a daily story, with the chart wheel as the depth layer. Product description, audience and stack rationale live in the root [`README.md`](../README.md); this page maps how the code delivers that.

## How to run and verify

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Run (background dev server) | `npm run dev`; stop/status/logs with `npm run dev:stop`, `npm run dev:status`, `npm run dev:logs` |
| Test | `npm test` (runs `npm run docs:check` first through `pretest`) |
| Lint / typecheck | `npm run check` |
| Build | `npm run build` |
| Docs only | `npm run docs:check` |

`npm test` is the real gate: `pretest` runs the documentation shape check first, then Vitest runs the chart and transit fixtures, the privacy scan, the content gate, the golden copy and the Estonian spelling checks. Nothing here talks to a server, so the same commands work offline.

## Map

- **Entry points.** `src/pages/index.astro` is the single static page: at build time it renders the shell and its interface strings from the catalogue, so the form and the story frame are readable before JavaScript. `src/scripts/app.ts` is the client controller loaded by that page; it owns boot, the birth form, chart rendering, the daily story, focus setup, and share/export/import, and it is where the day's wording actually reaches the screen.
- **Main modules.**
  - `src/lib/time.ts` — birth wall clock plus IANA timezone to a UTC instant via Luxon; rejects DST-gap times and notes the fall-back ambiguity.
  - `src/lib/ephemeris.ts` — the only seam onto Swiss Ephemeris WASM: a lazily initialised singleton, Moshier flags, Placidus houses.
  - `src/lib/chart.ts` — natal chart model: placements, house cusps, Asc/MC, the five major aspects; planets compute even when the birth time is unknown, houses and the Rising sign do not.
  - `src/lib/transits.ts` — the current sky (Sun through Pluto plus the mean node; no Moon) read against the natal chart with transit orbs, day key in `Europe/Tallinn`.
  - `src/lib/meaning.ts` — the typed `MEANING_UNITS` table, the natal-target-to-focus map, and the one function that selects the day's single reading. Every unit also carries the day's copy: `open`, `tight`, `action`, `pitfall`, `astroNote` and the four story paragraphs, which `app.ts` renders straight from the unit.
  - `src/messages/catalogue.ts` — the interface message catalogue: labels, headings, buttons, errors and the glossary; Estonian is the source language and English is structure only. Story copy is not here.
  - `src/scripts/wheel.ts` — programmatic SVG wheel: signs, glyph placement, house spokes, aspect lines, plus the selection model the detail panel reads.
  - `src/lib/storage.ts`, `src/lib/share.ts` — versioned localStorage records with JSON export/import; share links encode only derived Sun/Moon/Rising signs.
  - `src/lib/places.ts` with `src/data/*.json` — offline place search over bundled Estonian settlements and world cities; the world set is code-split.
  - `src/lib/birth-wheels.ts`, `src/lib/format.ts`, `src/lib/astro-constants.ts` — wheel logic and the shared year bound, Estonian date/degree formatting, bodies/aspects/focus constants.
- **Data flow.** Birth entry (wheel pickers or text fields) → `resolveInstant` turns local time and the chosen place's timezone into UTC → `computeChart` asks the WASM ephemeris for positions and Placidus houses → the resulting `Chart` stays in memory for the session while only the birth inputs are written to localStorage (`toStored`), and control routes to focus setup, then the story → `currentTransitReading(new Date(), chart)` computes the sky now → `selectDayReading` picks at most one meaning unit → `app.ts` renders the plain tier, the story tier and the "Miks see?" reveal; the wheel renders on demand from the same `Chart`. A reload restores the stored birth record, recomputes the chart from it and renders the story for the current moment, so nothing derived is ever persisted. A share fragment is decoded at boot into a read-only trio view that neither stores nor recomputes anything. No step sends data anywhere.
- **External dependencies that matter.** `@swisseph/browser` — Swiss Ephemeris C 2.10.03 compiled to WASM, ≈0.2 MB gzipped, running the built-in Moshier ephemeris; no `.se1` files are ever fetched. It is AGPL-3.0, and that licence question is recorded in `decisions/0002-swiss-ephemeris-wasm-and-agpl.md`. `luxon` supplies historical timezone offsets from the runtime's IANA data. `astro` produces the static build; `vitest`, `@astrojs/check` and `typescript` are dev-only. `hunspell-asm` plus the committed et_EE dictionary power the spelling test only. Fonts are self-hosted under `public/fonts`.

## Where to change what

| Change | Start here |
| --- | --- |
| Interface wording (labels, headings, buttons, errors) | `src/messages/catalogue.ts`; then re-run the content gate, goldens and spelling tests |
| The day's story copy and its plain-tier fields | `src/lib/meaning.ts`, in the matching `MEANING_UNITS` unit; then re-run the content gate, goldens, spelling and meaning tests |
| Birth form, wheels, focus UI | Markup in `src/pages/index.astro`, behaviour in `src/scripts/app.ts`, wheel logic in `src/lib/birth-wheels.ts` |
| Natal positions, houses, aspects | `src/lib/chart.ts` and `src/lib/astro-constants.ts` |
| Ephemeris engine or flags | `src/lib/ephemeris.ts`; the engine choice and licence posture are decisions, not an implementation detail |
| Which story a day selects | `src/lib/meaning.ts` |
| Transit bodies, orbs, day boundary | `src/lib/transits.ts` |
| Wheel drawing and glyph layout | `src/scripts/wheel.ts` |
| Saved data, export, import, reset | `src/lib/storage.ts` |
| Share link format | `src/lib/share.ts` |
| Place data or timezone handling | `src/lib/places.ts`, `src/data/*.json`, `src/lib/time.ts` |
| Visual design and fonts | `src/styles/global.css`, `public/fonts` |

## Generated layout

The block below is generated from repository evidence and validated by `bash scripts/check-project-docs.sh .`; never edit it by hand.

<!-- fm:generated:begin layout -->
<!-- fm:generated-meta tool=fm-project-docs.sh v1 head=95d57e6970fa5740e165be05f9a3980e638d4403 refreshed=2026-11-03 -->
Generated from repository evidence: top-level paths, declared scripts, entry points, test commands, and dependencies.
Every `- path` line is checked by `scripts/check-project-docs.sh`, so a stale entry fails the project's own test command instead of misleading the next reader.

### Top-level layout

- path `.github`
- path `.gitignore`
- path `.no-mistakes.yaml`
- path `.vscode`
- path `AGENTS.md`
- path `README.md`
- path `RECORD.md`
- path `astro.config.mjs`
- path `docs`
- path `package-lock.json`
- path `package.json`
- path `public`
- path `scripts`
- path `src`
- path `tests`
- path `tsconfig.json`
- path `vitest.config.ts`

### Declared scripts

- script `astro` - `npm run astro`
- script `build` - `npm run build`
- script `check` - `npm run check`
- script `dev` - `npm run dev`
- script `dev:fg` - `npm run dev:fg`
- script `dev:logs` - `npm run dev:logs`
- script `dev:status` - `npm run dev:status`
- script `dev:stop` - `npm run dev:stop`
- script `docs:check` - `npm run docs:check`
- script `pretest` - `npm run pretest`
- script `preview` - `npm run preview`
- script `test` - `npm run test`
- script `test:watch` - `npm run test:watch`

### Entry points

None declared in package.json.

### Test commands

- test command `npm run build` - package.json scripts.build = `astro build`
- test command `npm run check` - package.json scripts.check = `astro check`
- test command `npm run test` - package.json scripts.test = `vitest run`
- test command `npm run test:watch` - package.json scripts.test:watch = `vitest`

### Declared dependencies

- dependency `@astrojs/check` - declared in package.json devDependencies
- dependency `@swisseph/browser` - declared in package.json dependencies
- dependency `@types/luxon` - declared in package.json devDependencies
- dependency `@types/node` - declared in package.json devDependencies
- dependency `astro` - declared in package.json dependencies
- dependency `hunspell-asm` - declared in package.json devDependencies
- dependency `luxon` - declared in package.json dependencies
- dependency `typescript` - declared in package.json devDependencies
- dependency `vitest` - declared in package.json devDependencies
<!-- fm:generated:end -->
