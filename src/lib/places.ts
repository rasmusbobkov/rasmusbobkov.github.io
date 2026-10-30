/**
 * Place search over the bundled offline dataset:
 * Estonian settlements (Europe/Tallinn) + major world cities with their IANA
 * timezone. No network geocoding at any point.
 *
 * The world-city dataset is code-split: it loads lazily on first use (when
 * the user starts typing a birth place), keeping the initial payload small.
 * Both datasets are 100% bundled/offline — no network ever.
 */
import { default as estoniaData } from '../data/estonia-places.json';

export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** IANA timezone id */
  tz: string;
  population: number;
}

interface RawRow {
  n: string;
  lat: number;
  lon: number;
  pop: number;
  tz: string;
}

function hydrate(rows: readonly RawRow[], tzOverride?: string): Place[] {
  return rows.map((r) => ({
    name: r.n,
    lat: r.lat,
    lon: r.lon,
    tz: tzOverride ?? r.tz,
    population: r.pop,
  }));
}

const ESTONIA = hydrate(estoniaData as RawRow[], 'Europe/Tallinn');

let worldCache: Place[] | null = null;

async function worldPlaces(): Promise<Place[]> {
  if (!worldCache) {
    const mod = (await import('../data/world-cities.json')) as unknown as { default: RawRow[] };
    worldCache = hydrate((mod.default as RawRow[]).filter((r) => r.tz.length > 0));
  }
  return worldCache;
}

/** õ/ä/ö/ü match their plain vowels; case-insensitive; NFC-normalized. */
function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replaceAll('õ', 'o')
    .replaceAll('ä', 'a')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .replaceAll('š', 's')
    .replaceAll('ž', 'z');
}

export interface SearchOptions {
  limit?: number;
}

export async function searchPlaces(query: string, opts: SearchOptions = {}): Promise<Place[]> {
  const limit = opts.limit ?? 9;
  const q = normalize(query.trim());
  if (q.length === 0) return [];
  const world = await worldPlaces();
  const scored: Array<{ place: Place; score: number }> = [];
  for (const place of [...ESTONIA, ...world]) {
    const key = normalize(place.name);
    if (key === q) {
      scored.push({ place, score: 0 });
    } else if (key.startsWith(q)) {
      scored.push({ place, score: 1 });
    } else if (key.includes(q)) {
      scored.push({ place, score: 2 });
    }
  }
  scored.sort((x, y) => {
    if (x.score !== y.score) return x.score - y.score;
    return y.place.population - x.place.population;
  });
  const out: Place[] = [];
  const seenNames = new Set<string>();
  for (const { place } of scored) {
    const key = `${normalize(place.name)}|${place.tz}`;
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    out.push(place);
    if (out.length >= limit) break;
  }
  return out;
}

/** For tests and fixtures: exact-name lookup within the bundled data. */
export async function findPlace(name: string): Promise<Place | undefined> {
  const q = normalize(name);
  const world = await worldPlaces();
  return [...ESTONIA, ...world].find((p) => normalize(p.name) === q);
}

export function placeLabel(place: Place): string {
  return place.name;
}
