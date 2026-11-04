/**
 * PUBLISHED ADDRESS — the captain's direction of 4.11.2026 (AGPL-3.0 and a
 * public page, card `d4a005dc-4`) is carried out by serving the built page as
 * a GitHub Pages project site, so the page lives under the base path declared
 * once in `astro.config.mjs`.
 *
 * That base is invisible locally: `npm run dev` and a local static server put
 * the page at the root, where a root-relative `/fonts/…` works and a published
 * page loses its stylesheet, its fonts or its engine silently. These tests read
 * the built page and the stylesheets it serves and hold every root-relative
 * reference to the base, so the break shows up here instead of on the address
 * the footer's source offer is read at.
 *
 * The base is read from the config that declares it, never typed twice.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import config from '../astro.config.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

/** The declared base, always with its trailing separator. */
function basePath(): string {
  const base = config.base;
  expect(typeof base, 'astro.config.mjs must declare the base path the page is served under').toBe('string');
  return (base as string).endsWith('/') ? (base as string) : `${base}/`;
}

function builtFiles(dir: string, extension: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

/** Every `href`/`src` value the page carries, absolute or not. */
function pageReferences(html: string): string[] {
  return [...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((match) => match[1]!);
}

/** Every `url(…)` a stylesheet carries, absolute or not. */
function stylesheetReferences(css: string): string[] {
  return [...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map((match) => match[2]!);
}

const rootRelative = (reference: string) => reference.startsWith('/');
const external = (reference: string) => /^[a-z][a-z0-9+.-]*:/i.test(reference) || reference.startsWith('//');

describe('the built page is served under the base it declares', () => {
  const page = path.join(DIST, 'index.html');
  const html = fs.existsSync(page) ? fs.readFileSync(page, 'utf8') : null;

  test('every root-relative reference in the page sits under the base', () => {
    if (html === null) {
      // Reported, never silently skipped: CI builds before it tests, so this
      // branch is a local run without a build, not a hole in the gate.
      console.warn('dist/index.html missing — run `npm run build` first; base-path check skipped');
      return;
    }
    const base = basePath();
    const adrift = pageReferences(html).filter((ref) => rootRelative(ref) && !ref.startsWith(base));
    expect(adrift, `the page is served under ${base}, so these would 404 there: ${adrift.join(', ')}`).toEqual([]);
  });

  test('each root-relative reference in the page resolves to a file the build ships', () => {
    if (html === null) return;
    const base = basePath();
    const missing = pageReferences(html)
      .filter((ref) => rootRelative(ref) && ref.startsWith(base))
      .map((ref) => ref.slice(base.length).split(/[?#]/)[0]!)
      .filter((rel) => rel !== '' && !fs.existsSync(path.join(DIST, rel)));
    expect(missing, `these are served from ${base} but are not in the build: ${missing.join(', ')}`).toEqual([]);
  });

  test('every root-relative reference in the stylesheets the page serves sits under the base', () => {
    const base = basePath();
    const sheets = [
      ...builtFiles(path.join(DIST, 'fonts'), '.css'),
      ...builtFiles(path.join(DIST, '_astro'), '.css'),
    ];
    expect(sheets.length, 'the build must serve the stylesheets the page links').toBeGreaterThan(0);
    const adrift: string[] = [];
    for (const sheet of sheets) {
      for (const ref of stylesheetReferences(fs.readFileSync(sheet, 'utf8'))) {
        if (external(ref) || !rootRelative(ref) || ref.startsWith(base)) continue;
        // A stylesheet reached under the base resolves its own relative URLs
        // itself; only a root-relative one can escape the base.
        adrift.push(`${path.relative(ROOT, sheet)}: ${ref}`);
      }
    }
    expect(adrift, `these would be fetched from the site root: ${adrift.join(', ')}`).toEqual([]);
  });
});
