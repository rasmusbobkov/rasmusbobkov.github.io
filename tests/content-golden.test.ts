/**
 * GOLDEN COPY SET — the shipped voice, pinned against tested inputs.
 *
 * "around forty approved texts with snapshots of generated output for
 * fixed inputs, so a generator change that alters the voice fails until
 * reviewed."
 *
 * One golden entry per day unit (18 meaning units + the honest quiet
 * unit): the day view strings each unit renders — the tier-2 story (four
 * paragraphs), the tier-1 plain lines, and the astro note — produced
 * from a fixed, synthetic transit input (never the device clock, no
 * ephemeris, no network). Nineteen story texts plus nineteen plain
 * renderings is the golden set.
 *
 * Every golden entry is anchored to REAL copy that shipped in the app —
 * a snapshot of the unit exactly as the app renders it, not invented
 * placeholder copy. Because no unit has yet been through a
 * captain-owned edit, every entry carries status "provisional" (the
 * status field plus the pinning comment at the top of the JSON); an
 * entry may claim "approved" only after the captain has reviewed its
 * text, and then only with a reference to that review.
 *
 * A change that alters the voice fails this test until somebody re-reads
 * the changed copy and re-pins it with:
 *     GOLDEN_UPDATE=1 npm test -- --run tests/content-golden.test.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';
import { MEANING_UNITS, QUIET_UNIT, selectDayReading } from '../src/lib/meaning';
import type { DayUnit } from '../src/lib/meaning';
import type { AspectKind } from '../src/lib/astro-constants';
import type { AspectParticipant, TransitBody, TransitHit } from '../src/lib/transits';

const ROOT = path.resolve(import.meta.dirname, '..');
const GOLDEN_FILE = path.join(ROOT, 'tests', 'golden', 'day-readings.json');

const UPDATE = process.env.GOLDEN_UPDATE === '1';

const UNITS: readonly DayUnit[] = [...MEANING_UNITS, QUIET_UNIT];

/** A fixed synthetic hit: shape only; selection never reads longitudes. */
function hitOf(
  transitBody: TransitBody,
  aspect: AspectKind,
  target: AspectParticipant,
  orb = 2,
): TransitHit {
  return {
    transitBody,
    aspect,
    target,
    targetLongitude: 0,
    transitLongitude: 0,
    separation: 90,
    orbDegrees: orb,
    workOrb: 6,
  };
}

/**
 * The fixed input each golden unit is rendered from, chosen so
 * selectDayReading picks exactly that unit — the input is part of the
 * pin: if unit selection changes, the golden fails before the voice can.
 */
const FIXED_INPUTS: { readonly [id: string]: TransitHit | null } = {
  'saturn-square-work': hitOf('saturn', 'square', 'sun'),
  'saturn-conjunction-work': hitOf('saturn', 'conjunction', 'sun'),
  'saturn-opposition-relationships': hitOf('saturn', 'opposition', 'moon'),
  'jupiter-trine-work': hitOf('jupiter', 'trine', 'sun'),
  'jupiter-square-money': hitOf('jupiter', 'square', 'venus'),
  'mars-square-work': hitOf('mars', 'square', 'mars'),
  'mars-conjunction-creative': hitOf('mars', 'conjunction', 'moon'),
  'venus-sextile-relationships': hitOf('venus', 'sextile', 'moon'),
  'venus-opposition-relationships': hitOf('venus', 'opposition', 'venus'),
  'mercury-square-work': hitOf('mercury', 'square', 'sun'),
  'uranus-square-work': hitOf('uranus', 'square', 'sun'),
  'pluto-trine-money': hitOf('pluto', 'trine', 'venus'),
  'neptune-square-creative': hitOf('neptune', 'square', 'moon'),
  // the five shape-generic units: bodies with no specific unit of that shape
  'any-opposition': hitOf('uranus', 'opposition', 'sun'),
  'any-sextile': hitOf('sun', 'sextile', 'sun'),
  'any-conjunction': hitOf('sun', 'conjunction', 'sun'),
  'any-trine': hitOf('sun', 'trine', 'sun'),
  'any-square': hitOf('sun', 'square', 'sun'),
  // the honest quiet day: nothing at all in orb
  quiet: null,
};

/** What the day view renders for the fixed input of one unit. */
function renderDayReading(id: string) {
  const input = FIXED_INPUTS[id];
  const reading = selectDayReading(input ? [input] : [], []);
  expect(reading.unit, `${id} golden: the day reading resolves to a unit`).not.toBeNull();
  expect(
    reading.unit!.id as string,
    `${id} golden: its fixed input must select the unit itself, not another story`,
  ).toBe(id);
  const u = reading.unit!;
  return {
    status: 'provisional',
    input: input
      ? {
          transitBody: input.transitBody,
          aspect: input.aspect,
          target: input.target,
          orbDegrees: input.orbDegrees,
        }
      : { transitBody: 'none' },
    story: [u.story.situation, u.story.turn, u.story.climax, u.story.meaning],
    plain: { open: u.open, tight: u.tight, action: u.action, pitfall: u.pitfall },
    note: u.astroNote,
  };
}

// ——— golden file plumbing ———

/** A comment block, not JSON: the loader strips lines starting with //
 * before parsing, so the pinning policy lives IN the golden file. */
const GOLDEN_HEADER = `// GOLDEN COPY SET — the pinned day readings.
//
// Each entry below is REAL shipped copy — exactly the strings the app
// renders for that unit's day view on its fixed input (see the test),
// not a generated placeholder.
//
// status: "provisional" — this unit's text has NOT yet been through a
//   captain-owned edit. Snapshotted here so any voice drift is caught,
//   and never a claim of approval.
// status: "approved" — only write this after the captain has reviewed
//   the exact strings, recording the approving review in the companion
//   README.md. Never pre-mark.
//
// Re-pin after a reviewed copy change:
//   GOLDEN_UPDATE=1 npm test -- --run tests/content-golden.test.ts
`;

interface GoldenEntry {
  status: string;
  input: Record<string, string | number>;
  story: string[];
  plain: { open: string; tight: string; action: string; pitfall: string };
  note: string;
}

type GoldenEntries = Record<string, GoldenEntry>;

/** Lines starting with // carry the pinning policy, not data. */
function parseGolden(text: string): GoldenEntries {
  const json = text
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('//'))
    .join('\n');
  return (JSON.parse(json) as { entries: GoldenEntries }).entries;
}

/** Regenerate the goldens from the live app copy and re-run the suite. */
function writeGolden(): void {
  const entries = Object.fromEntries(
    UNITS.map((u) => [u.id, renderDayReading(u.id)] as const),
  );
  fs.writeFileSync(GOLDEN_FILE, `${GOLDEN_HEADER}${JSON.stringify({ entries }, null, 2)}\n`);
}

let loadedEntries: GoldenEntries;
if (UPDATE) {
  writeGolden();
  loadedEntries = parseGolden(fs.readFileSync(GOLDEN_FILE, 'utf8'));
} else {
  expect(
    fs.existsSync(GOLDEN_FILE),
    'golden file must exist — see tests/golden/README.md for the re-pin run',
  ).toBe(true);
  loadedEntries = parseGolden(fs.readFileSync(GOLDEN_FILE, 'utf8'));
}

test('the golden set covers exactly the day units that can render', () => {
  const ids = Object.keys(loadedEntries);
  expect(ids.sort(), 'golden ids vs unit ids').toEqual([...UNITS.map((u) => u.id)].sort());
});

test('every golden entry carries an explicit review status, and none claims approval', () => {
  for (const u of UNITS) {
    const e = loadedEntries[u.id]!;
    expect(e.status, `${u.id} golden status`).toBeOneOf(['provisional', 'approved']);
  }
  // mechanism honesty: this delivery marks every entry provisional —
  // flipping any entry to `approved` requires a captain-reviewed edit
  const statuses = new Set(Object.values(loadedEntries).map((e) => e.status));
  expect(
    statuses.has('approved'),
    `every entry must be provisional until the captain reviews its text`,
  ).toBe(false);
});

test('every pinned rendering matches the live generated output for its fixed input', () => {
  for (const u of UNITS) {
    const computed = renderDayReading(u.id);
    const pinned = loadedEntries[u.id];
    expect(pinned, `golden entry for ${u.id}`).toBeDefined();
    expect(computed, `${u.id} voice drift — copy changed without a reviewed re-pin (tests/golden/README.md)`).toEqual(pinned);
  }
});
