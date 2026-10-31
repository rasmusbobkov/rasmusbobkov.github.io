/**
 * MEANING LAYER — the single source both renderings read. Tested:
 *  - unit selection incl. the focus-area filter and the honest no-match
 *    fallback (the quiet day);
 *  - the tier-2 guarantee: no planet, sign, house or aspect name ever
 *    appears in anything the story tier renders;
 *  - story structure: four paragraphs, closing with the action of the
 *    same unit (never a separate content set);
 *  - focus storage round-trip and validation.
 */
import { describe, expect, test } from 'vitest';
import { MEANING_UNITS, QUIET_UNIT, selectDayReading, type DayUnit } from '../src/lib/meaning';
import type { AspectKind, FocusArea } from '../src/lib/astro-constants';
import type { AspectParticipant, TransitBody, TransitHit } from '../src/lib/transits';
import { validateStoredFocus } from '../src/lib/storage';

// a hit factory without ephemeris values: selection never reads longitudes
function hit(transitBody: TransitBody, aspect: AspectKind, target: AspectParticipant, orb = 2): TransitHit {
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

// ——— content structure ———

test('the meaning table has at least twelve units covering all four focus areas', () => {
  expect(MEANING_UNITS.length).toBeGreaterThanOrEqual(12);
  const touches = new Set<FocusArea>();
  for (const u of MEANING_UNITS) for (const f of u.focus) touches.add(f);
  for (const f of ['work', 'relationships', 'creative', 'money'] as const) {
    expect(touches.has(f), `coverage of ${f}`).toBe(true);
  }
});

describe('units are internally consistent', () => {
  for (const u of MEANING_UNITS) {
    test(`[${u.id}] story has four paragraphs and closes with the unit's action`, () => {
      expect(u.story.situation.length).toBeGreaterThan(10);
      expect(u.story.turn.length).toBeGreaterThan(10);
      expect(u.story.climax.length).toBeGreaterThan(10);
      expect(u.story.meaning).toContain(u.action);
    });
    test(`[${u.id}] carries open, tight, action and the astrology behind it`, () => {
      expect(u.open.length).toBeGreaterThan(10);
      expect(u.tight.length).toBeGreaterThan(10);
      expect(u.action.length).toBeGreaterThan(10);
      expect(u.pitfall.length).toBeGreaterThan(10);
      expect(u.astroNote.length).toBeGreaterThan(10);
    });
  }
});

// ——— the tier-2 guarantee: no astrological names in story text ———

/** Every planet, sign, house and aspect name the app can render, matched
 * by stem at Unicode letter boundaries (plain \b breaks on Estonian
 * vowels, which JS treats as non-word characters). Stems are short on
 * purpose: any everyday word beginning with one that is not astrological
 * must not appear in the story copy anyway, so a false positive is also a
 * copy bug worth flagging. */
const ASTRO_WORDS: RegExp[] = [
  // 'kuu' needs exact-form control: kuulub/kuulda/kuula are everyday
  // non-astrological words, so only the moon's own forms match
  ...['päike', 'merkuur', 'veenus', 'marss', 'jupiter', 'saturn', 'uraan',
    'neptuun', 'pluuto', 'sõlm', 'tõusumärk', 'kuumärk', 'päikesemärk',
    'asendents', 'maja', 'jäär', 'sõnn', 'kaksik', 'vähk', 'lõvi', 'neitsi',
    'kaalud', 'kaalu', 'skorpion', 'ambur', 'kaljukits', 'veevalaja', 'kala',
    'ruut', 'trigoon', 'sekstiil', 'vastasseis', 'konjunktsioon', 'aspekt',
    'orbiit', 'zodiak',
  ].map((stem) => new RegExp(
    `(?<![\\p{L}\\p{N}])${stem}[a-zõäöüšž]{0,7}(?![\\p{L}\\p{N}])`,
    'iu',
  )),
  /(?<![\p{L}\p{N}])kuu(?:d|s|l|le|led|des)?(?![\p{L}\p{N}])/iu,
];

function astroFreeOffenders(text: string): string[] {
  return ASTRO_WORDS
    .filter((re) => re.test(text))
    .map((re) => re.source);
}

describe('story tier carries no astrology vocabulary', () => {
  const all: { unit: DayUnit; fields: string[] }[] = [
    ...MEANING_UNITS.map((u) => ({ unit: u, fields: [u.open, u.tight, u.action, u.pitfall, u.story.situation, u.story.turn, u.story.climax, u.story.meaning] })),
    { unit: QUIET_UNIT, fields: [QUIET_UNIT.action, QUIET_UNIT.story.situation, QUIET_UNIT.story.turn, QUIET_UNIT.story.climax, QUIET_UNIT.story.meaning] },
  ];
  for (const { unit, fields } of all) {
    test(`[${unit.id}] story fields contain no planet, sign, house or aspect name`, () => {
      for (const field of fields) {
        const bad = astroFreeOffenders(field);
        expect(bad, `${unit.id}: ${field} -> ${bad.join('; ')}`).toEqual([]);
      }
    });
  }
  test('the tier renders only story content: story paragraphs exist', () => {
    for (const u of MEANING_UNITS) {
      expect(u.story.situation).toBeTruthy();
      expect(u.story.turn).toBeTruthy();
      expect(u.story.climax).toBeTruthy();
      expect(u.story.meaning).toBeTruthy();
    }
  });
});

// ——— selection incl. focus filter and the quiet fallback ———

test('a transit shape whose body has no unit falls back to the generic tone unit', () => {
  const r = selectDayReading([hit('uranus', 'opposition', 'mc')], []);
  expect(r.quiet).toBe(false);
  expect(r.unit.id).toBe('any-opposition');
});

test('a transit shape with no unit at all falls back to the honest quiet unit', () => {
  const r = selectDayReading([hit('sun', 'square', 'sun')], []);
  expect(r.quiet).toBe(true);
  expect(r.unit).toBe(QUIET_UNIT);
  expect(r.hit).toBeNull();
});

test('no hits at all also reads as a quiet day', () => {
  const r = selectDayReading([], []);
  expect(r.quiet).toBe(true);
  expect(r.unit).toBe(QUIET_UNIT);
});

test('tightest orb wins when several hits have units', () => {
  // venus sextile (1°) vs jupiter trine (3°): the smaller orb must win
  const r = selectDayReading(
    [hit('jupiter', 'trine', 'sun', 3), hit('venus', 'sextile', 'moon', 1)],
    [],
  );
  expect(r.unit.id).toBe('venus-sextile-relationships');
  expect(r.hit!.transitBody).toBe('venus');
});

test('the focus selection steers which unit is chosen', () => {
  // venus sextile against a natal moon could serve relationships or money;
  // the user chose relationships -> the relationship unit
  const r = selectDayReading([hit('venus', 'sextile', 'moon', 1)], ['relationships']);
  expect(r.unit.id).toBe('venus-sextile-relationships');
});

test('units bound to a focus area the user did not choose do not win', () => {
  // saturn conjunction to a natal sun serves work only;
  // a user focused on money gets the quiet fallback, not the wrong story
  const r = selectDayReading([hit('saturn', 'conjunction', 'sun')], ['money']);
  expect(r.quiet).toBe(true);
});

test('skipping the setup steers nothing: empty focus accepts any domain', () => {
  const r = selectDayReading([hit('saturn', 'conjunction', 'mc', 1)], []);
  expect(r.quiet).toBe(false);
  expect(r.unit.id).toBe('saturn-conjunction-work');
});

test('the same sky always picks the same story (deterministic)', () => {
  const hits = [hit('venus', 'sextile', 'moon', 1), hit('jupiter', 'trine', 'sun', 2)];
  const once = selectDayReading(hits, []);
  const twice = selectDayReading(hits, []);
  expect(once.unit.id).toBe(twice.unit.id);
  expect(once.hit).toEqual(twice.hit);
});

// ——— focus storage ———

test('focus storage validates, deduplicates and caps at three', () => {
  expect(validateStoredFocus({ schemaVersion: 1, areas: ['work', 'relationships', 'creative', 'money'], skipped: false })).toBeNull();
  expect(validateStoredFocus({ schemaVersion: 1, areas: ['work', 'work'], skipped: false })!.areas).toEqual(['work']);
  expect(validateStoredFocus({ schemaVersion: 1, areas: [], skipped: true })).not.toBeNull();
  expect(validateStoredFocus({ schemaVersion: 1, areas: ['work'], skipped: true })).toBeNull();
  expect(validateStoredFocus({ schemaVersion: 1, areas: ['nope'], skipped: false })).toBeNull();
  expect(validateStoredFocus({ schemaVersion: 2, areas: [], skipped: true })).toBeNull();
});
