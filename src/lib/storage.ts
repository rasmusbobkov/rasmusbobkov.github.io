/**
 * Local persistence: a versioned localStorage schema for birth data,
 * export to a JSON file, import back. Birth data stays in the browser.
 */
import type { BirthInput } from './time';

export const STORAGE_KEY = 'firstmate-astro.birth.v1';
export const STORAGE_VERSION = 1;

export interface StoredBirthData {
  schemaVersion: 1;
  /** ISO-style local date parts of the actual entry */
  date: { year: number; month: number; day: number };
  /** null when unknown */
  time: { hour: number; minute: number } | null;
  timeUnknown: boolean;
  place: { name: string; lat: number; lon: number; tz: string };
}

export function toStored(input: BirthInput & { placeName?: string }): StoredBirthData {
  return {
    schemaVersion: STORAGE_VERSION,
    date: { year: input.year, month: input.month, day: input.day },
    time: input.timeUnknown ? null : { hour: input.hour ?? 0, minute: input.minute ?? 0 },
    timeUnknown: input.timeUnknown,
    place: { name: input.placeName ?? '', lat: input.place.lat, lon: input.place.lon, tz: input.place.tz },
  };
}

export function toBirthInput(stored: StoredBirthData): BirthInput & { placeName: string } {
  return {
    year: stored.date.year,
    month: stored.date.month,
    day: stored.date.day,
    hour: stored.time?.hour ?? null,
    minute: stored.time?.minute ?? null,
    timeUnknown: stored.timeUnknown,
    place: { lat: stored.place.lat, lon: stored.place.lon, tz: stored.place.tz },
    placeName: stored.place.name,
  };
}

export function loadStoredBirthData(): StoredBirthData | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return validateStored(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function saveStoredBirthData(data: StoredBirthData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* storage full or blocked */ }
}

export function clearStoredBirthData(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage unavailable */ }
}

export function validateStored(value: unknown): StoredBirthData | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  if (v.schemaVersion !== STORAGE_VERSION) return null;
  const d = v.date as Record<string, unknown> | undefined;
  if (!d || typeof d.year !== 'number' || typeof d.month !== 'number' || typeof d.day !== 'number') return null;
  if (
    !Number.isFinite(d.year) || !Number.isFinite(d.month) || !Number.isFinite(d.day) ||
    d.year < 1800 || d.year > 2399
  ) return null;
  const p = v.place as Record<string, unknown> | undefined;
  if (!p || typeof p.lat !== 'number' || typeof p.lon !== 'number' || typeof p.tz !== 'string' || typeof p.name !== 'string') return null;
  if (
    !Number.isFinite(p.lat) || p.lat < -90 || p.lat > 90 ||
    !Number.isFinite(p.lon) || p.lon < -180 || p.lon > 180 ||
    p.tz.length === 0
  ) return null;
  let time: { hour: number; minute: number } | null = null;
  if (!v.timeUnknown) {
    const t = v.time as Record<string, unknown> | undefined;
    if (!t || typeof t.hour !== 'number' || typeof t.minute !== 'number') return null;
    time = { hour: t.hour, minute: t.minute };
  }
  return {
    schemaVersion: 1,
    date: { year: d.year, month: d.month, day: d.day },
    time,
    timeUnknown: Boolean(v.timeUnknown),
    place: { name: p.name, lat: p.lat, lon: p.lon, tz: p.tz },
  };
}

/** Export: produce the JSON text the user can save to a file. */
export function exportJson(data: StoredBirthData): string {
  return JSON.stringify({ app: 'firstmate-astro', exported: new Date().toISOString().slice(0, 10), birth: data }, null, 2);
}

/** Import: parse and validate an exported file's text. */
export function importJson(text: string): StoredBirthData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const v = parsed as Record<string, unknown>;
  if (v.app !== 'firstmate-astro' || typeof v.birth !== 'object' || v.birth === null) return null;
  return validateStored(v.birth);
}
