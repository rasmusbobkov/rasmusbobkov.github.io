/**
 * PRIVACY ENFORCED MECHANICALLY:
 * application source references fetch, XMLHttpRequest or remote URLs
 * exactly never. The app is a static site that talks to nothing.
 *
 * The vendored ephemeris chunk (@swisseph/browser, bundled as swisseph.*.js)
 * contains an unreachable constant URL used only by its optional
 * `loadStandardEphemeris` loading helpers — the app never calls them; that
 * is asserted separately below by scanning our own source for the call.
 */
import { expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

const LINE_PATTERNS: Array<{ re: RegExp; allowNamespace?: boolean; why: string }> = [
  { re: /\bfetch\s*\(/, why: 'fetch()' },
  { re: /\bXMLHttpRequest\b/, why: 'XMLHttpRequest' },
  { re: /\bWebSocket\b/, why: 'WebSocket' },
  { re: /\bnavigator\.sendBeacon\b/, why: 'sendBeacon' },
  { re: /\bpostMessage\s*\(/, why: 'postMessage' },
  {
    re: /https?:\/\/(?!www\.w3\.org\/(1999\/xhtml|2000\/svg))/,
    why: 'remote URL',
  },
];
const NAMESPACE_LINE = /www\.w3\.org\/(1999\/xhtml|2000\/svg)/;

function* walkFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

function offendingLines(text: string): string[] {
  const bad: string[] = [];
  for (const line of text.split('\n')) {
    if (NAMESPACE_LINE.test(line)) continue;
    for (const { re, why } of LINE_PATTERNS) {
      if (re.test(line)) bad.push(why);
    }
  }
  return bad;
}

test('src: no network APIs or remote URLs in application source', () => {
  const offenders: string[] = [];
  for (const file of walkFiles(SRC)) {
    const rel = path.relative(ROOT, file);
    for (const why of offendingLines(fs.readFileSync(file, 'utf8'))) {
      offenders.push(`${rel}: ${why}`);
    }
  }
  expect(offenders, offenders.join('; ')).toEqual([]);
});

test('src: the optional CDN ephemeris loaders are never used', () => {
  const offenders: string[] = [];
  for (const file of walkFiles(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    if (/\bloadStandardEphemeris\b|\bloadEphemerisFiles\b/.test(text) && !file.endsWith('.test.ts')) {
      offenders.push(file);
    }
  }
  expect(offenders, offenders.join('; ')).toEqual([]);
});

test('dist: built HTML/CSS and our app chunk contain no remote URLs', () => {
  const dist = path.join(ROOT, 'dist');
  if (!fs.existsSync(dist)) {
    console.warn('dist/ missing — build output scan skipped');
    return;
  }
  const offenders: string[] = [];
  for (const file of walkFiles(dist)) {
    const base = path.basename(file);
    // the vendored ephemeris chunk is checked at source level (CDN constant
    // unreachable); everything else must be fully local
    if (/^swisseph\..*\.js$/.test(base)) continue;
    if (!/\.(html|css|js)$/.test(base)) continue;
    for (const why of offendingLines(fs.readFileSync(file, 'utf8'))) {
      offenders.push(`${path.relative(dist, file)}: ${why}`);
    }
  }
  expect(offenders, offenders.join('; ')).toEqual([]);
});
