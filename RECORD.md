# Engineering record — foundation slice

Decisions and trade-offs made while building the chart foundation, so the
next slice inherits the reasoning, not just the code.

## Ephemeris choice

The brief named "Swiss Ephemeris compiled to WebAssembly (a maintained port
such as swisseph-wasm)" with a fallback decision at > ~2.5 MB gzipped.

- `@swisseph/browser` 1.4.0 (Swiss Ephemeris C 2.10.03 → WASM, actively
  maintained, SLSA-attested releases): the actual ephemeris payload is the
  WASM binary at ≈ 0.21 MB gzipped plus ≈ 14 KB of emscripten glue. **The
  2.5 MB fallback decision never triggered.**
- It runs on the built-in **Moshier** ephemeris (no `.se1` files needed):
  precision ≈ 0.1″ vs JPL for planets, a few ″ for the Moon — orders of
  magnitude inside the 0.01° gate. Documented here rather than switched
  silently.
- The optional Swiss-file loaders (`loadStandardEphemeris`) are never called;
  `tests/privacy.test.ts` enforces that.

**License note:** `@swisseph/*` is AGPL-3.0 (the Swiss Ephemeris family is
GPL; every real port inherits it). The app is a static client-only tool;
shipping it under a compatible copyleft license should be a deliberate
product decision before public launch. Flagged to the captain in the
delivery report.

## Timezone resolution

Historical offsets come from the IANA tz database built into the runtime via
Luxon/Intl — offline and correct across Estonia's shifting rules (Moscow
time +03:00 1940–1989, DST from 1981, EET/EEST after 1989). The 1961 Tallinn
fixture pins the Moscow-time path; `tests/chart-fixtures.test.ts` asserts
the resolved offset per fixture.

Nonexistent local times (DST spring gaps) surface as a form error rather
than being silently shifted. A wall time the fall-back shows twice still
resolves: it always uses the earlier occurrence and the chart view carries
a note saying the same clock time happened twice.

## Place data

Offline bundled datasets (`src/data/`), built once from GeoNames dumps:
1 124 Estonian settlements and city districts (all pinned to
Europe/Tallinn) and the top 3 000 world cities (population ≥ ≈ 206 k) with
their IANA timezones. The world dataset is code-split and loads on first
search; the Estonian set is in the initial bundle. Generation script lives
in scratch, not the repo; the JSON output is the committed artifact.

## Aspects and orbs

Five major aspects — conjunction ±10°, opposition ±10°, square ±8°,
trine ±8°, sextile ±6° between Sun…Pluto, the mean node, and (when the birth
time is known) the Ascendant/MC at 60% orb. Asc/MC do not aspect each other.
All values are stated in the glossary.

## Unknown birth time

The noon run computes planets and signs (12:00 local plainly chosen) but
takes no liberties with what is unknowable: houses and the Rising sign stay
unavailable, the banner says so, and the Moon is marked uncertain because a
noon assumption can flip its sign.

## What the test gate does and does not prove

The WASM engine is asserted against the official Swiss Ephemeris C library
(native `sweph` binding, real `.se1` files) at five instants, and every Sun
against JPL Horizons. This validates the port and the app's full path
(timezone → UTC → JD → positions/houses). It does not exhaustively verify
the ephemeris over its whole validity range; regeneration tooling and
tolerances are committed for future extension.

## Birth entry wheels

The birth date and time are turned, not typed — three wheels side by side
for the date (day, month, year) and two for the time (hour, minute),
because a wheel row is far more compact than stacked sliders. Each wheel is
a real vertical scroll list with scroll-snap: the selection sits in a
highlighted centre band, neighbours are dimmed by a scrim, and mouse drag,
touch flick, wheel scroll, arrow keys, Home and End all move it. Date
options read the whole date to a screen reader ("14. märts 1991"), time
options the whole clock time ("kell 14:30") — the whole-meaning label lives
on the selected option only, so the annotated tree stays small even with a
227-option year wheel.

Implementation notes worth keeping: the wheel CSS lives in global.css
because Astro scopes component styles by attribute, and the DOM option
lists are built by app.ts at run time — scoped rules would never match
JS-created elements. Programmatic scrolls are always instant: a smooth
scroll fires intermediate scroll events that look like user picks and
fight the target. The scroll handler reads the real item height
(40 px under 360 px) rather than a constant. Two pad items above and below
the list make snap-centre math a straight index*itemHeight.

One shared year bound governs the parser, the year wheel, the pristine default
and import validation: 1800 to the current calendar year, computed at
runtime (never a hardcoded year that goes stale). A typed value the parser
rejects as out-of-range gets its own form error (form.error.yearRange)
instead of being silently rewritten; a value the parser accepts always
moves the wheels and never alters the meaning.

Trade-off: wheels and text fields are initialised from the example the form
always showed (14.03.1991, 14:30) and agree from first paint — the value is
never hidden, as a placeholder never was.

The submit path is structurally untouched: submit keeps parsing the
dd.mm.yyyy / HH:MM fields, so DST-gap rejection and the fall-back note are
exactly what they were; tests/birth-wheels.test.ts re-proves both through
the wheel path alongside clamping, keyboard movement and two-way sync.
