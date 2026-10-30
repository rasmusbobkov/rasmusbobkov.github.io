/**
 * Place search over the bundled offline dataset:
 * Estonian settlements (Europe/Tallinn) + major world cities with their IANA
 * timezone. No network geocoding at any point.
 */
import estoniaData from '../data/estonia-places.json';
import worldData from '../data/world-cities.json';

export interface Place {
  name: string;
  lat: number;
  lon: number;
  /** IANA timezone id */
  tz: string;
  population: number;
  country: string;
}

interface RawRow {
  n: string;
  lat: number;
  lon: number;
  pop: number;
  tz: string;
  cc?: string;
}

function hydrate(rows: readonly RawRow[], country: string): Place[] {
  return rows.map((r) => ({
    name: r.n,
    lat: r.lat,
    lon: r.lon,
    tz: r.tz,
    population: r.pop,
    country,
  }));
}

const ESTONIA = hydrate(estoniaData as RawRow[], 'EE').map((p) => ({ ...p, tz: 'Europe/Tallinn' }));
const WORLD = hydrate(worldData as RawRow[], 'WORLD').filter((p) => p.tz.length > 0);

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

const INDEX_EE: ReadonlyArray<{ place: Place; key: string }> = ESTONIA.map((p) => ({
  place: p,
  key: normalize(p.name),
}));

const INDEX_WORLD: ReadonlyArray<{ place: Place; key: string }> = WORLD.map((p) => ({
  place: p,
  key: normalize(p.name),
}));

export interface SearchOptions {
  limit?: number;
}

export async function searchPlaces(query: string, opts: SearchOptions = {}): Promise<Place[]> {
  const limit = opts.limit ?? 9;
  const q = normalize(query.trim());
  if (q.length === 0) return [];
  const scored: Array<{ place: Place; score: number }> = [];
  for (const list of [INDEX_EE, INDEX_WORLD]) {
    for (const { place, key } of list) {
      if (key === q) {
        scored.push({ place, score: 0 });
      } else if (key.startsWith(q)) {
        scored.push({ place, score: 1 });
      } else if (key.includes(q)) {
        scored.push({ place, score: 2 });
      }
    }
  }
  scored.sort((x, y) => {
    if (x.score !== y.score) return x.score - y.score;
    if (x.place.country !== y.place.country) {
      // Estonian places first
      if (x.place.country === 'EE') return -1;
      if (y.place.country === 'EE') return 1;
      return (y.place.population - x.place.population);
    }
    return y.place.population - x.place.population;
  });
  const out: Place[] = [];
  const seenNames = new Set<string>();
  for (const { place } of scored) {
    const key = `${normalize(place.name)}|${place.country}`;
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    out.push(place);
    if (out.length >= limit) break;
  }
  return out;
}

/** For tests: the bundled dataset must cover the exact chart fixtures */
export function findPlace(name: string): Place | undefined {
  const q = normalize(name);
  return [...INDEX_EE, ...INDEX_WORLD].find(({ key }) => key === q)?.place;
}

export function placeLabel(place: Place): string {
  return place.name;
}
