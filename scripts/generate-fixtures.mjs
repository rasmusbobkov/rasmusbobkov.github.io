/**
 * Fixture generator for the chart-engine correctness gate.
 *
 * Reference engine: the official Astrodienst Swiss Ephemeris C library 2.10.03
 * via the native `sweph` npm binding, driven with published .se1 ephemeris
 * files (sepl_18.se1, semo_18.se1, seas_18.se1 from the Swiss Ephemeris
 * distribution at astro.com / github.com/aloistr/swisseph).
 *
 * The generated JSON lives at tests/fixtures/natal-charts.json and is
 * committed. Regenerate only when the reference engine changes:
 *
 *   mkdir -p gen && cd gen && npm install sweph@2.10.3-8
 *   # and put the three .se1 files here too
 *   node scripts/generate-fixtures.mjs > tests/fixtures/natal-charts.json
 *
 * Each fixture's Sun position is independently pinned against NASA JPL
 * Horizons (Apparent ObsEclLon of date), recorded in the JSON.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const GEN_DIR = path.join(REPO_ROOT, 'gen');
if (!existsSync(path.join(GEN_DIR, 'node_modules', 'sweph'))) {
  console.error('Missing gen/node_modules/sweph — see the header of this script for setup.');
  process.exit(1);
}

const require = createRequire(path.join(GEN_DIR, 'index.js'));
const swe = require('sweph');
const KEY = swe.constants;
swe.set_ephe_path(GEN_DIR);

const FLG = KEY.SEFLG_SWIEPH | KEY.SEFLG_SPEED;
const BODIES = [
  ['sun', KEY.SE_SUN], ['moon', KEY.SE_MOON], ['mercury', KEY.SE_MERCURY],
  ['venus', KEY.SE_VENUS], ['mars', KEY.SE_MARS], ['jupiter', KEY.SE_JUPITER],
  ['saturn', KEY.SE_SATURN], ['uranus', KEY.SE_URANUS], ['neptune', KEY.SE_NEPTUNE],
  ['pluto', KEY.SE_PLUTO], ['meanNode', KEY.SE_MEAN_NODE],
];

// NASA JPL Horizons anchors, Apparent geocentric ObsEclLon of date (quantity 31),
// hand-fetched for each fixture instant; script asserts <= 0.001 deg agreement.
const SUN_HORIZONS = {
  'tallinn-1961': 4.1214810,
  'johannesburg-1975': 136.9880964,
  'reykjavik-1981': 90.0498801,
  'hongkong-1978': 218.7631915,
  'auckland-1990': 271.7564654,
};

const FIXTURES = [
  { id: 'tallinn-1961', date: [1961, 3, 25], time: '03:15', offsetMin: 180, place: 'Tallinn', lat: 59.4370, lon: 24.7536, tz: 'Europe/Tallinn', eraNote: 'Estonian SSR under Moscow time (UTC+03:00); DST was not in use in Estonia until 1981, so the historical offset differs from modern Europe/Tallinn rules' },
  { id: 'johannesburg-1975', date: [1975, 8, 10], time: '07:30', offsetMin: 120, place: 'Johannesburg', lat: -26.2025, lon: 28.0436, tz: 'Africa/Johannesburg', eraNote: 'UTC+02:00 constant since 1903, no DST' },
  { id: 'reykjavik-1981', date: [1981, 6, 21], time: '13:00', offsetMin: 0, place: 'Reykjavik', lat: 64.1355, lon: -21.8954, tz: 'Atlantic/Reykjavik', eraNote: 'UTC+00:00 permanent since 1968, subarctic latitude 64N' },
  { id: 'hongkong-1978', date: [1978, 11, 1], time: '21:15', offsetMin: 480, place: 'Hong Kong', lat: 22.3193, lon: 114.1694, tz: 'Asia/Hong_Kong', eraNote: 'UTC+08:00; the October 1978 DST period had already ended' },
  { id: 'auckland-1990', date: [1990, 12, 24], time: '09:30', offsetMin: 780, place: 'Auckland', lat: -36.8485, lon: 174.7633, tz: 'Pacific/Auckland', eraNote: 'NZDT UTC+13:00, Southern Hemisphere summer daylight saving time' },
];

const pad = (n) => String(n).padStart(2, '0');
function utcFromLocal(ymd, time, offsetMin) {
  const [h, m] = time.split(':').map(Number);
  const utcMs = Date.UTC(ymd[0], ymd[1] - 1, ymd[2], h, m, 0) - offsetMin * 60_000;
  const d = new Date(utcMs);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours() + d.getUTCMinutes() / 60, iso: d.toISOString().slice(0, 16) + 'Z' };
}

function round6(x) { return Math.round(x * 1e6) / 1e6; }

const out = [];
for (const f of FIXTURES) {
  const u = utcFromLocal(f.date, f.time, f.offsetMin);
  const jdUt = swe.julday(u.y, u.m, u.d, u.h, KEY.SE_GREG_CAL);
  const planets = {};
  for (const [name, num] of BODIES) {
    const r = swe.calc_ut(jdUt, num, FLG);
    if (r.flag !== FLG) throw new Error(`${f.id} ${name}: ${r.error}`);
    planets[name] = { lon: round6(r.data[0]), speed: round6(r.data[3]) };
  }
  const hres = swe.houses_ex2(jdUt, 0, f.lat, f.lon, 'P');
  if (hres.flag !== KEY.OK) throw new Error(`${f.id} houses: ${hres.error}`);
  const points = hres.data.points;
  const cusps = hres.data.houses;
  const houses = { asc: round6(points[0]), mc: round6(points[1]) };
  for (let i = 1; i <= 12; i++) houses['c' + i] = round6(cusps[i - 1]);

  const sunDiff = Math.abs(planets.sun.lon - SUN_HORIZONS[f.id]);
  if (sunDiff > 0.001) throw new Error(`${f.id}: Horizons sun anchor off by ${sunDiff}`);
  out.push({
    id: f.id,
    birth: {
      date: `${f.date[0]}-${pad(f.date[1])}-${pad(f.date[2])}`,
      time: f.time,
      place: f.place,
      lat: f.lat,
      lon: f.lon,
      tz: f.tz,
      offsetMinutes: f.offsetMin,
      utcInstant: u.iso,
      eraNote: f.eraNote,
    },
    julianDayUt: Number(jdUt.toFixed(9)),
    reference: { planets, houses },
    crossCheckHorizons: {
      body: 'sun',
      lonApparentEclipticOfDate: SUN_HORIZONS[f.id],
      maxAbsDiffDeg: round6(sunDiff),
    },
  });
  console.error(`${f.id}: jd=${jdUt.toFixed(6)} sun=${planets.sun.lon} asc=${houses.asc}`);
}

writeFileSync(path.join(REPO_ROOT, 'tests', 'fixtures', 'natal-charts.json'), JSON.stringify(out, null, 2) + '\n');
console.error('written: tests/fixtures/natal-charts.json');
