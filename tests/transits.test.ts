/**
 * TRANSIT COMPUTATION — gated against fixed dated fixtures with cited
 * sources, plus pure-function tests of the aspect/orb rules.
 *
 * The fixtures are the same five natal charts committed for the chart
 * engine (tests/fixtures/natal-charts.json). Provenance of their reference
 * values: generated with the official Astrodienst Swiss Ephemeris C
 * library 2.10.03 (native binding `sweph`, real .se1 ephemeris files,
 * flags SEFLG_SWIEPH|SEFLG_SPEED), and each fixture's Sun independently
 * cross-anchored against NASA JPL Horizons (apparent geocentric ecliptic
 * longitude of date; measured agreement <= 0.00002°, see
 * tests/chart-fixtures.test.ts). A transit read at one of those instants
 * is the same ephemeris computation read from the other side of the diary,
 * so the same 0.01° gate applies here.
 */
import { beforeAll, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import './helpers/node-ephemeris-loader.js';
import { wasmFileUrl } from './helpers/node-ephemeris-loader.js';
import {
  TRANSIT_BODIES, TRANSIT_ORBS, tallinnDayKey, transitJulianDayFor, transitPositionsAt,
  computeTransitHits, nearestMiss, type TransitPosition, type AspectInput,
} from '../src/lib/transits';

interface Fixture {
  id: string;
  julianDayUt: number;
  reference: { planets: Record<string, { lon: number; speed: number }> };
}

const POS_TOL = 0.01;

const fixtures: Fixture[] = JSON.parse(
  readFileSync(path.join(import.meta.dirname, 'fixtures', 'natal-charts.json'), 'utf8'),
) as Fixture[];

const transitAtFixtures = new Map<string, TransitPosition[]>();
beforeAll(async () => {
  for (const f of fixtures) {
    transitAtFixtures.set(f.id, await transitPositionsAt(f.julianDayUt, wasmFileUrl()));
  }
}, 120_000);

for (const f of fixtures) {
  test(`[${f.id}] transiting bodies at the documented instant agree with the cited reference within 0.01°`, () => {
    const positions = transitAtFixtures.get(f.id)!;
    expect(positions).toHaveLength(TRANSIT_BODIES.length);
    for (const body of TRANSIT_BODIES) {
      const ref = f.reference.planets[body];
      const pos = positions.find((p) => p.body === body);
      expect(pos, `${f.id} transit body ${body}`).toBeDefined();
      const diff = Math.abs(pos!.longitude - ref.lon);
      expect(diff, `${f.id} ${body} ${pos!.longitude} vs ${ref.lon}`).toBeLessThanOrEqual(POS_TOL);
    }
  });
}

test('transit JD for a fixed instant matches the fixture\'s documented JD to 1e-9', async () => {
  const f = fixtures.find((x) => x.id === 'tallinn-1961')!;
  // 1961-03-25 00:15 UTC == the fixture's documented instant
  const jd = await transitJulianDayFor(new Date('1961-03-25T00:15:00Z'), wasmFileUrl());
  expect(Math.abs(jd - f.julianDayUt)).toBeLessThan(1e-9);
});

test('aggregate: transit-engine deltas observed during the run stay within 0.01°', () => {
  let maxDiff = 0;
  for (const f of fixtures) {
    const positions = transitAtFixtures.get(f.id)!;
    for (const body of TRANSIT_BODIES) {
      maxDiff = Math.max(maxDiff, Math.abs(positions.find((p) => p.body === body)!.longitude - f.reference.planets[body].lon));
    }
  }
  expect(maxDiff).toBeLessThanOrEqual(POS_TOL);
});

// ——— operating-timezone day key (Europe/Tallinn roll-over) ———

test('transiting bodies are Sun..Pluto plus the mean node, never the Moon', () => {
  expect(TRANSIT_BODIES).toHaveLength(10);
  expect(TRANSIT_BODIES).toContain('meanNode');
  expect(TRANSIT_BODIES).not.toContain('moon');
});

test('the day key belongs to Europe/Tallinn, not UTC: winter (UTC+2)', () => {
  expect(tallinnDayKey(new Date('2026-01-15T21:59:00Z'))).toBe('2026-01-15');
  expect(tallinnDayKey(new Date('2026-01-15T22:00:00Z'))).toBe('2026-01-16');
});

test('the day key belongs to Europe/Tallinn, not UTC: summer (UTC+3, EEST)', () => {
  expect(tallinnDayKey(new Date('2026-07-15T20:59:00Z'))).toBe('2026-07-15');
  expect(tallinnDayKey(new Date('2026-07-15T21:00:00Z'))).toBe('2026-07-16');
});

// ——— pure aspect/orb rules (synthetic longitudes, no WASM) ———

const T = (body: TransitPosition['body'], lon: number): TransitPosition => ({ body, longitude: lon });
const N = (lon: number): AspectInput => ({ id: 'sun' as const, longitude: lon });

test('square inside the 6° transit orb, outside 6.01° rejected', () => {
  expect(computeTransitHits([T('mars', 190)], [N(100)]).map((h) => h.aspect)).toEqual(['square']);
  expect(computeTransitHits([T('mars', 196.01)], [N(100)])).toHaveLength(0);
});

test('conjunction + opposition carry the widest transit orbs (8°)', () => {
  expect(TRANSIT_ORBS.conjunction).toBe(8);
  expect(TRANSIT_ORBS.opposition).toBe(8);
  expect(computeTransitHits([T('mars', 8)], [N(0)]).map((h) => h.aspect)).toEqual(['conjunction']);
  expect(computeTransitHits([T('mars', 8.01)], [N(0)])).toHaveLength(0);
  expect(computeTransitHits([T('mars', 188)], [N(0)]).map((h) => h.aspect)).toEqual(['opposition']);
  expect(computeTransitHits([T('mars', 188.01)], [N(0)])).toHaveLength(0);
});

test('sextile carries the tightest transit orb (4°)', () => {
  expect(computeTransitHits([T('mars', 63.99)], [N(0)]).map((h) => h.aspect)).toEqual(['sextile']);
  expect(computeTransitHits([T('mars', 64.01)], [N(0)])).toHaveLength(0);
});

test('a transit/natal pair yields at most one aspect', () => {
  const hits = computeTransitHits([T('jupiter', 45)], [N(45)]);
  expect(hits).toHaveLength(1);
  expect(hits[0]!.aspect).toBe('conjunction');
});

test('Asc targets keep the 60% orb tightening', () => {
  const asc: AspectInput = { id: 'asc', longitude: 100 };
  // separation 90 exactly: inside regardless; test the edge at ±6° without scaling and ±3.6° with it
  expect(computeTransitHits([T('mars', 193.59)], [asc]).map((h) => h.aspect)).toEqual(['square']);
  expect(computeTransitHits([T('mars', 193.61)], [asc])).toHaveLength(0);
  // same sky against a plain body target stays inside the unscaled orb
  expect(computeTransitHits([T('mars', 195.9)], [N(100)]).map((h) => h.aspect)).toEqual(['square']);
  expect(computeTransitHits([T('mars', 195.9)], [asc])).toHaveLength(0);
});

test('every hit names a natal-attached target; transit-to-transit pairs never appear', () => {
  const natal: AspectInput[] = [N(0), { id: 'mars', longitude: 120 }];
  const hits = computeTransitHits(
    [T('mars', 120), T('saturn', 0), T('sun', 0)],
    natal,
  );
  for (const hit of hits) {
    expect(['asc', 'mc', ...natal.map((n) => n.id)]).toContain(hit.target);
  }
});

test('nearestMiss names the pair closest to entering an aspect window', () => {
  // mercury 188.5° from a natal sun at 0°: opposition window is 8° wide,
  // so the pair sits 0.5° outside it; the same sky has no closer miss
  const miss = nearestMiss([T('mercury', 188.5)], [N(0)]);
  expect(miss).not.toBeNull();
  expect(miss!.aspect).toBe('opposition');
  expect(miss!.target).toBe('sun');
  expect(miss!.overBy).toBeCloseTo(0.5, 6);
});
