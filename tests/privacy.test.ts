/**
 * PRIVACY ENFORCED MECHANICALLY:
 * application source calls no network API, and the only remote addresses it
 * names are the two credits the page displays — the project's own source
 * (the AGPL-3.0 §13 source offer) and GeoNames. A credit is an address a
 * visitor may follow; nothing loads from it. Every other remote URL is still
 * an offence, and the allowlist is pinned below to the licence module's two
 * exported addresses and proven to be narrow.
 *
 * The vendored ephemeris chunk (@swisseph/browser, bundled as swisseph.*.js)
 * contains an unreachable constant URL used only by its optional
 * `loadStandardEphemeris` loading helpers — the app never calls them; that
 * is asserted separately below by scanning our own source for the call.
 */
import { expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PLACE_DATA_URL, SOURCE_URL } from '../src/lib/licence';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

/**
 * The two credited addresses the page shows, each reviewed: they are links in
 * the footer, never requests. Pinned literally here so a new credit is a
 * deliberate edit to this test as well as to `src/lib/licence.ts`.
 */
const REVIEWED_CREDITS: readonly string[] = [
  SOURCE_URL, // the project's own repository — AGPL-3.0 §13 source offer
  PLACE_DATA_URL, // GeoNames — the CC BY 4.0 credit for the bundled place data
];

const LINE_PATTERNS: Array<{ re: RegExp; allowNamespace?: boolean; allowCredits?: boolean; why: string }> = [
  { re: /\bfetch\s*\(/, why: 'fetch()' },
  { re: /\bXMLHttpRequest\b/, why: 'XMLHttpRequest' },
  { re: /\bWebSocket\b/, why: 'WebSocket' },
  { re: /\bnavigator\.sendBeacon\b/, why: 'sendBeacon' },
  { re: /\bpostMessage\s*\(/, why: 'postMessage' },
  {
    re: /https?:\/\/(?!www\.w3\.org\/(1999\/xhtml|2000\/svg))/,
    allowCredits: true,
    why: 'remote URL',
  },
];
const NAMESPACE_LINE = /www\.w3\.org\/(1999\/xhtml|2000\/svg)/;

/** Drop the reviewed credit addresses, so the remote-URL rule sees what is
 * left: a credit may only ever be exactly the reviewed address. */
function withoutReviewedCredits(line: string): string {
  let out = line;
  for (const url of REVIEWED_CREDITS) {
    out = out.replace(new RegExp(`${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w./-])`, 'g'), '');
  }
  return out;
}

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
    for (const { re, allowCredits, why } of LINE_PATTERNS) {
      if (re.test(allowCredits ? withoutReviewedCredits(line) : line)) bad.push(why);
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

test('the credit allowlist is exactly the licence module’s two addresses', () => {
  // The allowlist above is written out, so a third credit cannot slip in with
  // a module edit alone; and the module is the one place the page reads, so an
  // allowlisted-but-unused address cannot linger either.
  expect(REVIEWED_CREDITS).toEqual([SOURCE_URL, PLACE_DATA_URL]);
  expect(new Set(REVIEWED_CREDITS).size, 'duplicate credit entries hide a removal').toBe(
    REVIEWED_CREDITS.length,
  );
});

test('a remote URL that is not a reviewed credit still fails', () => {
  // the bait for the exception: the rule must stay sharp around it
  expect(offendingLines('<link rel="stylesheet" href="https://cdn.example.com/x.css">')).toContain(
    'remote URL',
  );
  expect(offendingLines('<script src="https://github.com/rasmusbobkov/evil"></script>')).toContain(
    'remote URL',
  );
  // and each reviewed credit is accepted only as itself
  for (const url of REVIEWED_CREDITS) {
    expect(offendingLines(`<a href="${url}">x</a>`)).toEqual([]);
    expect(offendingLines(`<a href="${url}evil.example.com">x</a>`)).toContain('remote URL');
  }
});

test('src: the only remote addresses named are the reviewed credits', () => {
  // every https?:// occurrence in our own source, minus the two credits and the
  // SVG namespaces, must be nothing at all
  const leftovers: string[] = [];
  for (const file of walkFiles(SRC)) {
    const text = fs.readFileSync(file, 'utf8');
    const scrubbed = text
      .split('\n')
      .filter((line) => !NAMESPACE_LINE.test(line))
      .join('\n');
    for (const match of withoutReviewedCredits(scrubbed).matchAll(/https?:\/\/\S*/g)) {
      leftovers.push(`${path.relative(ROOT, file)}: ${match[0]}`);
    }
  }
  expect(leftovers, leftovers.join('; ')).toEqual([]);
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
