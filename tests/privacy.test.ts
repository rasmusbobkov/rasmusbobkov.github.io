/**
 * PRIVACY ENFORCED MECHANICALLY:
 * the published work calls no network API except the one approved measurement
 * request, and the only remote addresses it names are the two credits the
 * page displays (the project's own source, the AGPL-3.0 §13 source offer, and
 * GeoNames), the one cookieless counter address, the addresses inside the
 * third-party licence notices a publisher is obliged to ship verbatim, and
 * the SVG namespaces. Every other remote URL is still an offence, and the
 * allowances are pinned below and proven narrow.
 *
 * The measurement allowance is deliberately the narrowest the approved plan
 * allows (card-f77f7896-fm-measurement-plan): ONE address, requested from ONE
 * module. `src/lib/events.ts` is the only authored file that may call a
 * network API, and in the build only the chunk that names the counter address
 * may; a second address, or a request from any other file, still fails. The
 * bait below proves both.
 *
 * One scan reads every file a visitor can be served, as text: our own source,
 * the assets `public/` copies into the build verbatim (the font stylesheet,
 * the OFL notices, the favicon — anything put there reaches the site), and the
 * whole built output. A font or the WASM module carries NUL bytes and is left
 * out, since no browser reads one as text. Reading `public/` beside `dist/` is
 * what covers the published surface whether or not a build has run; the build
 * output is reported as unscanned when `dist/` is missing.
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
import { COUNTER_URL } from '../src/lib/events';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const NOTICES = path.join(ROOT, 'THIRD-PARTY-NOTICES.md');

/**
 * The two credited addresses the page shows, each reviewed: they are links in
 * the footer, never requests. Pinned literally here so a new credit is a
 * deliberate edit to this test as well as to `src/lib/licence.ts`.
 */
const REVIEWED_CREDITS: readonly string[] = [
  SOURCE_URL, // the project's own repository — AGPL-3.0 §13 source offer
  PLACE_DATA_URL, // GeoNames — the CC BY 4.0 credit for the bundled place data
];

/**
 * The one measurement address the approved plan allows. Unlike the credits it
 * IS a request the page makes: exactly one GET per wired event, from one
 * module, carrying only the event name and the app version. It is read from
 * the module that sends it, and from the data file both the page and the daily
 * refresh script read, so no second copy of the address can appear.
 */
const COUNTER_ADDRESS: string = COUNTER_URL;

/** The one authored module allowed to call the network. */
const NETWORK_MODULE = 'src/lib/events.ts';

/** In the build, the module's chunk is the one whose text names the address. */
function networkAllowed(rel: string, text: string): boolean {
  if (rel === NETWORK_MODULE) return true;
  return rel.startsWith('dist/') && text.includes(COUNTER_ADDRESS);
}

/**
 * The third-party licence notices we must ship beside the fonts they cover
 * (decision 0007), in `public/fonts` and in its copy in the build. They are
 * other people's documents, carried verbatim: their copyright lines and the
 * OFL's own FAQ name addresses that are part of the text, so they cannot be
 * edited away and nothing loads them.
 *
 * THIRD-PARTY-NOTICES.md is the one document that records what we ship, so an
 * address inside a notice is allowed only while that document already names
 * it. A new address — in a notice, or in any other published file — still
 * fails, and the bait below proves it.
 */
const LICENCE_NOTICE = /^(?:public|dist)\/fonts\/[\w.-]+-OFL\.txt$/;
const RECORDED_ADDRESSES: readonly string[] = [
  ...new Set(
    [...fs.readFileSync(NOTICES, 'utf8').matchAll(/https?:\/\/[^\s>)]+/g)].map((match) => match[0]!),
  ),
];

const LINE_PATTERNS: Array<{ re: RegExp; allowRemote?: boolean; why: string }> = [
  { re: /\bfetch\s*\(/, why: 'fetch()' },
  { re: /\bXMLHttpRequest\b/, why: 'XMLHttpRequest' },
  { re: /\bWebSocket\b/, why: 'WebSocket' },
  { re: /\bnavigator\.sendBeacon\b/, why: 'sendBeacon' },
  { re: /\bpostMessage\s*\(/, why: 'postMessage' },
  {
    re: /https?:\/\/(?!www\.w3\.org\/(1999\/xhtml|2000\/svg))/,
    allowRemote: true,
    why: 'remote URL',
  },
];
const NAMESPACE_LINE = /www\.w3\.org\/(1999\/xhtml|2000\/svg)/;

/** Drop the addresses this file may name, so the remote-URL rule sees what is
 * left: an allowed address may only ever be exactly that address. */
function withoutAllowed(line: string, allowed: readonly string[]): string {
  let out = line;
  for (const url of allowed) {
    out = out.replace(new RegExp(`${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w./-])`, 'g'), '');
  }
  return out;
}

/** The addresses a published file may name: the notices get the ones the
 * notices document records, everything else only the two page credits — and
 * every published file may name the one approved counter address. */
function allowedIn(rel: string): readonly string[] {
  const base = LICENCE_NOTICE.test(rel) ? [...REVIEWED_CREDITS, ...RECORDED_ADDRESSES] : REVIEWED_CREDITS;
  return [...base, COUNTER_ADDRESS];
}

function* walkFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

function offendingLines(text: string, allowed: readonly string[], networkApi = false): string[] {
  const bad: string[] = [];
  for (const line of text.split('\n')) {
    if (NAMESPACE_LINE.test(line)) continue;
    for (const { re, allowRemote, why } of LINE_PATTERNS) {
      if (allowRemote) {
        if (re.test(withoutAllowed(line, allowed))) bad.push(why);
      } else if (!networkApi && re.test(line)) {
        bad.push(why);
      }
    }
  }
  return bad;
}

/**
 * Every published file read as text: our own source, the assets `public/`
 * ships verbatim, and, once a build has run, the whole `dist/` tree — its
 * HTML, CSS and JS and its copies of those same assets.
 */
function publishedFiles(): Array<{ rel: string; text: string }> {
  const roots: Array<[string, string]> = [
    [SRC, 'src'],
    [PUBLIC, 'public'],
    [DIST, 'dist'],
  ];
  const files: Array<{ rel: string; text: string }> = [];
  for (const [dir, label] of roots) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walkFiles(dir)) {
      // the vendored ephemeris chunk is checked at source level (CDN constant
      // unreachable); everything else must be fully local
      if (/^swisseph\..*\.js$/.test(path.basename(file))) continue;
      const bytes = fs.readFileSync(file);
      // a NUL byte is a font binary or the WASM module: no browser reads one
      // as text, and no address in it is ever followed
      if (bytes.includes(0)) continue;
      files.push({ rel: `${label}/${path.relative(dir, file)}`, text: bytes.toString('utf8') });
    }
  }
  return files;
}

function scan(files: ReadonlyArray<{ rel: string; text: string }>): string[] {
  const offenders: string[] = [];
  for (const { rel, text } of files) {
    for (const why of offendingLines(text, allowedIn(rel), networkAllowed(rel, text))) {
      offenders.push(`${rel}: ${why}`);
    }
  }
  return offenders;
}

test('no published file calls a network API or names a remote address no allowance covers', () => {
  if (!fs.existsSync(DIST)) {
    console.warn(
      'dist/ missing — the built output is not scanned; run `npm run build` first (the project’s gate and CI build before the tests)',
    );
  }
  const offenders = scan(publishedFiles());
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

test('a remote address no reviewed allowance covers still fails', () => {
  // the bait for the exception: the rule must stay sharp around it
  expect(
    offendingLines('<link rel="stylesheet" href="https://cdn.example.com/x.css">', REVIEWED_CREDITS),
  ).toContain('remote URL');
  expect(offendingLines('<script src="https://github.com/rasmusbobkov/evil"></script>', REVIEWED_CREDITS)).toContain(
    'remote URL',
  );
  // and each reviewed credit is accepted only as itself
  for (const url of REVIEWED_CREDITS) {
    expect(offendingLines(`<a href="${url}">x</a>`, REVIEWED_CREDITS)).toEqual([]);
    expect(offendingLines(`<a href="${url}evil.example.com">x</a>`, REVIEWED_CREDITS)).toContain('remote URL');
  }
  // a shipped asset that is not a licence notice gets no allowance beyond the
  // two credits: this is the file the review found reaching the site unread
  expect(scan([{ rel: 'public/fonts/localize_fonts.py', text: 'url = "https://fonts.gstatic.com/x.woff2"' }])).toContain(
    'public/fonts/localize_fonts.py: remote URL',
  );
  // a notice may name an address the notices document records, and only that
  const notice = 'public/fonts/fraunces-OFL.txt';
  const recorded = RECORDED_ADDRESSES[0]!;
  expect(scan([{ rel: notice, text: `Copyright 2018 The Fraunces Project Authors (${recorded})` }])).toEqual([]);
  expect(scan([{ rel: notice, text: 'Redistributed from https://fonts.example.com/fraunces' }])).toContain(
    `${notice}: remote URL`,
  );
});

test('the one measurement address is allowed and only its module may request it', () => {
  // The address is the one the data file declares and the one module sends.
  const declared = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'src', 'data', 'counter.json'), 'utf8'),
  ) as { count: string };
  expect(COUNTER_ADDRESS).toBe(declared.count);
  expect(COUNTER_ADDRESS).toMatch(/^https:\/\/[\w.-]+\.goatcounter\.com\/count$/);

  // The module's own request is allowed, in source and in its build chunk.
  expect(scan([{ rel: NETWORK_MODULE, text: `fetch("${COUNTER_ADDRESS}?p=visit&t=0.1.0")` }])).toEqual([]);
  expect(scan([{ rel: 'dist/_astro/page.js', text: `fetch("${COUNTER_ADDRESS}?p=visit")` }])).toEqual([]);

  // The same call from any other file still fails ...
  expect(scan([{ rel: 'src/scripts/app.ts', text: `fetch("${COUNTER_ADDRESS}?p=visit")` }])).toContain(
    'src/scripts/app.ts: fetch()',
  );
  // ... and so does a build chunk that names no counter address.
  expect(scan([{ rel: 'dist/_astro/other.js', text: 'fetch("/count")' }])).toContain(
    'dist/_astro/other.js: fetch()',
  );

  // The one address is accepted only as itself: a path beside it is a second
  // address, and a second address in the module or its chunk still fails.
  expect(offendingLines(`<a href="${COUNTER_ADDRESS}/evil">x</a>`, [COUNTER_ADDRESS])).toContain(
    'remote URL',
  );
  expect(scan([{ rel: NETWORK_MODULE, text: 'fetch("https://evil.example/count")' }])).toContain(
    'src/lib/events.ts: remote URL',
  );
  expect(
    scan([{ rel: 'dist/_astro/page.js', text: `fetch("${COUNTER_ADDRESS}?p=visit&r=https://evil.example/x")` }]),
  ).toContain('dist/_astro/page.js: remote URL');
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

test('the scan reads the assets public/ ships and the build copies of them', () => {
  // The gap this test guards: the assets under `public/` reach the site, so a
  // file put there — .py, .txt, .svg, whatever — is published, and no check
  // read it. Both the authored file and its copy in the build must be read.
  const read = new Set(publishedFiles().map((file) => file.rel));
  for (const file of walkFiles(PUBLIC)) {
    if (fs.readFileSync(file).includes(0)) continue; // a font binary
    const rel = path.relative(PUBLIC, file);
    expect(read, `public/${rel} reaches the site, so the scan must read it`).toContain(`public/${rel}`);
    if (fs.existsSync(DIST)) {
      expect(read, `dist/${rel} is the published copy of public/${rel}`).toContain(`dist/${rel}`);
    }
  }
  if (fs.existsSync(DIST)) {
    expect(read, 'the built page itself is read').toContain('dist/index.html');
  }
});
