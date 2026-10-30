/**
 * Chart engine: orchestrates the Swiss Ephemeris WASM (Moshier mode) into a
 * full natal chart model — planetary longitudes, retrograde flags, Placidus
 * houses, major aspects with standard orbs — plus the honest handling of a
 * missing birth time: planets and signs computed, houses and the Rising
 * sign never guessed.
 */
import { Planet, position, houses as sweHouses, julianDay } from './ephemeris';
import { BODIES, ASPECTS, type AspectKind, type BodyId, type HouseNumber } from './astro-constants';
import type { BirthInstant } from './time';
import type { PlanetaryPosition } from '@swisseph/core';

export interface Placement {
  body: BodyId;
  /** geocentric ecliptic longitude of date, degrees 0..360 */
  longitude: number;
  signNum: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** degrees inside the sign, 0..29.999 */
  degreeInSign: number;
  retrograde: boolean;
  /** house the body occupies; null when the birth time is unknown */
  house: HouseNumber | null;
}

export interface HouseCusp {
  house: HouseNumber;
  cuspLongitude: number;
  signNum: number;
  degreeInSign: number;
}

export interface ChartAspect {
  kind: AspectKind;
  a: AspectParticipant;
  b: AspectParticipant;
  /** actual angular separation, degrees 0..180 */
  separation: number;
  /** how many degrees the separation deviates from the exact angle */
  orbDegrees: number;
}

export interface Chart {
  julianDayUt: number;
  placements: Placement[];
  houses: HouseCusp[] | null;
  ascendant: { longitude: number; signNum: number; degreeInSign: number } | null;
  mediumCoeli: { longitude: number; signNum: number; degreeInSign: number } | null;
  aspects: ChartAspect[];
  timeUnknown: boolean;
  place: { lat: number; lon: number; tz: string };
}

export function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

export function sep(a: number, b: number): number {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

export function signOf(longitude: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 {
  const l = norm360(longitude);
  return (Math.floor(l / 30) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export function degreeInSign(longitude: number): number {
  return norm360(longitude) % 30;
}

/** id exposed to aspect participants, including the two angles when known */
export type AspectParticipant = BodyId | 'asc' | 'mc';

/** Placidus Asc/MC participate in aspects with tighter orbs (standard practice) */
const ANGLE_ORB_FACTOR = 0.6;

export interface AspectInput {
  id: AspectParticipant;
  longitude: number;
}

/**
 * The five major aspects between participants. When an Asc or MC takes part,
 * its orb is scaled by ANGLE_ORB_FACTOR. Pure function — no ephemeris — so
 * tests can pin its behaviour without WASM.
 */
export function computeAspects(inputs: readonly AspectInput[]): ChartAspect[] {
  const out: ChartAspect[] = [];
  for (let i = 0; i < inputs.length; i++) {
    for (let j = i + 1; j < inputs.length; j++) {
      const a = inputs[i]!;
      const b = inputs[j]!;
      const isAngle = (p: AspectInput) => p.id === 'asc' || p.id === 'mc';
      if (isAngle(a) && isAngle(b)) continue; // angles do not aspect each other
      const separation = sep(a.longitude, b.longitude);
      const factor = isAngle(a) || isAngle(b) ? ANGLE_ORB_FACTOR : 1;
      for (const def of ASPECTS) {
        const dev = Math.abs(separation - def.angle);
        if (dev <= def.orb * factor) {
          out.push({
            kind: def.kind,
            a: a.id,
            b: b.id,
            separation,
            orbDegrees: dev,
          });
          break;
        }
      }
    }
  }
  return out;
}

export function houseOf(longitude: number, cusps: HouseCusp[] | null): HouseNumber | null {
  if (!cusps) return null;
  for (let i = 0; i < cusps.length; i++) {
    const next = cusps[(i + 1) % 12];
    const c0 = cusps[i].cuspLongitude;
    const span = norm360(next.cuspLongitude - c0);
    const rel = norm360(longitude - c0);
    if (rel < span) return cusps[i].house;
  }
  return cusps[0].house;
}

function bodyToPlanet(id: BodyId): Planet {
  return BODIES.find((b) => b.id === id)!.sweNumber as Planet;
}

export async function computeChart(instant: BirthInstant, wasmUrl?: string): Promise<Chart> {
  const jdUt = await julianDay(
    instant.utc.year, instant.utc.month, instant.utc.day,
    instant.utc.hourDecimal, wasmUrl,
  );

  const placements: Placement[] = [];
  for (const body of BODIES) {
    const pos: PlanetaryPosition = await position(jdUt, bodyToPlanet(body.id), wasmUrl);
    placements.push({
      body: body.id,
      longitude: norm360(pos.longitude),
      signNum: signOf(pos.longitude),
      degreeInSign: degreeInSign(pos.longitude),
      retrograde: pos.longitudeSpeed < 0,
      house: null,
    });
  }

  let cusps: HouseCusp[] | null = null;
  let ascendant: Chart['ascendant'] = null;
  let mc: Chart['mediumCoeli'] = null;

  if (!instant.timeUnknown) {
    const hd = await sweHouses(jdUt, instant.place.lat, instant.place.lon, wasmUrl);
    const cuspList = Array.from(hd.cusps);
    // the WASM houses call returns a leading placeholder: index 0 is not a cusp
    cusps = [];
    for (let i = 1; i <= 12; i++) {
      const lon = cuspList[i]!;
      cusps.push({
        house: i as HouseNumber,
        cuspLongitude: norm360(lon),
        signNum: signOf(lon),
        degreeInSign: degreeInSign(lon),
      });
    }
    const ascLon = hd.ascendant;
    const mcLon = hd.mc;
    ascendant = { longitude: norm360(ascLon), signNum: signOf(ascLon), degreeInSign: degreeInSign(ascLon) };
    mc = { longitude: norm360(mcLon), signNum: signOf(mcLon), degreeInSign: degreeInSign(mcLon) };
  }

  for (const p of placements) {
    p.house = houseOf(p.longitude, cusps);
  }

  const aspectInputs: AspectInput[] = placements.map((p) => ({ id: p.body, longitude: p.longitude }));
  if (ascendant) aspectInputs.push({ id: 'asc', longitude: ascendant.longitude });
  if (mc) aspectInputs.push({ id: 'mc', longitude: mc.longitude });

  return {
    julianDayUt: jdUt,
    placements,
    houses: cusps,
    ascendant,
    mediumCoeli: mc,
    aspects: computeAspects(aspectInputs),
    timeUnknown: instant.timeUnknown,
    place: instant.place,
  };
}
