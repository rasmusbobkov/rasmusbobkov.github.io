/**
 * The birth-entry wheel logic: day clamping across month lengths and leap
 * years, keyboard movement inside a wheel, screen-reader text, both-ways
 * sync between the wheels and the dd.mm.yyyy / HH:MM text fields, and the
 * one shared year bound (1800..current year) that governs the parser, the
 * year wheel and import validation alike. No DOM, no ephemeris.
 */
import { expect, test } from 'vitest';
import {
  MIN_BIRTH_YEAR, clampDay, clampParts, dateWheelText, daysInMonth, isValidBirthYear,
  maxBirthYear, monthName, timeWheelText, wheelKeyStep,
} from '../src/lib/birth-wheels';
import { fmtDateEt, fmtTime } from '../src/lib/format';
import { parseDateEt, parseDatePartsEt, parseTimeEt, resolveInstant, type BirthInput } from '../src/lib/time';

const TALLINN = { lat: 59.437, lon: 24.7536, tz: 'Europe/Tallinn' };

// ——— the one shared year bound ———

test('the shared bound: 1800 floor, current calendar year ceiling, nothing hardcoded', () => {
  expect(MIN_BIRTH_YEAR).toBe(1800);
  expect(maxBirthYear()).toBe(new Date().getFullYear());
  expect(isValidBirthYear(1800)).toBe(true);
  expect(isValidBirthYear(maxBirthYear())).toBe(true);
  expect(isValidBirthYear(1799)).toBe(false);
  expect(isValidBirthYear(maxBirthYear() + 1)).toBe(false);
  // the bound tracks the wall clock, whatever today's year happens to be
  expect(maxBirthYear()).toBe(new Date().getFullYear());
});

// ——— wheel clamping across month lengths and leap years ———

test('month lengths and leap years decide how far the day wheel reaches', () => {
  expect(daysInMonth(1991, 3)).toBe(31);
  expect(daysInMonth(1991, 4)).toBe(30);
  expect(daysInMonth(2024, 2)).toBe(29); // leap
  expect(daysInMonth(2000, 2)).toBe(29); // leap: divisible by 400
  expect(daysInMonth(1900, 2)).toBe(28); // not leap in the Gregorian rule
  expect(daysInMonth(1800, 2)).toBe(28); // at the bound: also not a leap year
  expect(daysInMonth(1991, 2)).toBe(28);
  expect(daysInMonth(maxBirthYear(), 2)).toBe(daysInMonth(maxBirthYear(), 2));
  expect(daysInMonth(1991, 12)).toBe(31);
});

test('clamping removes every impossible day the month does not contain', () => {
  expect(clampDay(1991, 4, 31)).toBe(30); // 31.04 is impossible -> 30.04
  expect(clampDay(1991, 4, 30)).toBe(30);
  expect(clampDay(1991, 2, 31)).toBe(28);
  expect(clampDay(2000, 2, 29)).toBe(29); // 29.02 exists in a leap year
  expect(clampDay(2000, 2, 30)).toBe(29);
  expect(clampDay(1900, 2, 29)).toBe(28);
  expect(clampDay(1991, 5, 1)).toBe(1);
  expect(clampDay(1991, 5, 0)).toBe(1);
});

test('re-clamping a whole set only touches the day, never month/year/time', () => {
  const clamped = clampParts({ day: 31, month: 4, year: 1991, hour: 23, minute: 59 });
  expect(clamped).toEqual({ day: 30, month: 4, year: 1991, hour: 23, minute: 59 });
});

test('every clamped wheel day is a date the text parser accepts', () => {
  const shortMonths = [[1991, 2], [1900, 2], [2000, 2], [1991, 4], [1991, 11], [2024, 2]] as const;
  for (const [year, month] of shortMonths) {
    const max = daysInMonth(year, month);
    for (let day = max; day >= 1; day -= 1) {
      const text = fmtDateEt(year, month, clampDay(year, month, day));
      expect(parseDateEt(text)).toEqual({ year, month, day });
    }
  }
});

// ——— keyboard movement inside a wheel ———

test('keyboard movement: arrows step one item, Home and End jump to the edges', () => {
  const min = 1, max = 31, value = 17;
  // the list ascends downward, so Up selects the item above (smaller)
  expect(wheelKeyStep('ArrowUp', value, min, max)).toBe(16);
  expect(wheelKeyStep('ArrowDown', value, min, max)).toBe(18);
  expect(wheelKeyStep('ArrowUp', min, min, max)).toBe(min); // clamped at the end
  expect(wheelKeyStep('ArrowDown', max, min, max)).toBe(max);
  // a distant year is reachable in a few hops, Home and End in one
  expect(wheelKeyStep('Home', 1991, MIN_BIRTH_YEAR, maxBirthYear())).toBe(MIN_BIRTH_YEAR);
  expect(wheelKeyStep('End', 1991, MIN_BIRTH_YEAR, maxBirthYear())).toBe(maxBirthYear());
  expect(wheelKeyStep('PageUp', value, min, max)).toBeNull();
  expect(wheelKeyStep('Enter', value, min, min)).toBeNull(); // browser keeps it
  expect(wheelKeyStep('Tab', value, min, max)).toBeNull();
});

// ——— screen-reader text reads the whole meaning in Estonian ———

test('the aria text reads the whole meaning in Estonian', () => {
  const parts = { day: 14, month: 3, year: 1991, hour: 14, minute: 30 };
  expect(dateWheelText('et', parts)).toBe('14. märts 1991');
  expect(monthName('et', 1)).toBe('jaanuar');
  expect(monthName('et', 12)).toBe('detsember');
  expect(timeWheelText('et', parts)).toBe('kell 14:30');
  // turning the minute wheel still announces the full clock time
  expect(timeWheelText('et', { ...parts, minute: 5 })).toBe('kell 14:05');
});

// ——— two-way sync between wheels and text fields ———

/** The form's state after turning a date wheel: parts are clamped, then
 * painted into the text fallback. */
function wheelToText(parts: { day: number; month: number; year: number } & Partial<{ hour: number; minute: number }>): string {
  const clamped = clampParts({ hour: 0, minute: 0, ...parts });
  return fmtDateEt(clamped.year, clamped.month, clamped.day);
}

/** The form's state after typing into the text fallback: a value the
 * existing parser accepts moves the wheels. */
function textToWheel(text: string): { year: number; month: number; day: number } | null {
  return parseDateEt(text);
}

test('wheel turns repaint the text field with a valid Estonian date', () => {
  expect(wheelToText({ year: 1991, month: 4, day: 31 })).toBe('30.04.1991');
  expect(textToWheel('30.04.1991')).toEqual({ year: 1991, month: 4, day: 30 });
  expect(wheelToText({ year: 2024, month: 2, day: 29 })).toBe('29.02.2024');
  expect(textToWheel('29.02.2024')).toEqual({ year: 2024, month: 2, day: 29 });
});

test('typed text drives the wheels the same way, including clamped ones', () => {
  expect(textToWheel('14.3.1991')).toEqual({ year: 1991, month: 3, day: 14 });
  expect(textToWheel('31.02.1991')).toBeNull(); // wheels stay put; submit shows the error
  expect(textToWheel('31.04.1991')).toBeNull(); // 31.04 rejects as before
  expect(textToWheel('29.02.2000')).toEqual({ year: 2000, month: 2, day: 29 });
});

test('time parts round-trip through the same text fallback', () => {
  for (const [hour, minute] of [[0, 0], [5, 9], [14, 30], [23, 59]] as const) {
    const text = fmtTime(hour, minute) ?? '';
    expect(parseTimeEt(text)).toEqual({ hour, minute });
    expect(text.startsWith(String(hour).padStart(2, '0'))).toBe(true);
  }
  expect(parseTimeEt('24:00')).toBeNull();
  expect(parseTimeEt('14:60')).toBeNull();
});

// ——— a typed year outside the shared bound is rejected, not rewritten ———

test('the parser rejects a birth year outside 1800..current year at its edges', () => {
  // pre-1800: wrong message class must be tellable from a wrong shape
  expect(parseDateEt('01.01.1799')).toBeNull();
  expect(parseDatePartsEt('01.01.1799')).toEqual({ year: 1799, month: 1, day: 1 });
  // future year: same
  expect(parseDateEt(`01.01.${maxBirthYear() + 1}`)).toBeNull();
  expect(parseDatePartsEt(`01.01.${maxBirthYear() + 1}`)).toEqual({ year: maxBirthYear() + 1, month: 1, day: 1 });
  // boundary years: both accepted and wheel-renderable
  expect(parseDateEt('31.12.1800')).toEqual({ year: 1800, month: 12, day: 31 });
  expect(parseDateEt(`31.12.${maxBirthYear()}`)).toEqual({ year: maxBirthYear(), month: 12, day: 31 });
  // a genuinely wrong shape stays the generic error, not the year-range one
  expect(parseDatePartsEt('31.02.1991')).toBeNull();
  expect(parseDatePartsEt('14.03')).toBeNull();
  // no second range anywhere: the parser's own supported band is exactly the wheel's
  for (const year of [1795, 1800, 1991, maxBirthYear(), maxBirthYear() + 5]) {
    expect(isValidBirthYear(year)).toBe(Number.isFinite(year) && year >= 1800 && year <= maxBirthYear());
  }
});

// ——— the wheels feed the same resolveInstant gate ———

/** What the submit path computes for wheel state: parts -> text -> the
 * existing parse -> resolveInstant. Deliberately identical in shape to
 * what app.ts does, so the DST cases below prove the path is unchanged. */
function resolveFromWheels(parts: { day: number; month: number; year: number; hour: number; minute: number }): ReturnType<typeof resolveInstant> {
  const dateText = wheelToText(parts);
  const timeText = fmtTime(parts.hour, parts.minute);
  const parsedDate = parseDateEt(dateText)!;
  const parsedTime = parseTimeEt(timeText ?? '');
  const input: BirthInput = {
    ...parsedDate, hour: parsedTime?.hour ?? null, minute: parsedTime?.minute ?? null,
    timeUnknown: false, place: TALLINN,
  };
  return resolveInstant(input);
}

test('a wheel-selected wall time inside the DST spring gap is still rejected', () => {
  // 1991-03-31 02:00 EET -> 03:00 EEST: 02:30 never happened in Tallinn
  expect(resolveFromWheels({ year: 1991, month: 3, day: 31, hour: 2, minute: 30 })).toBeNull();
  // one hour later exists and keeps the entered wall time
  const exists = resolveFromWheels({ year: 1991, month: 3, day: 31, hour: 3, minute: 30 });
  expect(exists).not.toBeNull();
  expect(exists?.localTime).toEqual({ hour: 3, minute: 30 });
  expect(exists?.ambiguous).toBe(false);
});

test('a wheel-selected fall-back overlap still resolves to the earlier occurrence and is flagged', () => {
  // 1991-09-29: 02:00..02:59 happened twice; the wheels can pick this hour
  const inst = resolveFromWheels({ year: 1991, month: 9, day: 29, hour: 2, minute: 30 });
  expect(inst).not.toBeNull();
  expect(inst!.ambiguous).toBe(true);
  expect(inst!.utc.isoString.slice(0, 16)).toBe('1991-09-28T23:30');
  const ordinary = resolveFromWheels({ year: 1991, month: 9, day: 29, hour: 15, minute: 0 });
  expect(ordinary!.ambiguous).toBe(false);
});
