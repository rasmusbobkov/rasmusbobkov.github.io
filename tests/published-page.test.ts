/**
 * PUBLISHED ADDRESS — the page is served at the root of its own address, the
 * one `docs/decisions/0008-product-name-and-public-address.md` chose (after the
 * captain's direction of 4.11.2026, card `d4a005dc-4`, first put the built page
 * on a public address). `astro.config.mjs` declares that address as `site`, and
 * no `base` is declared, so the page and everything it fetches are fetched from
 * that address's root.
 *
 * A root-relative reference that does not resolve is fatal in public and
 * invisible locally: `npm run dev` and a local static server both serve from
 * the root, so a published page can lose its stylesheet, its fonts or its
 * engine while every local look is fine. These tests read the built page and
 * the stylesheets it serves and resolve every reference against `dist/`, so the
 * break shows up here instead of on the address the footer's source offer is
 * read at.
 *
 * The address is read from the config that declares it, never typed twice.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import config from '../astro.config.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

/** The served root: the declared base path, or `/` with none declared. */
function servedRoot(): string {
  const base = config.base;
  expect(
    base === undefined || typeof base === 'string',
    'astro.config.mjs declares the base path as a string when it declares one',
  ).toBe(true);
  if (base === undefined) return '/';
  return base.endsWith('/') ? base : `${base}/`;
}

/** A root-relative reference, resolved against `dist/`, or null. */
function shippedPath(reference: string, root: string): string | null {
  if (!reference.startsWith(root)) return null;
  const rel = reference.slice(root.length).split(/[?#]/)[0]!;
  return path.join(DIST, rel);
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

describe('the built page is served from its own address’s root', () => {
  const page = path.join(DIST, 'index.html');
  const html = fs.existsSync(page) ? fs.readFileSync(page, 'utf8') : null;

  test('the declared address is a bare https origin, with no base path beside it', () => {
    expect(
      typeof config.site,
      'astro.config.mjs must declare the address the page is built for',
    ).toBe('string');
    const address = new URL(config.site as string);
    expect(address.protocol, 'the published page answers over https').toBe('https:');
    expect(address.pathname, 'the page is the address itself, not a path under it').toBe('/');
    expect(`${address.search}${address.hash}`, 'the address carries no query or fragment').toBe('');
    expect(servedRoot(), 'no base path: the page is served from the root of that address').toBe('/');
  });

  test('every reference the page resolves from a root resolves to a file the build ships', () => {
    if (html === null) {
      // Reported, never silently skipped: CI builds before it tests, so this
      // branch is a local run without a build, not a hole in the gate.
      console.warn('dist/index.html missing — run `npm run build` first; address check skipped');
      return;
    }
    const root = servedRoot();
    const adrift = pageReferences(html).filter((ref) => rootRelative(ref) && !ref.startsWith(root));
    expect(adrift, `the page is served at ${root}, so these would 404 there: ${adrift.join(', ')}`).toEqual([]);
    const missing = pageReferences(html)
      .filter(rootRelative)
      .map((ref) => shippedPath(ref, root))
      .filter((file): file is string => file !== null && file !== DIST)
      .filter((file) => !fs.existsSync(file));
    expect(missing, `these are fetched from ${root} but are not in the build: ${missing.join(', ')}`).toEqual([]);
  });

  test('every reference the page’s stylesheets resolve reaches a file the build ships', () => {
    if (html === null) return;
    const root = servedRoot();
    const sheets = [
      ...builtFiles(path.join(DIST, 'fonts'), '.css'),
      ...builtFiles(path.join(DIST, '_astro'), '.css'),
    ];
    expect(sheets.length, 'the build must serve the stylesheets the page links').toBeGreaterThan(0);
    const missing: string[] = [];
    for (const sheet of sheets) {
      for (const ref of stylesheetReferences(fs.readFileSync(sheet, 'utf8'))) {
        if (external(ref)) continue;
        // A root-relative reference resolves from the served root; a relative
        // one resolves beside the stylesheet that carries it.
        const file = rootRelative(ref) ? shippedPath(ref, root) : path.join(path.dirname(sheet), ref.split(/[?#]/)[0]!);
        if (file === null || fs.existsSync(file)) continue;
        missing.push(`${path.relative(ROOT, sheet)}: ${ref}`);
      }
    }
    expect(missing, `these are fetched but are not in the build: ${missing.join(', ')}`).toEqual([]);
  });
});
