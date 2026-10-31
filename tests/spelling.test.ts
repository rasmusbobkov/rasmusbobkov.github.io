/**
 * ESTONIAN SPELLCHECK — the spelling gate over every user-facing word.
 *
 * What this test owns: the check itself (committed et_EE hunspell
 * dictionary, wasm, offline — see helpers/spellcheck.ts), the reviewed
 * allowlist (tests/spelling/allowlist.txt, one word per line, each with
 * a reason), and the corpus: the catalogue (both languages), every
 * meaning-unit field and the golden day readings. A misspelled word
 * fails with the file, the exact string and the offending word.
 *
 * Every trip wire is proven: one misspelling that actually shipped is
 * kept as a bait ('ütleda' — the real form is 'ütelda') and the suite
 * asserts a deliberate misspelling fails, so a check that silently
 * checks nothing cannot sneak in.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  loadEtChecker,
  parseAllowlist,
  tokenize,
  offenderMessage,
  checkText,
} from './helpers/spellcheck';
import type { Offender, TextRef } from './helpers/spellcheck';
import { rawMessages } from '../src/messages/catalogue';
import { MEANING_UNITS, QUIET_UNIT } from '../src/lib/meaning';
import type { DayUnit } from '../src/lib/meaning';

const ROOT = path.resolve(import.meta.dirname, '..');
const CATALOGUE_FILE = path.join(ROOT, 'src', 'messages', 'catalogue.ts');
const MEANING_FILE = path.join(ROOT, 'src', 'lib', 'meaning.ts');
const GOLDEN_FILE = path.join(ROOT, 'tests', 'golden', 'day-readings.json');
const ALLOWLIST_FILE = path.join(ROOT, 'tests', 'spelling', 'allowlist.txt');

// ——— the strings the user can ever read ———

/** The catalogue, both languages: et fully, en for the keys the
 * language switch keeps answering with until the translation ships. */
function allCatalogueStrings(): TextRef[] {
  const refs: TextRef[] = [];
  for (const [key, text] of Object.entries(rawMessages.et)) {
    refs.push({ file: CATALOGUE_FILE, id: `et:${key}`, text });
  }
  for (const [key, text] of Object.entries(rawMessages.en)) {
    if (text == null) continue;
    refs.push({ file: CATALOGUE_FILE, id: `en:${key}`, text });
  }
  return refs;
}

/** Every content field of every day unit, the shipped reading copy. */
function allUnitStrings(): TextRef[] {
  const units: readonly DayUnit[] = [...MEANING_UNITS, QUIET_UNIT];
  const refs: TextRef[] = [];
  for (const unit of units) {
    const fields: [string, string][] = [
      ['open', unit.open],
      ['tight', unit.tight],
      ['action', unit.action],
      ['pitfall', unit.pitfall],
      ['astroNote', unit.astroNote],
      ['story.situation', unit.story.situation],
      ['story.turn', unit.story.turn],
      ['story.climax', unit.story.climax],
      ['story.meaning', unit.story.meaning],
    ];
    for (const [field, text] of fields) {
      refs.push({ file: MEANING_FILE, id: `${unit.id}.${field}`, text });
    }
  }
  return refs;
}

/** The golden day readings: the pinned copy the captain reads first. */
function allGoldenStrings(): TextRef[] {
  const doc = JSON.parse(
    fs
      .readFileSync(GOLDEN_FILE, 'utf8')
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('//'))
      .join('\n'),
  ) as { entries: Record<string, { story: string[]; plain?: Record<string, string>; note?: string }> };
  const refs: TextRef[] = [];
  for (const [id, entry] of Object.entries(doc.entries)) {
    entry.story.forEach((text, i) => refs.push({ file: GOLDEN_FILE, id: `${id}.story[${i}]`, text }));
    for (const [field, text] of Object.entries(entry.plain ?? {})) {
      refs.push({ file: GOLDEN_FILE, id: `${id}.${field}`, text });
    }
    if (entry.note) refs.push({ file: GOLDEN_FILE, id: `${id}.note`, text: entry.note });
  }
  return refs;
}

// ——— one checker for the whole file, loaded once ———

const checker = await loadEtChecker();
const corpus: readonly TextRef[] = [
  ...allCatalogueStrings(),
  ...allUnitStrings(),
  ...allGoldenStrings(),
];

describe('estonian spellcheck corpus', () => {
  test('every catalogue string, meaning unit and golden reading is spelt correctly', () => {
    const offenders = corpus.flatMap((ref) => checkText(ref.text, checker, ref));
    const report = offenders.map(offenderMessage).join('\n');
    expect(
      offenders,
      report || undefined,
    ).toEqual([]);
  });

  test('a deliberately misspelled word fails with the file, the string and the word', () => {
    // 'ütleda' really shipped once (the correct form is 'ütelda');
    // keeping it as the bait proves the gate trips on the exact class
    // of bug yesterday's human reviewer caught by slow reading.
    const ref: TextRef = {
      file: CATALOGUE_FILE,
      id: 'spellcheck-bait',
      text: 'Täna on hea hetk ütleda, mida suhtes ootad.',
    };
    const offenders: Offender[] = checkText(ref.text, checker, ref);
    expect(offenders.length).toBe(1);
    const message = offenderMessage(offenders[0]!);
    expect(message).toContain(path.relative(ROOT, CATALOGUE_FILE)); // the file
    expect(message).toContain(ref.text); // the string
    expect(message).toContain('ütleda'); // the offending word
    // and the fixed copy passes the same check
    expect(checkText(ref.text.replace('ütleda', 'ütelda'), checker, ref)).toEqual([]);
  });

  test('a deviation in a meaning unit fails in the meaning file', () => {
    const ref: TextRef = {
      file: MEANING_FILE,
      id: 'spellcheck-bait.meaning',
      text: 'Uued algused kipuvad täna kinni jääma: uks, mida lükkad, sulgub vaikselt tagassi.',
    };
    const offenders = checkText(ref.text, checker, ref);
    expect(offenders.map((o) => o.word)).toEqual(['tagassi']);
    expect(offenderMessage(offenders[0]!)).toContain(path.relative(ROOT, MEANING_FILE));
  });

  // Regression guard against a future dictionary/corpus change making the suite slow, not a performance target.
  test('the whole corpus check finishes in well under ten seconds', () => {
    const started = Date.now();
    for (const ref of corpus) checkText(ref.text, checker, ref);
    expect(Date.now() - started).toBeLessThan(10_000);
  });
});

describe('the allowlist stays reviewed', () => {
  const entries = parseAllowlist(fs.readFileSync(ALLOWLIST_FILE, 'utf8'));

  test('every accepted word carries a reason and appears once', () => {
    expect(entries.length).toBeGreaterThan(0);
    // parseAllowlist throws on a missing reason or a duplicate; one
    // assertion ties those rules to the suite itself.
    for (const { word, reason } of entries) {
      expect(word.length, JSON.stringify(word)).toBeGreaterThan(0);
      expect(reason.length, word).toBeGreaterThan(0);
    }
  });

  test('no allowlisted word hides inside the corpus unknown list', () => {
    // The corpus test above passing guarantees the corpus is clean;
    // here we pin the inverse: every allowlisted word is either in the
    // dictionary anyway or referenced by the corpus — no speculative
    // bulk additions.
    const corpusWords = new Set(
      corpus.flatMap((r) => tokenize(r.text).map((t) => t.word.toLowerCase())),
    );
    for (const { word } of entries) {
      if (checker.correct(word)) continue;
      expect(
        corpusWords.has(word.toLowerCase()),
        `allowlisted word "${word}" is neither a dictionary word nor in the corpus — why is it accepted?`,
      ).toBe(true);
    }
  });
});

// ——— proven-off misspellings that once shipped ———
// 'ütleda' (the bait above) was found by a slow human reader in shipped
// copy and fixed to 'ütelda'; the maker words 'lõpuleviimine' vs the
// EKS form 'lõpule viimine' and the non-word 'nataalne' were fixed at
// the same time. The tests above keep the corpus clean; this file's
// header bait keeps the gate provably sharp.
