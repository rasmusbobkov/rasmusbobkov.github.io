/**
 * LICENCE SURFACE — the AGPL-3.0 obligations the captain chose on
 * card-d4a005dc-4 are shipped, not merely written down: the repository
 * carries the licence text and the third-party notices with their licence
 * texts, and the page names the licence and offers the source.
 *
 * Where the facts come from, so the pins stay derived rather than typed:
 * the licence ids are read from the installed packages' own `license` fields,
 * the font families from the stylesheet that serves them, the place-data
 * files from `src/data`, and the source address from this checkout's own git
 * remote. Editing the copy, adding a runtime dependency, serving a new font
 * family or moving repositories fails here until the change is carried
 * through — which is the intent: a licence surface that drifts is a licence
 * that is not obeyed.
 *
 * Renders last: the built page is checked whenever `dist/` exists, so this
 * projects the real footer HTML, not a promise about it.
 */
import { describe, expect, test } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { LICENCE_ID, PLACE_DATA_URL, SOURCE_URL } from '../src/lib/licence';
import { rawMessages } from '../src/messages/catalogue';

const ROOT = path.resolve(import.meta.dirname, '..');
const NOTICES = path.join(ROOT, 'THIRD-PARTY-NOTICES.md');

const notices = fs.readFileSync(NOTICES, 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
  dependencies: Record<string, string>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/** The address this checkout builds from, normalised to an https URL. */
function repositoryUrl(): string {
  const raw = execFileSync('git', ['-C', ROOT, 'config', '--get', 'remote.origin.url'], {
    encoding: 'utf8',
  }).trim();
  return raw.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/');
}

describe('the licence text', () => {
  const licence = fs.readFileSync(path.join(ROOT, 'LICENSE'), 'utf8');

  test('LICENSE is the verbatim GNU AGPL-3.0 text', () => {
    // It must open as the AGPL and carry the section that only the AGPL has.
    expect(licence).toMatch(/^\s*GNU AFFERO GENERAL PUBLIC LICENSE\s*\n\s*Version 3, 19 November 2007/);
    expect(licence).toContain('GNU AFFERO GENERAL PUBLIC LICENSE');
    expect(licence).toContain('Remote Network Interaction'); // §13, AGPL-only
    expect(licence).toContain('How to Apply These Terms to Your New Programs');
    expect(licence).toContain('TERMS AND CONDITIONS');
    expect(licence.length, 'the whole licence text, not an excerpt').toBeGreaterThan(30_000);
  });

  test('the engine that obliges the licence is the AGPL-3.0 one we notice', () => {
    const engine = readJson<{ license: string }>(
      path.join(ROOT, 'node_modules', '@swisseph', 'browser', 'package.json'),
    ).license;
    expect(engine).toBe(LICENCE_ID);
    expect(notices).toContain('@swisseph/browser');
    expect(notices).toContain(LICENCE_ID);
  });
});

describe('every component the build ships is noticed', () => {
  test('each declared runtime dependency is named with its own licence', () => {
    const missing: string[] = [];
    for (const name of Object.keys(pkg.dependencies)) {
      const declared = readJson<{ license?: string }>(
        path.join(ROOT, 'node_modules', ...name.split('/'), 'package.json'),
      ).license;
      if (!declared) missing.push(`${name}: no license field to notice`);
      else if (!notices.includes(name) || !notices.includes(declared)) {
        missing.push(`${name} (${declared}) is not in THIRD-PARTY-NOTICES.md`);
      }
    }
    expect(missing, missing.join('; ')).toEqual([]);
  });

  test('each font family the stylesheet serves has its own OFL text beside it, and is noticed', () => {
    const css = fs.readFileSync(path.join(ROOT, 'public', 'fonts', 'fonts.css'), 'utf8');
    const families = [...new Set([...css.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]!))];
    expect(families.length, 'the stylesheet must still serve fonts').toBeGreaterThan(0);
    for (const family of families) {
      const ofl = path.join(ROOT, 'public', 'fonts', `${family.toLowerCase().replace(/\s+/g, '-')}-OFL.txt`);
      expect(fs.existsSync(ofl), `${family} is served, so its OFL text must ship beside it`).toBe(true);
      const text = fs.readFileSync(ofl, 'utf8');
      expect(text, ofl).toContain('SIL OPEN FONT LICENSE Version 1.1');
      expect(text, `${family}'s own copyright line`).toMatch(/^Copyright \d{4} The /);
      expect(notices, `${family} must be noticed`).toContain(family);
    }
  });

  test('the bundled place data keeps its GeoNames CC BY 4.0 credit, in the notices and on the page', () => {
    const dataFiles = fs.readdirSync(path.join(ROOT, 'src', 'data'));
    expect(dataFiles.filter((f) => f.endsWith('.json')).length, 'place data ships in src/data').toBeGreaterThan(0);
    expect(notices).toContain('GeoNames');
    expect(notices).toContain('CC BY 4.0');
    expect(notices).toContain(PLACE_DATA_URL);
    expect(rawMessages.et['foot.places']).toContain('GeoNames');
    expect(rawMessages.et['foot.places']).toContain('CC BY 4.0');
  });
});

describe('the page carries the licence and the source offer', () => {
  test('the offered source is the repository this checkout builds from', () => {
    expect(
      SOURCE_URL,
      'the footer offers the source, so it must point at the project that publishes the page',
    ).toBe(repositoryUrl());
  });

  test('the footer copy names the licence (AGPL-3.0 §13)', () => {
    expect(rawMessages.et['foot.licence']).toContain(LICENCE_ID);
    expect(rawMessages.et['foot.licence'].toLowerCase()).toContain('litsents');
  });

  test('the built page carries the offer and the credits', () => {
    const page = path.join(ROOT, 'dist', 'index.html');
    if (!fs.existsSync(page)) {
      // Reported, never silently skipped: CI builds before it tests, so this
      // branch is a local run without a build, not a hole in the gate.
      console.warn('dist/index.html missing — run `npm run build` first; built-page check skipped');
      return;
    }
    const html = fs.readFileSync(page, 'utf8');
    const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';
    expect(footer, 'the built page must have a footer').not.toBe('');
    expect(footer, 'the footer names the licence').toContain(LICENCE_ID);
    expect(footer, 'the footer offers the source, linked').toContain(`href="${SOURCE_URL}"`);
    expect(footer, 'and shows the address it links to').toContain(SOURCE_URL.replace(/^https?:\/\//, ''));
    expect(footer, 'the footer credits the place data, linked').toContain(`href="${PLACE_DATA_URL}"`);
    expect(footer).toContain('GeoNames');
  });
});
