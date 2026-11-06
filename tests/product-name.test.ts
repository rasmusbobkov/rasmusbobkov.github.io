/**
 * PRODUCT NAME — the name a visitor reads.
 *
 * Source of the intent: the roadmap's first item (rasmusbobkov/firstmate-astro-roadmap
 * issue 1, "Vali toote nimi, domeen ja brändi suund") settled in
 * `docs/decisions/0008-product-name-and-public-address.md`: the product is
 * called Tähelugu, and the page title, the header mark and the coming-soon
 * notice are the places a visitor meets that name.
 *
 * What this test owns: the built page as a visitor reads it — the `<title>`,
 * the header mark and the notice that names the app are the catalogue's
 * `app.name`, and the name the page used to carry is gone from the page. The
 * storage keys, the export marker, the export file name and the package name
 * keep their old spelling by the same decision, so the birth data and focus a
 * person has already saved need no migration; those are deliberately not this
 * test's business.
 *
 * Renders last, like the licence and published-page tests: the built page is
 * read whenever `dist/` exists, so this checks the HTML that ships rather than
 * a promise about it.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { rawMessages } from '../src/messages/catalogue';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGE = path.join(ROOT, 'dist', 'index.html');
/** The visible name the page carried before the rename (0008). */
const OLD_NAME = 'Firstmate Astro';

const name = rawMessages.et['app.name'];

/** The head title, the header mark and the coming-soon notice, as rendered. */
function readNameSurfaces(html: string): { title: string; mark: string; notice: string } {
  return {
    title: /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? '',
    mark: /<span class="mark-name"[^>]*>([^<]*)<\/span>/.exec(html)?.[1] ?? '',
    notice: /<span id="lang-coming"[^>]*>([^<]*)<\/span>/.exec(html)?.[1] ?? '',
  };
}

describe('the name a visitor reads', () => {
  test('the catalogue carries one name for the title, the header and the notice', () => {
    expect(name).not.toBe('');
    expect(rawMessages.et['app.comingSoon'], 'the notice names the app it speaks for').toContain(name);
    expect(rawMessages.en['app.name'], 'the language switch answers with the same name').toBe(name);
  });

  test('the built page shows that name in its title, its header mark and its notice', () => {
    if (!fs.existsSync(PAGE)) {
      // Reported, never silently skipped: the project's gate and CI both build
      // before they test, so this branch is a local run without a build.
      console.warn('dist/index.html missing — run `npm run build` first; product-name check skipped');
      return;
    }
    const surfaces = readNameSurfaces(fs.readFileSync(PAGE, 'utf8'));
    expect(surfaces.title, 'the page title is the product name').toBe(name);
    expect(surfaces.mark, 'the header mark is the product name').toBe(name);
    expect(surfaces.notice, 'the coming-soon notice names the product').toContain(name);
  });

  test('the built page no longer carries the name it used to read', () => {
    if (!fs.existsSync(PAGE)) return;
    // The repository address, the stored-data keys and the export marker keep
    // their old spelling (0008), so only the name a visitor reads is asserted
    // absent here; those other surfaces have their own tests.
    expect(fs.readFileSync(PAGE, 'utf8')).not.toContain(OLD_NAME);
  });
});
