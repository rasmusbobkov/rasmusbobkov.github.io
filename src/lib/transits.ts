/**
 * Transit engine: the sky right now, read against the stored natal chart.
 * For the current moment (device clock, Europe/Tallinn as the operating
 * timezone) it computes geocentric ecliptic longitudes of the transiting
 * bodies Sun through Pluto plus the lunar node — the Moon is intentionally
 * not among them, because the Moon makes a full circuit every month and
 * would drown every day — and compares them against the natal placements
 * with the five major aspects at transit-work orbs.
 *
 * Everything here computes on the device through the existing ephemeris
 * seam (src/lib/ephemeris.ts); nothing is fetched and nothing is invented.
 */
import { ASPECTS, BODIES, type AspectKind, type BodyId } from './astro-constants';
import { position, julianDay } from './ephemeris';
import type { AspectInput, AspectParticipant, Chart } from './chart';
import { norm360, sep, ANGLE_ORB_FACTOR } from './chart';

export type { AspectParticipant, AspectInput };
import { DateTime } from 'luxon';

/** The timezone the daily reading is structured by, not the device's own. */
export const OPERATING_TZ = 'Europe/Tallinn';

export type TransitBody = Exclude<BodyId, 'moon'>;

/** Transiting bodies: Sun through Pluto plus the mean lunar node, no Moon. */
export const TRANSIT_BODIES = BODIES
  .filter((b) => b.id !== 'moon')
  .map((b) => b.id) as readonly TransitBody[];

export function sweNumberOf(body: TransitBody): number {
  return BODIES.find((b) => b.id === body)!.sweNumber;
}

/**
 * Per-aspect orbs for transit work — tighter than the natal orbs in
 * astro-constants.ts, as is standard practice when a moving body is read
 * against a fixed chart. Sources of practice we align with: the aspect
 * windows tighten with the narrowest (sextile) first and the two
 * confluence angles (conjunction/opposition) last; Asc/MC targets keep the
 * same 60% tightening the natal engine uses (ANGLE_ORB_FACTOR from
 * chart.ts), because an angle is whole-degree-sensitive.
 */
export const TRANSIT_ORBS: Readonly<Record<AspectKind, number>> = {
  conjunction: 8,
  opposition: 8,
  square: 6,
  trine: 6,
  sextile: 4,
};

export interface TransitPosition {
  readonly body: TransitBody;
  /** geocentric ecliptic longitude of date, degrees 0..360 */
  readonly longitude: number;
}

export interface TransitHit {
  readonly transitBody: TransitBody;
  readonly aspect: AspectKind;
  /** where the transit lands in the natal chart (body, or an angle) */
  readonly target: AspectParticipant;
  readonly targetLongitude: number;
  readonly transitLongitude: number;
  /** actual angular separation, degrees 0..180 */
  readonly separation: number;
  /** how many degrees the separation deviates from the exact angle */
  readonly orbDegrees: number;
  /** the aspect's transit work orb in degrees (already angle-scaled) */
  readonly workOrb: number;
}

/** A transit/natal pair that stayed outside every aspect window: the
 * honest material for the quiet-day "why" panel. */
export interface NearestMiss {
  readonly transitBody: TransitBody;
  readonly target: AspectParticipant;
  readonly aspect: AspectKind;
  /** the aspect's work orb the pair stayed outside */
  readonly workOrb: number;
  /** how many degrees beyond that orb the pair sits */
  readonly overBy: number;
}

function targetOrbScale(target: AspectParticipant): number {
  return target === 'asc' || target === 'mc' ? ANGLE_ORB_FACTOR : 1;
}

/**
 * The five major aspects between the transiting bodies and the natal
 * targets. Pure function — no ephemeris — so tests can pin its behaviour
 * without WASM. A pair yields at most one aspect: the windows cannot
 * overlap while the orbs stay inside each other's gaps.
 */
export function computeTransitHits(
  transit: readonly TransitPosition[],
  natal: readonly AspectInput[],
): TransitHit[] {
  const out: TransitHit[] = [];
  for (const t of transit) {
    for (const n of natal) {
      const scale = targetOrbScale(n.id);
      const separation = sep(t.longitude, n.longitude);
      for (const def of ASPECTS) {
        const workOrb = TRANSIT_ORBS[def.kind] * scale;
        const dev = Math.abs(separation - def.angle);
        if (dev <= workOrb) {
          out.push({
            transitBody: t.body,
            aspect: def.kind,
            target: n.id,
            targetLongitude: norm360(n.longitude),
            transitLongitude: norm360(t.longitude),
            separation,
            orbDegrees: dev,
            workOrb,
          });
          break;
        }
      }
    }
  }
  return out;
}

/** The pair closest to *entering* an aspect window across all transits and
 * targets; null when nothing sits outside a window worth naming. */
export function nearestMiss(
  transit: readonly TransitPosition[],
  natal: readonly AspectInput[],
): NearestMiss | null {
  let best: NearestMiss | null = null;
  for (const t of transit) {
    for (const n of natal) {
      const scale = targetOrbScale(n.id);
      const separation = sep(t.longitude, n.longitude);
      for (const def of ASPECTS) {
        const workOrb = TRANSIT_ORBS[def.kind] * scale;
        const dev = Math.abs(separation - def.angle);
        if (dev <= workOrb) continue; // in-window pairs are hits, not misses
        const overBy = dev - workOrb;
        if (best === null || overBy < best.overBy) {
          best = { transitBody: t.body, target: n.id, aspect: def.kind, workOrb, overBy };
        }
      }
    }
  }
  return best;
}

/** The day key of the current moment in the operating timezone. */
export function tallinnDayKey(now: Date): string {
  return DateTime.fromJSDate(now).setZone(OPERATING_TZ).toISODate()!;
}

/** Local clock time of the moment in the operating timezone (HH:mm). */
export function tallinnClockTime(now: Date): string {
  return DateTime.fromJSDate(now).setZone(OPERATING_TZ).toFormat('HH:mm');
}

/** Julian Day UT for an instant, through the unchanged ephemeris seam. */
export async function transitJulianDayFor(now: Date, wasmUrl?: string): Promise<number> {
  const utc = DateTime.fromJSDate(now).toUTC();
  return julianDay(
    utc.year, utc.month, utc.day,
    utc.hour + utc.minute / 60 + utc.second / 3600 + utc.millisecond / 3_600_000,
    wasmUrl,
  );
}

/** Geocentric ecliptic longitudes of the transiting bodies at a Julian Day. */
export async function transitPositionsAt(jdUt: number, wasmUrl?: string): Promise<TransitPosition[]> {
  const out: TransitPosition[] = [];
  for (const body of TRANSIT_BODIES) {
    const pos = await position(jdUt, sweNumberOf(body), wasmUrl);
    out.push({ body, longitude: norm360(pos.longitude) });
  }
  return out;
}

/** The natal chart as a list of aspect targets: every body, plus the two
 * angles when the birth time is known. */
export function natalAspectTargets(chart: Chart): AspectInput[] {
  const inputs: AspectInput[] = chart.placements.map((p) => ({ id: p.body, longitude: p.longitude }));
  if (chart.ascendant) inputs.push({ id: 'asc', longitude: chart.ascendant.longitude });
  if (chart.mediumCoeli) inputs.push({ id: 'mc', longitude: chart.mediumCoeli.longitude });
  return inputs;
}

export interface CurrentReading {
  /** the operating-timezone day the reading belongs to, YYYY-MM-DD */
  readonly dayKey: string;
  /** clock time of the moment in the operating timezone, HH:mm */
  readonly tallinnTime: string;
  readonly positions: TransitPosition[];
  readonly hits: TransitHit[];
}

/** The full reading of the current moment against a natal chart. */
export async function currentTransitReading(
  now: Date,
  chart: Chart,
  wasmUrl?: string,
): Promise<CurrentReading> {
  const jdUt = await transitJulianDayFor(now, wasmUrl);
  const positions = await transitPositionsAt(jdUt, wasmUrl);
  return {
    dayKey: tallinnDayKey(now),
    tallinnTime: tallinnClockTime(now),
    positions,
    hits: computeTransitHits(positions, natalAspectTargets(chart)),
  };
}
