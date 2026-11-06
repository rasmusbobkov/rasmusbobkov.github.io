/**
 * THE PUBLIC MEASUREMENT PAGE — the snapshot, its helpers and its build.
 *
 * The captain's approved measurement plan (card-f77f7896-fm-measurement-plan)
 * asked for one public page in the app that shows the three wired events'
 * counts in Estonian, with the numbers baked in at build time and refreshed by
 * the daily build. These tests pin the two halves of that promise: the pure
 * helpers order the rows and format the read date the way the page expects,
 * and the served HTML carries the baked counts, the read date and the payload
 * sentence while sending no request of its own. The app's footer carries the
 * one measurement sentence and its link to the page.
 *
 * The dist checks skip when no build has run, as the privacy scan's do; the
 * project's gate and CI build before the tests.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { metricsRows, readAtLabel } from '../src/lib/metrics';
import type { MetricsSnapshot } from '../src/lib/metrics';
import { WIRED_EVENTS } from '../src/lib/events';
import { rawMessages } from '../src/messages/catalogue';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SNAPSHOT_FILE = path.join(ROOT, 'src', 'data', 'metrics.json');
const ET = rawMessages.et;

/** A realistic snapshot: the counter answered for every wired event. */
const answered: MetricsSnapshot = {
  readAt: '2026-11-06',
  counts: { visit: 128, birthDataGiven: 41, storyOpened: 33 },
};

describe('the metrics snapshot helpers', () => {
  test('rows follow the approved event order and keep each count', () => {
    const rows = metricsRows(answered);
    expect(rows.map((row) => row.event)).toEqual([...WIRED_EVENTS]);
    expect(rows.map((row) => row.count)).toEqual([128, 41, 33]);
  });

  test('a count the counter did not answer renders as null, never as zero', () => {
    const partial: MetricsSnapshot = { readAt: '2026-11-06', counts: { visit: 128 } };
    const rows = metricsRows(partial);
    expect(rows.map((row) => row.count)).toEqual([128, null, null]);
    const odd: MetricsSnapshot = {
      readAt: '2026-11-06',
      counts: { visit: 128, birthDataGiven: Number.NaN, storyOpened: null as unknown as number },
    };
    expect(metricsRows(odd).map((row) => row.count)).toEqual([128, null, null]);
  });

  test('the read date formats as the Estonian day the page shows', () => {
    expect(readAtLabel(answered)).toBe('06.11.2026');
    expect(readAtLabel({ readAt: null, counts: {} })).toBeNull();
    expect(readAtLabel({ readAt: 'not-a-date', counts: {} })).toBeNull();
  });
});

describe('the served measurement page', () => {
  const page = path.join(DIST, 'mõõdikud', 'index.html');

  test('the page bakes each wired event, its count and the read date', () => {
    if (!fs.existsSync(page)) {
      console.warn('dist/ missing — run `npm run build` first');
      return;
    }
    const html = fs.readFileSync(page, 'utf8');
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')) as MetricsSnapshot;
    const labelFor: Record<string, string> = {
      visit: 'metrics.visit',
      birthDataGiven: 'metrics.birthDataGiven',
      storyOpened: 'metrics.storyOpened',
    };
    for (const event of WIRED_EVENTS) {
      expect(html, `the page names ${event}`).toContain(ET[labelFor[event] as keyof typeof ET]);
      const expected = snapshot.counts[event] ?? '—';
      // Astro's scoped styles add a data attribute to the cell; the class and
      // the baked value are what matter.
      expect(html, `the page bakes the count for ${event}`).toMatch(
        new RegExp(`<td class="metrics-number"[^>]*>${expected}</td>`),
      );
    }
    expect(html).toContain(readAtLabel(snapshot) ?? ET['metrics.unavailable']);
    expect(html, 'the page names what leaves').toContain(ET['metrics.leaving']);
    expect(html, 'the page sends no request of its own').not.toContain('<script');
  });

  test("the app's footer carries the measurement sentence and the link", () => {
    const index = path.join(DIST, 'index.html');
    if (!fs.existsSync(index)) {
      console.warn('dist/ missing — run `npm run build` first');
      return;
    }
    const html = fs.readFileSync(index, 'utf8');
    expect(html).toContain(ET['foot.measurement']);
    expect(html).toContain('m%C3%B5%C3%B5dikud');
  });
});
