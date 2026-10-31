# Engineering record

Decisions and trade-offs made while building, so each slice inherits the
reasoning, not just the code. Chart foundation first, then the daily story,
then the content gate over the voice.

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

## Content gate

The captain's reversal for this slice: sisu on toode — the app must
mechanically stop a bad sentence, not just wait for one human reader.
`tests/helpers/content-checks.ts` is the deterministic, offline rule
library; `tests/content-gate.test.ts` runs it inside `npm test` over
every string the app can show — the whole catalogue (both languages),
every generated `fmt` composite, and every meaning-unit field.

Rules, each proven on its own bait so a check without a failing case
never counts as done:

1. **Banned vocabulary.** Promise/certainty language (`juhtub`,
   `õnnestub`, `kindlasti`, `garanteeritud`, `paratamatult`,
   `lubame`, and outcome-shaped `saad` …) plus money/health claim
   patterns (`raha tuleb sinuni`, `haigus taandub`, `paraned`,
   `tervendad`, `soovitame ravi` …). Every regex is Unicode-boundary
   wrapped (`(?<![\p{L}\p{N}])…(?![\p{L}\p{N}])`), because plain `\b`
   breaks on Estonian vowels — the array module's own comment already
   said so. Composition beats stems: `saad aru`, `ei õnnestunud`,
   `Raha ja kindlus` and naming the body must all stay legal, and the
   suite anchors them as allowed near-misses.
2. **Structure.** A tier-2 story is exactly four paragraphs (one field
   each, no newlines), closes with the unit's action verbatim (`endsWith`,
   stronger than the earlier `contains`), and the action opens with an
   imperative verb from an explicit approved list — directly or after a
   short subordinate clause, matching the copy's real shapes
   ('Enne kui …, kirjuta …'). A new verb enters the list only through
   review.
3. **Containment.** Tier-2 story paragraphs still carry no planet, sign,
   house or aspect name — now also their everyday synonyms
   (`taevakeha`, `tähtkuju`, `horoskoop`, `sodiaak`) and the
   grade-inflected stems (`ruud`) the pure stem list missed.
   Tier-1 names aspects only in the approved terms
   (konjunktsioon, sekstiil, ruut, trigoon, vastasseis) and rejects
   kvadratuur, kvadraat and opositsioon; the catalogue's own
   `aspect.*` messages are pinned to those terms.
4. **Length/readability.** Stated bounds per story paragraph: 7–50
   words, 15–95 syllables (Estonian syllables approximated as vowel
   runs; bounds carry headroom for both the counting error and wording
   touch-ups — the reviewed corpus spans 8–45 words, 19–83 syllables).

**Goldens** (`tests/golden/day-readings.json`,
`tests/content-golden.test.ts`): nineteen pinned day readings —
18 meaning units + the quiet unit — each snapshotting the unit's full
day-view copy (story paragraphs, plain-tier lines, astro note) from a
fixed synthetic transit input (no clock, no ephemeris, no network), so
unit-selection changes fail the pin before the voice can. Every entry
is real shipped copy, and every entry is marked `provisional` (status
field plus the pinning comment inside the JSON): no unit has yet been
through a captain-owned edit, and the set must never pass provisional
copy off as approved. `GOLDEN_UPDATE=1 npm test --
--run tests/content-golden.test.ts` re-pins deterministically — the
regeneration is byte-identical when nothing changed. To be flipped to
`approved` only after the captain's review.

Hits report the file, line and exact string (the gate reads the source
files' own lines). All checks are wrappers-free regex and counters —
no model calls, no network, no randomness. Out of scope by the brief:
Estonian spelling (separate issue), similarity scoring (separate
issue), and story copy changes beyond what the checks require.

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
never hidden, as a placeholder never was. A restored entry with an unknown
time keeps that same example behind its hidden wheels: unchecking the
unknown-time box proposes 14:30, exactly what the fresh form would show —
not an arbitrary noon.

The submit path is structurally untouched: submit keeps parsing the
dd.mm.yyyy / HH:MM fields, so DST-gap rejection and the fall-back note are
exactly what they were; tests/birth-wheels.test.ts re-proves both through
the wheel path alongside clamping, keyboard movement and two-way sync.

## Daily story slice (astro-story)

The app's meaning is reversed here: the chart wheel is no longer the entry
point. The daily story is the landing surface; the wheel is the depth layer
reachable underneath it. One day, one transit, three readings: the story
tier (four paragraphs — situation, turn, climax, meaning — with no planet, sign,
house or aspect ever named), the plain tier (the same unit with the astro
line, what is open, what is tight, the action, the pitfall), and the chart
itself. Both tiers read the same typed meaning unit, so they cannot drift.

**Transit engine** (`src/lib/transits.ts`): geocentric ecliptic longitudes
of Sun…Pluto plus the mean node — the Moon is deliberately not a transiting
body, because a monthly circuit would drown every day — compared against
the natal chart (all bodies plus Asc/MC when the birth time is known) with
the five major aspects at transit orbs: conjunction/opposition ±8°,
square/trine ±6°, sextile ±4°; Asc/MC keep the natal engine's 60%
tightening. Transits are computed for the device's current moment, with
Europe/Tallinn as the operating timezone that names the day. The
correctness gate reuses the committed natal fixtures: the same five
externally validated instants (Swiss Ephemeris C 2.10.03 + JPL Horizons Sun
cross-check) read from the transit side at the same 0.01° tolerance.

**Meaning layer** (`src/lib/meaning.ts`): a single typed unit per transit
shape keyed by transiting body, aspect and the life domains it speaks
into. The archetype space is the finite `MEANING_UNITS` table (18 entries:
Saturn/Jupiter/Mars/Venus/Mercury/Uranus/Pluto/Neptune shapes plus five
tone-generic units, one per aspect kind, which describe the shape itself
without inventing specifics) plus the explicit `TARGET_FOCUS` map from
natal target to domains. Selection ranks hits by tightest orb, requires a
unit whose focus intersects the target's domains intersected with the
user's chosen areas (skipping the setup steers nothing), prefers exact-body
over generic, and reads the day one of three ways, each saying something
true: a hit with a unit renders today; an in-orb hit whose shape has no
unit yet says plainly that the story for that shape is not written (the
"Miks see?" panel still names the transit, the orb and the natal target,
since the reveal must stay copyable to the chart); only a genuinely empty
sky — no pair inside any aspect window — reads as the honest `QUIET_UNIT`,
so the sky is never described as quiet while something is in orb. No unit
is ever invented. Content rules enforced by tests: story
fields contain no astrological vocabulary (Unicode-boundary stem scan,
because JS `\b` breaks on Estonian vowels), the story's final paragraph
contains the unit's action verbatim, and every unit carries open/tight/
action/pitfall/astroNote. No outcomes are promised — only tendencies and
choices; the daily action is always concrete (mine, don't go, say, don't
say, wait).

**Focus setup**: first shown once, four choices (work, relationships,
creative, money), at most three, skippable — but directly reopenable from
the chart view ("Fookus"), so neither a saved nor a skipped choice locks
the setup away. Stored beside the birth record under its
own versioned key `firstmate-astro.focus.v1` — the birth record's
export/import format stays untouched, so no migration exists. Reset clears
both records.

**"Miks see?" reveal**: one button under either tier opens the transit
(body, its sign and degree), the aspect with its orb, the natal placement
it touches (sign, degree, house when known) and the unit's plain sentence
about what the aspect does. On a quiet day the same control reports
honestly: nothing is in orb, what was checked, and the nearest miss with
its distance from the orb window.

Trade-off: with 18 units, most days resolve to a transit-specific story,
and the five shape-generic units carry the rare shapes without one (a
focus-mismatched specific unit gets its aspect's generic story, so focus
steering stays on the specific units); only an empty sky reads as a quiet
day. The story-not-written state is deliberately kept rare by the generic
fallbacks, and when it happens it names the real transit instead of
pretending none exists.

**Out of scope, unchanged**: tier-3 animation, payments, accounts, English
copy, synastry, notifications, transit-to-transit and retrograde-station
commentary. The ephemeris seam and its licence posture are untouched.
