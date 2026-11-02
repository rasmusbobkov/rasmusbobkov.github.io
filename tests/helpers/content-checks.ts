/**
 * CONTENT GATE — the mechanical voice checks the captain asked for.
 *
 * "Sisu on toode. Praegu ei takista miski mehhaaniliselt halba lauset läbi
 * minemast." This module is the thing that mechanically stops a bad
 * sentence: banned promise/certainty/money/health vocabulary over every
 * app string, exact tier-2 shape, astrological containment, and word/
 * syllable bounds. Everything here is deterministic and offline: pure
 * regexes and counters over imported data — no model calls, no network,
 * no randomness.
 *
 * Every banned pattern carries an `example` that MUST match it: the test
 * suite proves each check actually fails on its own bait, so a check
 * without a failing case does not count as done.
 */
import fs from 'node:fs';
import path from 'node:path';

// ——— 1. banned vocabulary: promise, certainty, money and health claims ———

export interface BannedPattern {
  /** stable id, printed on a hit and used by the fails-on example test */
  readonly id: string;
  /** why this is banned, for the reviewer who sees the failure */
  readonly why: string;
  readonly re: RegExp;
  /** a synthetic sentence that MUST trip the pattern (test-proven) */
  readonly example: string;
}

/**
 * Promise and certainty language: the app speaks in tendencies and
 * choices, never in happenings or guarantees. `juhtub` / `õnnestub` /
 * `kindlasti` / `garanteeritud` are the named core; `saad` is only
 * banned in outcome-shaped constructions (`saad raha`, `saad edukaks`),
 * because today's copy legitimately uses `saad aru` (you realize) and
 * `saadad` (you send), which are not outcome promises. `ei õnnestunud`
 * is an honest failure note, not luck-promising, so the negated form is
 * exempted by lookbehind.
 */
export const BANNED_PROMISE: readonly BannedPattern[] = [
  {
    id: 'predict-juhtub',
    why: 'prediction that something happens — the story only states tendencies',
    re: /(?<![\p{L}\p{N}])(?:juhtub|juhtuvad)(?![\p{L}\p{N}])/iu,
    example: 'Juhtub nii, et täna juhtub midagi suurt, mida ei oska ära arvata.',
  },
  {
    id: 'predict-onnestub',
    why: "promised success ('õnnestub'); the honest failure notes 'ei õnnestunud' and 'ei õnnestu' stay allowed",
    re: /(?<!\bei\s)(?<![\p{L}\p{N}])õnnestu(?:b|d|nud)(?![\p{L}\p{N}])/iu,
    example: 'Täna õnnestub sul kõik, mida ette võtad.',
  },
  {
    id: 'certainty-kindlasti',
    why: "certainly ('kindlasti') — the voice never closes the day in advance",
    re: /(?<![\p{L}\p{N}])kindlasti(?![\p{L}\p{N}])/iu,
    example: 'Kindlasti tuleb vastus täna.',
  },
  {
    id: 'certainty-garanteeritud',
    why: "guaranteed outcome ('garanteeritud') — nothing about a day is guaranteed",
    re: /(?<![\p{L}\p{N}])garanteeri[a-zõäöü]*(?![\p{L}\p{N}])/iu,
    example: 'Tänane edu on garanteeritud.',
  },
  {
    id: 'certainty-paratamatult',
    why: "inevitably ('paratamatult') — the same certainty in an adverb wrapper",
    re: /(?<![\p{L}\p{N}])paratamatult(?![\p{L}\p{N}])/iu,
    example: 'See paratamatult muutub täna selgemaks.',
  },
  {
    id: 'promise-saad-outcome',
    why: "outcome-shaped 'saad' — attainment promised to the reader; 'saad aru' (perception) is not an outcome and stays allowed",
    re: /(?<![\p{L}\p{N}])saa(?:d|te)\s+(?:raha|edu|edukaks|rikkaks|kasu|tasu|õnne|võidu|hakkama)(?![\p{L}\p{N}])/iu,
    example: 'Nii saad raha ja edu täna.',
  },
  {
    id: 'promise-lubame',
    why: "the product promises ('lubame', 'luban', 'garanteerime') — a claim enters only through real review, never in copy; 'lubad' (the copy warns the reader against promising) stays allowed",
    re: /(?<![\p{L}\p{N}])(?:lubame|luban|garanteerime)(?![\p{L}\p{N}])/iu,
    example: 'Lubame sulle hea päeva.',
  },
  {
    id: 'promise-toob-sulle',
    why: "delivery promise to the reader ('toob sulle')",
    re: /(?<![\p{L}\p{N}])toob sulle(?![\p{L}\p{N}])/iu,
    example: 'See päev toob sulle edu.',
  },
];

/**
 * Money and health claims: a concrete benefit promised, not merely
 * named. Composed patterns only (`raha tuleb sinuni`, `haigus taandub`),
 * so that talking about money matters or the body at all stays possible.
 */
export const BANNED_CLAIMS: readonly BannedPattern[] = [
  {
    id: 'claim-money-arrives',
    why: 'money promised to arrive — no earned outcome is ever predicted',
    re: /(?<![\p{L}\p{N}])(?:raha|tulu|kasum)\s+(?:tuleb|voolab|saabub|lisandub)(?![\p{L}\p{N}])/iu,
    example: 'Raha tuleb täna sinuni.',
  },
  {
    id: 'claim-get-rich',
    why: "getting rich ('rikastud') — a wealth outcome promised",
    re: /(?<![\p{L}\p{N}])rikastu[a-zõäöü]*(?![\p{L}\p{N}])/iu,
    example: 'Täna rikastud ühe asjaga.',
  },
  {
    id: 'claim-win',
    why: "winning promised ('võidad') — pure outcome language",
    re: /(?<![\p{L}\p{N}])võida?d(?![\p{L}\p{N}])/iu,
    example: 'Täna võidad head tasu.',
  },
  {
    id: 'claim-health-improves',
    why: 'health outcome promised (a condition passes or health improves)',
    re: /(?<![\p{L}\p{N}])(?:haigus|valu|tervis)\s+(?:taandub|kadub|paraneb|paraneeb|taastub|väheneb)(?![\p{L}\p{N}])/iu,
    example: 'Haigus taandub täna.',
  },
  {
    id: 'claim-paraned',
    why: "healing promised ('paraned', 'paraneb') — the app never predicts the body",
    re: /(?<![\p{L}\p{N}])paran(?:ed|eb|ev)(?![a-zõäöü])/iu,
    example: 'Täna paraned su käsi.',
  },
  {
    id: 'claim-tervendad',
    why: "healing promised ('tervendad', 'tervendab') — the app never predicts the body",
    re: /(?<![\p{L}\p{N}])tervend(?:ad|ab|av)(?![a-zõäöü])/iu,
    example: 'Täna tervendad su liigesed.',
  },
  {
    id: 'claim-ravi-soovitame',
    why: 'medical advice issued by the product — never the app’s lane',
    re: /(?<![\p{L}\p{N}])soovitame\s+(?:ravi|ravida)(?![\p{L}\p{N}])/iu,
    example: 'Soovitame ravi hoopis homme alustada.',
  },
  {
    id: 'claim-diagnosis',
    why: 'diagnosis language — the body reading notices and names, it never diagnoses',
    re: /(?<![\p{L}\p{N}])diagnoos[a-zõäöüšž]*(?![\p{L}\p{N}])/iu,
    example: 'Diagnoosin täna sinu pinge ära.',
  },
];

export const BANNED_ALL: readonly BannedPattern[] = [...BANNED_PROMISE, ...BANNED_CLAIMS];

export interface BannedHit {
  readonly id: string;
  readonly why: string;
}

/** All banned patterns a string trips, with their ids. */
export function bannedOffenders(text: string): BannedHit[] {
  return BANNED_ALL.filter((p) => p.re.test(text)).map(({ id, why }) => ({ id, why }));
}

// ——— 2. tier-2 containment: no astrology at all in the story paragraphs ———

/** Every planet, sign, house, aspect name and everyday synonym of them,
 * matched by stem at Unicode letter boundaries (plain \b breaks on
 * Estonian vowels, which JS treats as non-word characters). Stems are
 * short on purpose: any everyday word beginning with one that is not
 * astrological must not appear in the story copy anyway, so a false
 * positive is also a copy bug worth flagging. */
const ASTRO_STEMS = [
  'päike', 'merkuur', 'veenus', 'marss', 'jupiter', 'saturn', 'uraan',
  'neptuun', 'pluuto', 'sõlm', 'tõusumärk', 'kuumärk', 'päikesemärk',
  'asendents', 'maja', 'jäär', 'sõnn', 'kaksik', 'vähk', 'lõvi', 'neitsi',
  'kaalud', 'kaalu', 'skorpion', 'ambur', 'kaljukits', 'veevalaja', 'kala',
  'ruut', 'ruud', 'trigoon', 'trigoo', 'sekstiil', 'vastasseis',
  'konjunktsioon', 'aspekt', 'orbiit', 'zodiak', 'sodiaak',
  // everyday synonyms of the same family: a heavenly body itself, a
  // constellation referred to as a star-shape, the horoscope family word
  'taevakeha', 'horoskoop', 'tähtkuju',
];

const ASTRO_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${ASTRO_STEMS.join('|')})[a-zõäöüšž]{0,7}(?![\\p{L}\\p{N}])`,
  'iu',
);

/** 'kuu' needs exact-form control: kuulub/kuulda/kuula are everyday
 * non-astrological words, so only the moon's own forms match. */
const ASTRO_KUU = /(?<![\p{L}\p{N}])kuu(?:d|s|l|le|led|des)?(?![\p{L}\p{N}])/iu;

export function astroOffenders(text: string): string[] {
  const offenders = new Set<string>();
  for (const m of text.matchAll(new RegExp(ASTRO_RE.source, 'giu'))) {
    offenders.add(m[1]!);
  }
  if (ASTRO_KUU.test(text)) offenders.add('kuu');
  return [...offenders];
}

// ——— 3. tier-1 aspect vocabulary: approved terms vs rejected synonyms ———

/**
 * The aspect vocabulary the board approved (catalogue header): ruut (not
 * "kvadraat", not "kvadratuur"), vastasseis (not "opositsioon"),
 * "trigoon" stays. konjunktsioon and sekstiil have no contested local
 * variants and are the standard forms for their aspects, so they stay in
 * the approved set. Tier-1 text (open/tight/action/pitfall/astroNote)
 * may name aspects only with these terms; a rejected synonym is a drift
 * the gate must catch.
 */
export const APPROVED_ASPECT_TERMS: readonly string[] = [
  'konjunktsioon', 'sekstiil', 'ruut', 'trigoon', 'vastasseis',
];

export const REJECTED_ASPECT_SYNONYMS: readonly BannedPattern[] = [
  {
    id: 'aspect-kvadratuur',
    why: "square drifts away from the approved term 'ruut'",
    re: /(?<![\p{L}\p{N}])kvadratuu?r[a-zõäöü]{0,3}(?![\p{L}\p{N}])/iu,
    example: 'Transiit teeb täna kvadratuuri.',
  },
  {
    id: 'aspect-kvadraat',
    why: "square named as 'kvadraat/kvadraadi' instead of the approved term 'ruut'",
    re: /(?<![\p{L}\p{N}])kvadraa[drt][a-zõäöü]{0,4}(?![\p{L}\p{N}])/iu,
    example: 'Transiit teeb täna kvadraadi.',
  },
  {
    id: 'aspect-opositsioon',
    why: "opposition named as 'opositsioon' instead of the approved term 'vastasseis'",
    re: /(?<![\p{L}\p{N}])opositsioon[a-zõäöü]{0,3}(?![\p{L}\p{N}])/iu,
    example: 'Transiit teeb täna opositsiooni.',
  },
];

export function tier1AspectOffenders(text: string): BannedHit[] {
  return REJECTED_ASPECT_SYNONYMS.filter((p) => p.re.test(text)).map(({ id, why }) => ({ id, why }));
}

// ——— 4. structure: four paragraphs, imperative closing, bounded length ———

/**
 * The imperative verbs the daily action may open with (2nd person
 * singular). Extending this list is a content decision: a new verb
 * enters only through review. The action passes when its first sentence
 * opens with one of these verbs, either directly or after a short
 * subordinate clause ('Enne kui täna midagi ostad, kirjuta numbrid
 * paberile').
 */
export const IMPERATIVE_VERBS: readonly string[] = [
  'võta', 'ütle', 'kirjuta', 'tee', 'alusta', 'proovi', 'küsi',
  'tühista', 'jäta', 'loe', 'hoia', 'mine', 'pane',
];

const IMPERATIVE_RE = new RegExp(
  `^(?:[^,\\n]{0,60},\\s*)?(${IMPERATIVE_VERBS.join('|')})\\b`,
  'iu',
);

/** True when the action's first sentence opens with an imperative from
 * the verb list (directly or after a subordinate clause). */
export function isImperative(text: string): boolean {
  return IMPERATIVE_RE.test(text.trim());
}

/**
 * Approximate Estonian syllable count: a run of vowels is one syllable.
 * Deliberately approximate, so the stated bounds carry enough headroom
 * for counting error and stay stable across wording touch-ups.
 */
export function countSyllables(text: string): number {
  return (text.toLowerCase().match(/[aeiouõäöü]+/g) ?? []).length;
}

/** Words per paragraph: whitespace-separated tokens. */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Stated bounds, measured against the reviewed corpus with headroom:
 * story paragraphs today span 8–45 words and 19–83 syllables.
 */
export const PARAGRAPH_WORD_BOUNDS = { min: 7, max: 50 } as const;
export const PARAGRAPH_SYLLABLE_BOUNDS = { min: 15, max: 95 } as const;

export interface LengthHit {
  readonly words: number;
  readonly syllables: number;
}

/** One paragraph outside the stated word or syllable bounds. */
export function lengthOffender(text: string): LengthHit | null {
  const words = countWords(text);
  const syllables = countSyllables(text);
  if (words < PARAGRAPH_WORD_BOUNDS.min || words > PARAGRAPH_WORD_BOUNDS.max) {
    return { words, syllables };
  }
  if (syllables < PARAGRAPH_SYLLABLE_BOUNDS.min || syllables > PARAGRAPH_SYLLABLE_BOUNDS.max) {
    return { words, syllables };
  }
  return null;
}

// ——— 5. provenance: hits report the file, the line and the exact string ———

export const CATALOGUE_FILE = 'src/messages/catalogue.ts';
export const MEANING_FILE = 'src/lib/meaning.ts';

/** Best-effort 1-based line of a needle inside a source file, so a hit
 * reports file, line and the exact string, not just the string. When
 * `fromLine` is given (1-based), only lines from there on are searched —
 * a needle that occurs in several tables (same key in et and en) is then
 * located in the table the hit came from. */
export function lineOf(
  root: string,
  file: string,
  needle: string,
  fromLine?: number,
): number | null {
  const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');
  const start = Math.max(0, (fromLine ?? 1) - 1);
  const idx = lines.findIndex((l, i) => i >= start && l.includes(needle));
  return idx === -1 ? null : idx + 1;
}
