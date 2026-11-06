#!/usr/bin/env node
/**
 * REFRESH THE MEASUREMENT SNAPSHOT — read the cookieless counter's public
 * counts once and write `src/data/metrics.json`, which the build bakes into
 * the public metrics page.
 *
 * The approved measurement plan (card-f77f7896-fm-measurement-plan) put the
 * numbers on a page inside the app, baked at build time and refreshed once a
 * day. This script is that refresh: the Pages workflow runs it before the
 * daily build, and a manual run does the same locally. It reads the SAME one
 * address the event layer sends to — `src/data/counter.json` — and derives the
 * counter's stats path from that origin, so no second address exists.
 *
 * It writes nothing when the counter does not answer for every event: the
 * committed snapshot stays as it is rather than claiming a read that did not
 * happen. The event layer's payload rule is unchanged here — the counts are
 * read from the counter, never per person.
 *
 * Usage: node scripts/refresh-metrics.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COUNTER_FILE = path.join(ROOT, 'src', 'data', 'counter.json');
const SNAPSHOT_FILE = path.join(ROOT, 'src', 'data', 'metrics.json');

/** The wired events whose counts the page shows. */
export const WIRED_EVENTS = ['visit', 'birthDataGiven', 'storyOpened'];

/** The counter's public stats address for one event, derived from the one address. */
export function statsUrl(event) {
  const count = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8')).count;
  const origin = new URL(count).origin;
  return `${origin}/counter/${encodeURIComponent(event)}.json`;
}

/** One count from the counter's answer, or null when it carries none. */
export function parseCount(body) {
  const parsed = JSON.parse(body);
  const count = Number(parsed.count);
  return Number.isFinite(count) ? count : null;
}

/** The snapshot the page reads: the three wired events in order, readAt as given. */
export function buildSnapshot(counts, readAt) {
  const ordered = {};
  for (const event of WIRED_EVENTS) ordered[event] = counts[event] ?? null;
  return { readAt, counts: ordered };
}

/** Today's date in the app's own timezone, as YYYY-MM-DD. */
export function readAtTallinn(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tallinn' }).format(now);
}

async function main() {
  const counts = {};
  let failed = false;
  for (const event of WIRED_EVENTS) {
    try {
      const res = await fetch(statsUrl(event), {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const count = parseCount(await res.text());
      if (count === null) throw new Error('the answer carries no count');
      counts[event] = count;
    } catch (error) {
      failed = true;
      console.warn(`refresh-metrics: ${event}: ${error instanceof Error ? error.message : error}`);
    }
  }
  if (failed) {
    console.warn('refresh-metrics: the counter did not answer for every event; the committed snapshot stays as it is');
    return;
  }
  const snapshot = buildSnapshot(counts, readAtTallinn());
  fs.writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`refresh-metrics: wrote src/data/metrics.json (read ${snapshot.readAt})`);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
