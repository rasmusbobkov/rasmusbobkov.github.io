/**
 * MEANING LAYER — the single source both renderings read. Tested:
 *  - unit selection incl. the focus-area filter, the generic per-aspect
 *    fallback and the honest day states (unit present, story-not-written,
 *    quiet day);
 *  - the tier-2 guarantee: no planet, sign, house or aspect name ever
 *    appears in anything the story tier renders;
 *  - story structure: four paragraphs, closing with the action of the
 *    same unit (never a separate content set);
 *  - focus storage round-trip and validation.
 */
import { describe, expect, test, vi } from 'vitest';
import { MEANING_UNITS, QUIET_UNIT, hitMissesFocus, selectDayReading, type DayUnit } from '../src/lib/meaning';
import { FOCUS_AREAS, type AspectKind, type FocusArea } from '../src/lib/astro-constants';
import type { AspectParticipant, TransitBody, TransitHit } from '../src/lib/transits';
import { FOCUS_STORAGE_KEY, loadStoredFocus, saveStoredFocus, validateStoredFocus } from '../src/lib/storage';
import { rawMessages } from '../src/messages/catalogue';

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

const PINNED_AREAS = [
  'work',
  'relationships',
  'creative',
  'money',
  'home-family',
  'body-health',
] as const satisfies readonly FocusArea[];

test('the meaning table pins all six focus areas and ships both new domains at depth', () => {
  expect(FOCUS_AREAS).toEqual(PINNED_AREAS);
  expect(MEANING_UNITS.length).toBeGreaterThanOrEqual(30);
  const counts = new Map<FocusArea, number>();
  for (const u of MEANING_UNITS) {
    for (const f of u.focus) counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  for (const area of PINNED_AREAS) {
    expect(counts.get(area) ?? 0, `coverage of ${area}`).toBeGreaterThanOrEqual(1);
  }
  // the two domains added in this slice ship at the same depth as the
  // longest-served originals: at least six units each
  for (const area of ['home-family', 'body-health'] as const) {
    expect(counts.get(area) ?? 0, `depth of ${area}`).toBeGreaterThanOrEqual(6);
  }
});

test('every focus area has a setup label and hint in the catalogue', () => {
  const catalogue = rawMessages.et as Record<string, string>;
  for (const area of FOCUS_AREAS) {
    expect(catalogue[`focus.${area}`], `label for ${area}`).toBeTruthy();
    expect(catalogue[`focus.${area}.hint`], `hint for ${area}`).toBeTruthy();
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
  expect(r.unit!.id).toBe('any-opposition');
});

test('a shape whose specific units all fail the focus falls back to the generic shape unit', () => {
  // all specific sextile units belong to relationships; a money-focused
  // user must not get that story, and the day must not read as quiet —
  // the domain-free shape-generic sextile unit carries it instead
  const r = selectDayReading([hit('sun', 'sextile', 'sun')], ['money']);
  expect(r.quiet).toBe(false);
  expect(r.unit!.id).toBe('any-sextile');
});

test('every aspect kind has a shape-generic unit: an in-orb day is never quiet', () => {
  for (const aspect of ['conjunction', 'sextile', 'square', 'trine', 'opposition'] as const) {
    const r = selectDayReading([hit('sun', aspect, 'sun')], ['money']);
    expect(r.quiet, aspect).toBe(false);
    expect(r.hit, aspect).not.toBeNull();
    expect(r.unit!.aspect, aspect).toBe(aspect);
  }
});

test('no hits at all also reads as a quiet day', () => {
  const r = selectDayReading([], []);
  expect(r.quiet).toBe(true);
  expect(r.unit).toBe(QUIET_UNIT);
  expect(r.hit).toBeNull();
});

test('tightest orb wins when several hits have units', () => {
  // venus sextile (1°) vs jupiter trine (3°): the smaller orb must win
  const r = selectDayReading(
    [hit('jupiter', 'trine', 'sun', 3), hit('venus', 'sextile', 'moon', 1)],
    [],
  );
  expect(r.unit!.id).toBe('venus-sextile-relationships');
  expect(r.hit!.transitBody).toBe('venus');
});

test('the focus selection steers which unit is chosen', () => {
  // venus sextile against a natal moon could serve relationships or money;
  // the user chose relationships -> the relationship unit
  const r = selectDayReading([hit('venus', 'sextile', 'moon', 1)], ['relationships']);
  expect(r.unit!.id).toBe('venus-sextile-relationships');
});

test('home-family and body-health steer selection like the original four', () => {
  const home = selectDayReading([hit('mercury', 'trine', 'moon', 1)], ['home-family']);
  expect(home.unit!.id).toBe('mercury-trine-home-family');
  expect(home.unit!.focus).toContain('home-family');

  const body = selectDayReading([hit('mercury', 'conjunction', 'moon', 1)], ['body-health']);
  expect(body.unit!.id).toBe('mercury-conjunction-body-health');
  expect(body.unit!.focus).toContain('body-health');
});

test('a home unit does not win when only body-health is chosen', () => {
  // saturn square to a natal moon carries both home and body readings, but
  // the chosen body domain must not silently receive the home story
  const r = selectDayReading([hit('saturn', 'square', 'moon', 1)], ['body-health']);
  expect(r.unit!.id).toBe('any-square');
});

test('units bound to a focus area the user did not choose do not win', () => {
  // saturn conjunction to a natal sun serves work only; a user focused on
  // money must not get the work story — the shape-generic unit carries
  // the day instead, never a false "nothing is in orb"
  const r = selectDayReading([hit('saturn', 'conjunction', 'sun')], ['money']);
  expect(r.quiet).toBe(false);
  expect(r.unit!.id).toBe('any-conjunction');
});

test('skipping the setup steers nothing: empty focus accepts any domain', () => {
  const r = selectDayReading([hit('saturn', 'conjunction', 'mc', 1)], []);
  expect(r.quiet).toBe(false);
  expect(r.unit!.id).toBe('saturn-conjunction-work');
});

test('a hit outside every chosen focus area is reported as outside focus', () => {
  // saturn to the natal sun speaks work only; a money-focused reader must
  // be told the day is not about their choice instead of sold the work story
  const h = hit('saturn', 'conjunction', 'sun');
  expect(hitMissesFocus(h, ['money'])).toBe(true);
  expect(hitMissesFocus(h, ['work'])).toBe(false);
  expect(hitMissesFocus(h, ['money', 'work'])).toBe(false);
});

test('skipping the setup never reports a day outside focus', () => {
  expect(hitMissesFocus(hit('saturn', 'square', 'sun'), [])).toBe(false);
});

test('an in-focus hit wins even when a tighter hit misses the chosen area', () => {
  // the shipped promise is that a day touching a chosen area speaks to it,
  // so the tighter saturn square (work only) must not swallow the day when
  // a looser venus sextile carries the reader's relationships focus
  const hits = [hit('saturn', 'square', 'sun', 1), hit('venus', 'sextile', 'moon', 2)];
  const r = selectDayReading(hits, ['relationships']);
  expect(r.unit!.id).toBe('venus-sextile-relationships');
  expect(r.hit!.transitBody).toBe('venus');
  expect(hitMissesFocus(r.hit!, ['relationships'])).toBe(false);
});

test('no in-focus hit in orb: the tightest global hit carries the out-of-focus day', () => {
  const hits = [hit('saturn', 'square', 'sun', 1), hit('venus', 'sextile', 'moon', 2)];
  const r = selectDayReading(hits, ['money']);
  expect(r.hit!.transitBody).toBe('saturn');
  expect(r.unit!.id).toBe('any-square');
  expect(hitMissesFocus(r.hit!, ['money'])).toBe(true);
});

test('the same sky always picks the same story (deterministic)', () => {
  const hits = [hit('venus', 'sextile', 'moon', 1), hit('jupiter', 'trine', 'sun', 2)];
  const once = selectDayReading(hits, []);
  const twice = selectDayReading(hits, []);
  expect(once.unit!.id).toBe(twice.unit!.id);
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

test('focus storage round-trips both new ids and keeps pre-change records valid', () => {
  const memory = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => { memory.set(key, value); },
    removeItem: (key: string) => { memory.delete(key); },
  });
  try {
    saveStoredFocus({ schemaVersion: 1, areas: ['home-family', 'body-health'], skipped: false });
    expect(loadStoredFocus()).toEqual({
      schemaVersion: 1,
      areas: ['home-family', 'body-health'],
      skipped: false,
    });

    // a record written before the two new areas existed still validates
    memory.set(FOCUS_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      areas: ['work', 'relationships'],
      skipped: false,
    }));
    expect(loadStoredFocus()).toEqual({
      schemaVersion: 1,
      areas: ['work', 'relationships'],
      skipped: false,
    });
  } finally {
    vi.unstubAllGlobals();
  }
});
