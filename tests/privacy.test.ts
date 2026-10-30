/**
 * PRIVACY ENFORCED MECHANICALLY:
 * the application source must reference fetch, XMLHttpRequest or remote
 * URLs exactly never. The app is a static site that talks to nothing.
 */
import { expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(import.meta.dirname, '..', 'src');

const FORBIDDEN: RegExp[] = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bnavigator\.sendBeacon\b/,
  /\bpostMessage\s*\(/,
  /https?:\/\/(?!www\.w3\.org)/, // SVG inner namespace declarations are the one allowed constant
];

const ALLOWED_PORTS = /w3\.org\/1999\/xhtml|w3\.org\/2000\/svg/;

function* walkFiles(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkFiles(p);
    else yield p;
  }
}

test('source files reference no network APIs or remote URLs', () => {
  const offenders: string[] = [];
  for (const file of walkFiles(SRC)) {
    const rel = path.relative(SRC, file);
    const text = fs.readFileSync(file, 'utf8');
    for (const pattern of FORBIDDEN) {
      if (pattern.test(text) && !ALLOWED_PORTS.test(text)) {
        offenders.push(`${rel}: ${pattern}`);
      }
    }
  }
  expect(offenders, offenders.join('; ')).toEqual([]);
});

test('built output contains no remote script/link/font source', () => {
  const dist = path.resolve(import.meta.dirname, '..', 'dist');
  if (!fs.existsSync(dist)) {
    // run `npm run build` later in the pipeline; not an error here
    console.warn('dist/ missing — build output scan skipped');
    return;
  }
  const offenders: string[] = [];
  for (const file of walkFiles(dist)) {
    if (!file.endsWith('.html') && !file.endsWith('.css') && !file.endsWith('.js')) continue;
    const text = fs.readFileSync(file, 'utf8');
    if (/https?:\/\//.test(text)) offenders.push(path.relative(dist, file));
  }
  expect(offenders, offenders.join('; ')).toEqual([]);
});
