/**
 * CONTENT GATE — mechanism over voice, per the captain's ask: the app
 * itself must stop a bad sentence.
 *
 * Everything runs inside `npm test`, deterministic and offline:
 *  1. banned vocabulary (promise/certainty language incl. `juhtub`,
 *     `õnnestub`, `kindlasti`, `garanteeritud` and outcome-shaped `saad`,
 *     plus money and health claim patterns) over every string — the whole
 *     catalogue (both languages), every generated composite the app can
 *     interpolate, and every meaning-unit field. A hit fails with the
 *     file, the line and the exact string.
 *  2. structure: a tier-2 story is exactly four paragraphs, its last one
 *     closes with the unit's action, the action is imperative (checked
 *     against a verb list), paragraphs stay inside the stated bounds.
 *  3. containment: tier-2 text carries no planet, sign, house or aspect
 *     name nor their everyday synonyms; tier-1 names aspects only in the
 *     approved terms and rejects kvadratuur/kvadraat/opositsioon.
 *  4. length and readability: word and syllable bounds per paragraph.
 *
 * Every trip wire is also proven to trip: each banned pattern ships a
 * failing example, and the structural checks get their own negative
 * cases. A check with no failing case does not count as done.
 */
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  BANNED_ALL,
  CATALOGUE_FILE,
  MEANING_FILE,
  PARAGRAPH_SYLLABLE_BOUNDS,
  PARAGRAPH_WORD_BOUNDS,
  REJECTED_ASPECT_SYNONYMS,
  APPROVED_ASPECT_TERMS,
  IMPERATIVE_VERBS,
  bannedOffenders,
  countSyllables,
  countWords,
  isImperative,
  lengthOffender,
  astroOffenders,
  tier1AspectOffenders,
  lineOf,
} from './helpers/content-checks';
import { DEFAULT_LANG, fmt, rawMessages, t } from '../src/messages/catalogue';
import type { MessageKey } from '../src/messages/catalogue';
import { MEANING_UNITS, QUIET_UNIT } from '../src/lib/meaning';
import type { DayUnit } from '../src/lib/meaning';
import type { AspectKind } from '../src/lib/astro-constants';

const ROOT = path.resolve(import.meta.dirname, '..');

const ET = rawMessages.et;
const EN = rawMessages.en;

// ——— the strings the app can ever show ———

/** All catalogue strings, both languages: [lang, key, text]. */
function allCatalogueStrings(): { lang: 'et' | 'en'; key: string; text: string }[] {
  return [
    ...Object.entries(ET).map(([key, text]) => ({ lang: 'et' as const, key, text })),
    ...Object.entries(EN)
      .filter(([, text]) => text != null)
      .map(([key, text]) => ({ lang: 'en' as const, key: `${key}`, text: text as string })),
  ];
}

/** Generated composites: the catalogue interpolates variables into some
 * strings; scan the rendered result, so a banned phrase cannot slip
 * through a word glued to a variable. */
function generatedComposites(): { key: string; text: string }[] {
  return Object.entries(ET).map(([key, text]) => {
    const vars: Record<string, string> = {};
    for (const name of text.matchAll(/\{(\w+)\}/g)) vars[name[1]!] = 'X';
    return { key, text: fmt(DEFAULT_LANG, key as MessageKey, vars) };
  });
}

/** Every content field of every day unit: [unit, key, text]. */
function allUnitFields(): { unit: string; key: string; text: string }[] {
  const out: { unit: string; key: string; text: string }[] = [];
  for (const u of [...MEANING_UNITS, QUIET_UNIT] as readonly DayUnit[]) {
    const fields: [string, string][] = [
      ['open', u.open],
      ['tight', u.tight],
      ['action', u.action],
      ['pitfall', u.pitfall],
      ['astroNote', u.astroNote],
      ['story.situation', u.story.situation],
      ['story.turn', u.story.turn],
      ['story.climax', u.story.climax],
      ['story.meaning', u.story.meaning],
    ];
    for (const [key, text] of fields) out.push({ unit: u.id, key, text });
  }
  return out;
}

// ——— 1. banned vocabulary ———

describe('banned vocabulary proven on bait: every pattern fails on its own example', () => {
  for (const pattern of BANNED_ALL) {
    test(`${pattern.id} — ${pattern.why}`, () => {
      const offenders = bannedOffenders(pattern.example);
      expect(offenders.map((h) => h.id), `bait must trip: ${pattern.example}`).toContain(
        pattern.id,
      );
    });
  }
});

describe('banned vocabulary: the shipped voice is clean', () => {
  test('the whole catalogue (et + en) is free of banned vocabulary', () => {
    // the en table repeats et keys, so an en hit must be located after
    // `const en`, not at its Estonian twin
    const enTableLine = lineOf(ROOT, CATALOGUE_FILE, 'const en') ?? 1;
    const dirty = allCatalogueStrings()
      .filter((s) => bannedOffenders(s.text).length > 0)
      .map(
        (s) =>
          `${CATALOGUE_FILE}:${
            lineOf(ROOT, CATALOGUE_FILE, `'${s.key}':`, s.lang === 'en' ? enTableLine : 1) ?? '?'
          } [${s.key}] ${s.text}`,
      );
    expect(dirty, 'banned vocabulary found in catalogue').toEqual([]);
  });

  test('every generated composite interpolates to banned-free text', () => {
    const dirty = generatedComposites()
      .filter((s) => bannedOffenders(s.text).length > 0)
      .map((s) => `${CATALOGUE_FILE} [generated ${s.key}] ${s.text}`);
    expect(dirty, 'banned vocabulary found in generated composites').toEqual([]);
  });

  test('every meaning-unit field is free of banned vocabulary', () => {
    const dirty = allUnitFields()
      .filter((s) => bannedOffenders(s.text).length > 0)
      .map(
        (s) =>
          `${MEANING_FILE}:${lineOf(ROOT, MEANING_FILE, `id: '${s.unit}'`) ?? '?'} [${s.unit}.${s.key}] ${s.text}`,
      );
    expect(dirty, 'banned vocabulary found in meaning units').toEqual([]);
  });

  test('allowed near-miss language stays allowed: honest failure and perception talk', () => {
    // the corpus MUST keep using these: if the gate one day catches them,
    // an exemption lookbehind broke, not the copy
    for (const fine of [
      'Tänast päeva ei õnnestunud arvutada. Proovi lehte värskendada.', // honest failure note
      'Kiirendada lähedust, mis ise ei liigu, ei õnnestu.', // stated denying, not promising
      'Õhtul saad aru, et vaikus polnud kellegi süü.', // saad aru = perception
      'Enne kui täna midagi suuremat ostad või lubad, kirjuta numbrid paberile.', // the copy warns against promising
      'Raha ja kindlus.', // naming the money theme is fine
      'Töö ja keha igapäevaselt.', // naming the body is fine
    ]) {
      expect(bannedOffenders(fine), fine).toEqual([]);
    }
  });
});

// ——— 2. structure: exactly four paragraphs, imperative close ———

const STORY_KEYS = ['situation', 'turn', 'climax', 'meaning'] as const;

const allUnits: readonly DayUnit[] = [...MEANING_UNITS, QUIET_UNIT];

describe('tier-2 story structure', () => {
  for (const u of allUnits) {
    test(`[${u.id}] is exactly four paragraphs`, () => {
      expect(
        Object.keys(u.story).sort(),
        'the story carries exactly the four paragraphs',
      ).toEqual([...STORY_KEYS].sort());
      for (const key of STORY_KEYS) {
        const paragraph = u.story[key];
        expect(paragraph, `${u.id}.${key} must be a non-empty paragraph`).toBeTruthy();
        expect(
          paragraph.includes('\n') || paragraph.includes('\r'),
          `${u.id}.${key}: a paragraph is one paragraph — no newlines inside`,
        ).toBe(false);
      }
    });

    test(`[${u.id}] closes with the unit's own imperative action`, () => {
      expect(
        u.story.meaning.endsWith(u.action),
        `${u.id}: the last paragraph must close with the unit's action verbatim — never a separate content set`,
      ).toBe(true);
      expect(
        isImperative(u.action),
        `${u.id}: the action must open with an imperative verb (${IMPERATIVE_VERBS.join(', ')}): ${u.action}`,
      ).toBe(true);
    });

    for (const key of STORY_KEYS) {
      test(`[${u.id}] ${key} stays within the stated word and syllable bounds`, () => {
        const text = u.story[key];
        const words = countWords(text);
        const syllables = countSyllables(text);
        expect(words, `${u.id}.${key} word count`).toBeGreaterThanOrEqual(PARAGRAPH_WORD_BOUNDS.min);
        expect(words, `${u.id}.${key} word count`).toBeLessThanOrEqual(PARAGRAPH_WORD_BOUNDS.max);
        expect(syllables, `${u.id}.${key} syllable count`).toBeGreaterThanOrEqual(
          PARAGRAPH_SYLLABLE_BOUNDS.min,
        );
        expect(syllables, `${u.id}.${key} syllable count`).toBeLessThanOrEqual(
          PARAGRAPH_SYLLABLE_BOUNDS.max,
        );
        expect(lengthOffender(text), `${u.id}.${key}: paragraph outside the stated bounds`).toBeNull();
      });
    }
  }

  // negative cases: every structural check must fail on its own bait
  test('a non-imperative closing action fails the gate', () => {
    expect(isImperative('Täna on hea päev, kus kõik liigub ise.')).toBe(false);
    expect(isImperative('Päev algab raskemana.')).toBe(false);
  });

  test('an imperative after a subordinate clause passes the gate', () => {
    expect(
      isImperative('Enne kui täna midagi suuremat ostad või lubad, kirjuta numbrid paberile.'),
    ).toBe(true);
    expect(isImperative('Kui täna miski kihutab vastu, tee ise üks käeline tööots tükk ära.')).toBe(
      true,
    );
  });

  test('an unknown imperative verb fails the gate (the verb list is the approved set)', () => {
    expect(isImperative('Naudi täna päeva.')).toBe(false);
  });

  test('paragraph length bounds fail on under- and overlong bait', () => {
    expect(lengthOffender('Lühike.')!.words).toBeLessThan(PARAGRAPH_WORD_BOUNDS.min);
    const long = `Lause ${'sõna sõna sõna sõna sõna sõna sõna sõna '.repeat(12)}lõpeb.`;
    expect(lengthOffender(long)!.words).toBeGreaterThan(PARAGRAPH_WORD_BOUNDS.max);
  });
});

// ——— 3. containment ———

describe('tier-2 containment: no astrology anywhere in the story paragraphs', () => {
  for (const u of allUnits) {
    test(`[${u.id}] the four paragraphs name no planet, sign, house or aspect (nor synonyms)`, () => {
      for (const key of STORY_KEYS) {
        const bad = astroOffenders(u.story[key]);
        expect(bad, `${u.id}.${key} -> ${bad.join('; ')}`).toEqual([]);
      }
    });
  }
  test('the gate itself fails on astrological vocabulary and its everyday synonyms', () => {
    for (const bait of [
      'Päike ootab täna.', // planet
      'Merkuur teeb täna oma pöörde.', // planet
      'Täna teeb taevas ruudu.', // aspect
      'Kaksteist majad on avatud.', // house
      'Üks taevakeha puudutab sind.', // planet synonym
      'Selle tähtkuju uks on lahti.', // sign synonym
      'Loe oma horoskoopi.', // the reserved sun-sign word
      'See on sinu sodiaak.', // zodiac synonym
    ]) {
      expect(astroOffenders(bait), `bait must trip: ${bait}`).not.toEqual([]);
    }
  });
  test('everyday non-astrological words stay allowed (stem control)', () => {
    // kuulub is plain speech, not the Moon; if these ever trip, a stem
    // overreached — fix the list, not the copy
    expect(astroOffenders('Ohutu päev, kus miski ei kuulub kellegile.')).toEqual([]);
    expect(astroOffenders('Sel päeval on su ruum rahulik ja aknad avatud.')).toEqual([]);
    expect(astroOffenders('Kõik asjad liiguvad täna kergemini.')).toEqual([]);
  });
});

describe('tier-1 aspect vocabulary: approved terms only', () => {
  // the catalogue must name the five aspects exactly in the approved terms
  const EXPECTED_TERM: Record<AspectKind, string> = {
    conjunction: 'konjunktsioon',
    sextile: 'sekstiil',
    square: 'ruut',
    trine: 'trigoon',
    opposition: 'vastasseis',
  };
  for (const kind of Object.keys(EXPECTED_TERM) as AspectKind[]) {
    test(`the catalogue's aspect name for ${kind} stays the approved term`, () => {
      const rendered = t(DEFAULT_LANG, ('aspect.' + kind) as MessageKey);
      expect(rendered, `aspect.${kind}`).toBe(EXPECTED_TERM[kind]);
      expect(APPROVED_ASPECT_TERMS, 'the term is in the approved set').toContain(
        EXPECTED_TERM[kind],
      );
    });
  }

  // tier-1 fields reject the drifted synonyms
  for (const u of MEANING_UNITS) {
    test(`[${u.id}] tier-1 fields carry no rejected aspect synonym`, () => {
      for (const key of ['open', 'tight', 'action', 'pitfall', 'astroNote'] as const) {
        const bad = tier1AspectOffenders(u[key]);
        expect(bad, `${u.id}.${key} -> ${bad.map((h) => h.id).join('; ')}`).toEqual([]);
      }
    });
  }

  test('the tier-1 check itself fails on kvadratuur and opositsioon', () => {
    for (const pattern of REJECTED_ASPECT_SYNONYMS) {
      expect(
        tier1AspectOffenders(pattern.example).some((h) => h.id === pattern.id),
        `bait must trip: ${pattern.example}`,
      ).toBe(true);
    }
    expect(tier1AspectOffenders('Transiit teeb täna vastasseisi.')).toEqual([]);
  });
});

// ——— diagnostics hygiene ———

test('the hit provenance locator points at the real line of the banned string', () => {
  const line = lineOf(ROOT, CATALOGUE_FILE, `'form.date.placeholder':`);
  expect(line, 'catalogue.ts line of form.date.placeholder').not.toBeNull();
  expect(line!).toBeGreaterThan(1);
});

test('the hit provenance locator lands in the table the hit came from', () => {
  // 'chart.planetsHeading' is declared in both tables; searching from the
  // en table's start must skip its Estonian twin and hit the en line
  const etLine = lineOf(ROOT, CATALOGUE_FILE, `'chart.planetsHeading':`);
  const enTableLine = lineOf(ROOT, CATALOGUE_FILE, 'const en') ?? 1;
  const enLine = lineOf(ROOT, CATALOGUE_FILE, `'chart.planetsHeading':`, enTableLine);
  expect(etLine, 'et declaration').not.toBeNull();
  expect(enLine, 'en declaration').not.toBeNull();
  expect(enTableLine).toBeGreaterThan(etLine!);
  expect(enLine!).toBeGreaterThan(enTableLine);
  expect(enLine!).toBeGreaterThan(etLine!);
});
