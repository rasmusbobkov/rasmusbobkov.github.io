/**
 * Pure-logic tests: aspect classification, storage schema, share fragment.
 * No ephemeris needed.
 */
import { expect, test } from 'vitest';
import { computeAspects, sep, norm360, signOf } from '../src/lib/chart';
import { encodeShareFragment, decodeShareFragment } from '../src/lib/share';
import { toStored, validateStored, exportJson, importJson } from '../src/lib/storage';
import { fmtDegComma, fmtDateEt } from '../src/lib/format';
import { parseDateEt, parseTimeEt, resolveInstant, type BirthInput } from '../src/lib/time';

test('sep measures angular distance on the circle', () => {
  expect(sep(10, 15)).toBe(5);
  expect(sep(355, 5)).toBe(10);
  expect(sep(5, 355)).toBe(10);
  expect(norm360(-30)).toBe(330);
  expect(signOf(359.9)).toBe(12);
  expect(signOf(30)).toBe(2);
});

test('the five aspects with their standard orbs', () => {
  // conjunction <= 10
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 5 }])).toHaveLength(1);
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 10.5 }])).toHaveLength(0);
  // sextile <= 6
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 60.4 }])[0]?.kind).toBe('sextile');
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 66.5 }])).toHaveLength(0);
  // square <= 8
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 92 }])[0]?.kind).toBe('square');
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 99 }])).toHaveLength(0);
  // trine <= 8
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 124 }])[0]?.kind).toBe('trine');
  // opposition <= 10
  expect(computeAspects([{ id: 'sun' as const, longitude: 0 }, { id: 'moon' as const, longitude: 175 }])[0]?.kind).toBe('opposition');
});

test('Asc/MC participate with tighter orbs', () => {
  const res = computeAspects([
    { id: 'sun', longitude: 0 },
    { id: 'asc', longitude: 5.5 },
  ]);
  expect(res[0]?.kind).toBe('conjunction');
  // tighter cutoff: 10 deg * 0.6 = 6 deg max for angle aspects
  const tighter = computeAspects([
    { id: 'sun', longitude: 0 },
    { id: 'asc', longitude: 6.5 },
  ]);
  expect(tighter).toHaveLength(0);
});

test('angles do not aspect each other', () => {
  const res = computeAspects([
    { id: 'asc', longitude: 0 },
    { id: 'mc', longitude: 90 },
  ]);
  expect(res).toHaveLength(0);
});

test('storage schema round-trips and validates', () => {
  const input = {
    year: 1991, month: 3, day: 14, hour: 14, minute: 30, timeUnknown: false,
    place: { lat: 59.437, lon: 24.7536, tz: 'Europe/Tallinn' }, placeName: 'Tallinn',
  };
  const stored = toStored(input);
  expect(stored.schemaVersion).toBe(1);
  const back = validateStored(stored);
  expect(back).not.toBeNull();
  expect(importJson(exportJson(back!))!.place.name).toBe('Tallinn');
  expect(validateStored({ schemaVersion: 99, date: {}, place: {}, time: {} })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1.5, month: 1, day: 1 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 'a', minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 999, lon: 1, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 999, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: '' }, time: { hour: 0, minute: 0 } })).toBeNull();
  // dates and times that the entry path itself can never produce
  expect(validateStored({ schemaVersion: 1, date: { year: 19991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 13, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 32 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 2, day: 30 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 0, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 25, minute: 0 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: false, place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: { hour: 0, minute: -30 } })).toBeNull();
  expect(validateStored({ schemaVersion: 1, date: { year: 1991, month: 3, day: 14 }, timeUnknown: 'yes', place: { name: 'x', lat: 1, lon: 1, tz: 'x' }, time: null })).toBeNull();
});

test('share fragment carries only the big three and nothing about birth data', () => {
  const placements = [
    { body: 'sun' as const, longitude: 273.5, signNum: 10 as const, degreeInSign: 3.5, retrograde: false, house: 11 as const },
    { body: 'moon' as const, longitude: 155.2, signNum: 6 as const, degreeInSign: 5.2, retrograde: true, house: 4 as const },
  ];
  const enc = encodeShareFragment(placements, { signNum: 3, degreeInSign: 12.2 });
  expect(enc).toBe('p4=S10:3.5,M6:5.2,R3:12.2');
  const dec = decodeShareFragment('#' + enc);
  expect(dec).toEqual({
    sun: { signNum: 10, degree: 3.5 },
    moon: { signNum: 6, degree: 5.2 },
    rising: { signNum: 3, degree: 12.2 },
  });
  const noTime = decodeShareFragment('#p4=S3:4.5,fmt=14:30,x=lat:59');
  expect(noTime).toEqual({ sun: { signNum: 3, degree: 4.5 }, moon: null, rising: null });
  expect(decodeShareFragment('#time=14:30&lat=59')).toBeNull();
});

test('formatting: decimal comma and dd.mm.yyyy', () => {
  expect(fmtDegComma(11.76)).toBe('11,8');
  expect(fmtDegComma(29.96)).toBe('30,0');
  expect(fmtDateEt(1991, 3, 14)).toBe('14.03.1991');
  expect(parseDateEt('14.3.1991')).toEqual({ year: 1991, month: 3, day: 14 });
  expect(parseDateEt('1991-03-14')).toBeNull();
  expect(parseDateEt('31.2.1991')).toBeNull(); // nonexistent date
  expect(parseTimeEt('9:05')).toEqual({ hour: 9, minute: 5 });
  expect(parseTimeEt('24:00')).toBeNull();
  expect(parseTimeEt('14:60')).toBeNull();
});

test('a wall time inside a DST spring gap is rejected, not forward-shifted', () => {
  const base = {
    year: 1990, month: 3, day: 25, hour: 2, minute: 30, timeUnknown: false,
    place: { lat: 59.437, lon: 24.7536, tz: 'Europe/Tallinn' },
  } satisfies BirthInput;
  // 1990-03-25 02:00 EET -> 03:00 EEST: 02:30 never happened in Tallinn
  expect(resolveInstant(base)).toBeNull();
  // the same clock time one hour later exists and keeps the entered wall time
  const exists = resolveInstant({ ...base, hour: 3, minute: 30 });
  expect(exists).not.toBeNull();
  expect(exists?.localTime).toEqual({ hour: 3, minute: 30 });
  expect(exists?.offsetMinutes).toBe(180);
  expect(exists?.utc.isoString.slice(0, 16)).toBe('1990-03-25T00:30');
  expect(exists?.ambiguous).toBe(false);
});

test('a wall time inside a DST fall-back overlap resolves to the earlier occurrence and is flagged', () => {
  const input = {
    year: 1991, month: 9, day: 29, hour: 2, minute: 30, timeUnknown: false,
    place: { lat: 59.437, lon: 24.7536, tz: 'Europe/Tallinn' },
  } satisfies BirthInput;
  // IANA Europe/Tallinn fell back 02:59:59 EEST (UTC+3) -> 02:00 EET (UTC+2)
  // on 1991-09-29, so the wall clock 02:00..02:59 happened twice; the two
  // occurrences are 1991-09-28T23:30Z and 1991-09-29T00:30Z
  const inst = resolveInstant(input);
  expect(inst).not.toBeNull();
  expect(inst!.ambiguous).toBe(true);
  expect(inst!.utc.isoString.slice(0, 16)).toBe('1991-09-28T23:30');
  expect(inst!.offsetMinutes).toBe(180);
  expect(inst!.localTime).toEqual({ hour: 2, minute: 30 });
  // an ordinary time on the same folded calendar day is unambiguous
  const ordinary = resolveInstant({ ...input, hour: 15, minute: 0 });
  expect(ordinary!.ambiguous).toBe(false);
  expect(ordinary!.utc.isoString.slice(0, 16)).toBe('1991-09-29T13:00');
  // an unknown birth time has no entered wall time to be ambiguous about
  const unknown = resolveInstant({ ...input, hour: null, minute: null, timeUnknown: true });
  expect(unknown!.ambiguous).toBe(false);
});
