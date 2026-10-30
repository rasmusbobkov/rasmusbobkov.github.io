/**
 * Ephemeris access: Swiss Ephemeris compiled to WebAssembly (@swisseph/browser),
 * using the built-in Moshier ephemeris — entirely local, no ephemeris files
 * fetched anywhere. Moshier precision is ~0.1″ for planets and a few ″ for the
 * Moon (Swiss Ephemeris documentation), comfortably inside the project's
 * 0.01° correctness gate. The WASM asset is imported at build time by Vite
 * (`?url`), so the browser resolves it from our own origin.
 */
import { SwissEphemeris, Planet, HouseSystem, CalculationFlag } from '@swisseph/browser';
import type { PlanetaryPosition, HouseData } from '@swisseph/core';
export { Planet, HouseSystem, CalculationFlag };
export type { PlanetaryPosition, HouseData };

let swePromise: Promise<SwissEphemeris> | null = null;

export function getEphemeris(wasmUrl?: string): Promise<SwissEphemeris> {
  if (!swePromise) {
    swePromise = (async () => {
      const swe = new SwissEphemeris();
      await swe.init(wasmUrl);
      return swe;
    })();
    // a failed init must not poison the singleton for the rest of the session
    swePromise.catch(() => {
      swePromise = null;
    });
  }
  return swePromise;
}

const FLAGS = CalculationFlag.MoshierEphemeris | CalculationFlag.Speed;

export async function position(
  julianDay: number,
  body: Planet,
  wasmUrl?: string,
): Promise<PlanetaryPosition> {
  const swe = await getEphemeris(wasmUrl);
  return swe.calculatePosition(julianDay, body, FLAGS);
}

export async function houses(
  julianDay: number,
  latitude: number,
  longitude: number,
  wasmUrl?: string,
): Promise<HouseData> {
  const swe = await getEphemeris(wasmUrl);
  return swe.calculateHouses(julianDay, latitude, longitude, HouseSystem.Placidus);
}

/** Match the exact C symbol semantics: hours of UT in [0,24) folded from a full datetime */
export async function julianDay(
  year: number,
  month: number,
  day: number,
  hourDecimalUt: number,
  wasmUrl?: string,
): Promise<number> {
  const swe = await getEphemeris(wasmUrl);
  return swe.julianDay(year, month, day, hourDecimalUt);
}
