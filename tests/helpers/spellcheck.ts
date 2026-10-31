/**
 * ESTONIAN SPELLCHECK — the spelling gate: every shipped word must be a
 * real Estonian word, an allowlisted name, or get named by the suite.
 *
 * The check runs offline and identically everywhere: a pure-JavaScript
 * hunspell (hunspell-asm, a WebAssembly build, no system dependency)
 * over the Estonian et_EE dictionary and affix files committed under
 * tests/spelling/dictionaries/et. No network, no randomness, fast
 * (<10 s: dictionary load ~0.2 s, the whole corpus a few hundred ms).
 *
 * Words that are legitimate but outside the dictionary (proper nouns,
 * planet and sign names, brand terms, abbreviations) live one per line
 * in tests/spelling/allowlist.txt, each with a short reason — reviewed
 * entries, never a bulk dump, and never a place to hide a real
 * misspelling.
 */
import fs from 'node:fs';
import path from 'node:path';
import hunspellAsm from 'hunspell-asm';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const AFF_FILE = path.join(ROOT, 'tests', 'spelling', 'dictionaries', 'et', 'et.aff');
const DIC_FILE = path.join(ROOT, 'tests', 'spelling', 'dictionaries', 'et', 'et.dic');
const ALLOWLIST_FILE = path.join(ROOT, 'tests', 'spelling', 'allowlist.txt');

/** A string in the corpus: where it lives and what it says. */
export interface TextRef {
  readonly file: string;
  /** message key, unit id + field, or golden entry id + path */
  readonly id: string;
  readonly text: string;
}

/** One unknown word: file, string and the word that tripped it. */
export interface Offender {
  readonly ref: TextRef;
  /** the exact offending token */
  readonly word: string;
  /** character index of the word inside ref.text */
  readonly index: number;
}

/** A human-readable failure line: offending word, then file, then string. */
export function offenderMessage(o: Offender): string {
  const file = path.relative(ROOT, o.ref.file);
  return `${file} — "${o.ref.text}" — sõna "${o.word}" ei ole eesti keeles (${o.ref.id})`;
}

// ——— allowlist ———

export interface AllowlistEntry {
  readonly word: string;
  /** the human-reviewed reason this word is legitimate */
  readonly reason: string;
}

/**
 * Parse the allowlist: non-empty lines are `word  # reason` (block
 * comments may freely explain groups above). A word with no reason
 * fails loudly — the allowlist must never hide a mistake without
 * saying why.
 */
export function parseAllowlist(raw: string): AllowlistEntry[] {
  const entries: AllowlistEntry[] = [];
  const seen = new Set<string>();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const hash = trimmed.indexOf('#');
    const word = (hash === -1 ? trimmed : trimmed.slice(0, hash)).trim();
    const reason = (hash === -1 ? '' : trimmed.slice(hash + 1)).trim();
    if (!reason) {
      throw new Error(
        `allowlist entry without a reason: "${word}"\n  in ${path.relative(ROOT, ALLOWLIST_FILE)}\n  every accepted word must carry a short comment saying why it is legitimate`,
      );
    }
    if (seen.has(word.toLowerCase())) {
      throw new Error(`allowlist has duplicate entries for "${word}" in ${path.relative(ROOT, ALLOWLIST_FILE)}`);
    }
    seen.add(word.toLowerCase());
    entries.push({ word, reason });
  }
  return entries;
}

// ——— the hunspell checker ———

export interface EtChecker {
  /** true when the word is spelt correctly (or on the allowlist) */
  correct(word: string): boolean;
  dispose(): void;
}

/** Load the committed et_EE dictionary into a wasm hunspell instance. */
export async function loadEtChecker(): Promise<EtChecker> {
  const mod = await hunspellAsm.loadModule();
  const affPath = mod.mountBuffer(fs.readFileSync(AFF_FILE), 'et.aff');
  const dicPath = mod.mountBuffer(fs.readFileSync(DIC_FILE), 'et.dic');
  const spell = mod.create(affPath, dicPath);
  const allowed = new Set(parseAllowlist(fs.readFileSync(ALLOWLIST_FILE, 'utf8')).map((e) => e.word));
  return {
    correct(word: string): boolean {
      if (allowed.has(word) || allowed.has(word.toLowerCase())) return true;
      return spell.spell(word);
    },
    dispose(): void {
      spell.dispose();
      mod.unmount(affPath);
      mod.unmount(dicPath);
    },
  };
}

// ——— tokenization ———

/**
 * Checkable tokens. Catalogue placeholders like {time} are filler, not
 * copy, and are removed first. A token is a letter run; hyphenated
 * forms ("-aeg", "24-tunnine") token spellcheck per part, which is
 * right for Estonian hyphen suffixes that stand for a whole word.
 */
const WORD_RE = /\p{L}[\p{L}']*/gu;

export function tokenize(text: string): { word: string; index: number }[] {
  const withoutPlaceholders = text.replace(/\{[^}]*\}/g, ' ');
  const out: { word: string; index: number }[] = [];
  for (const m of withoutPlaceholders.matchAll(WORD_RE)) {
    out.push({ word: m[0], index: m.index! });
  }
  return out;
}

/**
 * Run the dictionary over a string and return every unknown word.
 * Case handling: the word is checked as written first; a lowercase
 * retry covers Estonian compounds that hunspell knows only in one
 * canonical case for the same letters.
 */
export function checkText(text: string, checker: EtChecker, ref: TextRef): Offender[] {
  const offenders: Offender[] = [];
  const seen = new Set<string>();
  for (const { word, index } of tokenize(text)) {
    if (seen.has(word.toLowerCase())) continue;
    if (checker.correct(word) || checker.correct(word.toLowerCase())) {
      seen.add(word.toLowerCase());
      continue;
    }
    seen.add(word.toLowerCase());
    offenders.push({ ref, word, index });
  }
  return offenders;
}

/** One failure line per offender. */
export function checkTexts(texts: readonly TextRef[], checker: EtChecker): Offender[] {
  return texts.flatMap((ref) => checkText(ref.text, checker, ref));
}
