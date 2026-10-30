/**
 * The birth-entry slider logic: day clamping across month lengths and leap
 * years, keyboard steps, screen-reader text, both-ways sync between the
 * sliders and the dd.mm.yyyy / HH:MM text fields — and proof that the
 * slider path ends in the same resolveInstant gate, so DST-gap rejection
 * and the fall-back notice behave exactly as before the sliders existed.
 * No DOM, no ephemeris.
 */
import { expect, test } from 'vitest';
import {
  clampDay, clampParts, dateAriaText, daysInMonth, keyboardStep,
  monthName, timeAriaText,
} from '../src/lib/birth-parts';
import { fmtDateEt, fmtTime } from '../src/lib/format';
import { parseDateEt, parseTimeEt, resolveInstant, type BirthInput } from '../src/lib/time';

const TALLINN = { lat: 59.437, lon: 24.7536, tz: 'Europe/Tallinn' };

// ——— day slider max follows the selected month and year ———

test('month lengths and leap years decide how far the day slider reaches', () => {
  expect(daysInMonth(1991, 3)).toBe(31);
  expect(daysInMonth(1991, 4)).toBe(30);
  expect(daysInMonth(2024, 2)).toBe(29); // leap
  expect(daysInMonth(2000, 2)).toBe(29); // leap: divisible by 400
  expect(daysInMonth(1900, 2)).toBe(28); // not leap in the Gregorian rule
  expect(daysInMonth(1991, 2)).toBe(28);
  expect(daysInMonth(2026, 2)).toBe(28);
  expect(daysInMonth(2026, 12)).toBe(31);
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

test('every clamped slider day is a date the text parser accepts', () => {
  const shortMonths = [[1991, 2], [1900, 2], [2000, 2], [1991, 4], [2026, 11], [2024, 2]] as const;
  for (const [year, month] of shortMonths) {
    const max = daysInMonth(year, month);
    for (let day = max; day >= 1; day -= 1) {
      const text = fmtDateEt(year, month, clampDay(year, month, day));
      expect(parseDateEt(text)).toEqual({ year, month, day });
    }
  }
});

// ——— keyboard operation ———

test('keyboard steps: arrows are native, PageUp/PageDown/Home/End are ours', () => {
  const min = 1, max = 31, value = 17;
  expect(keyboardStep('PageUp', value, min, max)).toBe(27);
  // a distant year is reachable in one hop from either edge
  expect(keyboardStep('PageUp', 1001, 900, 2026)).toBe(1011);
  expect(keyboardStep('PageUp', 2020, 1900, 2026)).toBe(2026); // clamped
  expect(keyboardStep('PageDown', value, min, max)).toBe(7);
  expect(keyboardStep('PageDown', 1910, 1900, 2026)).toBe(1900);
  expect(keyboardStep('Home', value, min, max)).toBe(min);
  expect(keyboardStep('End', value, min, max)).toBe(max);
  expect(keyboardStep('ArrowUp', value, min, max)).toBeNull(); // browser native
  expect(keyboardStep('ArrowLeft', 5, 0, 59)).toBeNull();
  expect(keyboardStep('Tab', value, min, max)).toBeNull();
});

// ——— screen-reader text ———

test('the aria text reads the whole meaning in Estonian', () => {
  const parts = { day: 14, month: 3, year: 1991, hour: 14, minute: 30 };
  expect(dateAriaText('et', parts)).toBe('14. märts 1991');
  expect(monthName('et', 1)).toBe('jaanuar');
  expect(monthName('et', 12)).toBe('detsember');
  expect(timeAriaText('et', parts)).toBe('kell 14:30');
  // the sliders' value is not shortened: dragging the minute slider still
  // announces the full clock time
  expect(timeAriaText('et', { ...parts, minute: 5 })).toBe('kell 14:05');
});

// ——— two-way sync between sliders and text fields ———

/** The form's rendered state after moving date sliders: slider parts are
 * clamped, then painted into the text fallback. */
function sliderToText(parts: { day: number; month: number; year: number } & Partial<{ hour: number; minute: number }>): string {
  const clamped = clampParts({ hour: 0, minute: 0, ...parts });
  return fmtDateEt(clamped.year, clamped.month, clamped.day);
}

/** The form's rendered state after typing into the text fallback: a value
 * the existing parser accepts moves the sliders. */
function textToSlider(text: string): { year: number; month: number; day: number } | null {
  return parseDateEt(text);
}

test('slider moves repaint the text field with a valid Estonian date', () => {
  expect(sliderToText({ year: 1991, month: 4, day: 31 })).toBe('30.04.1991');
  expect(textToSlider('30.04.1991')).toEqual({ year: 1991, month: 4, day: 30 });
  expect(sliderToText({ year: 2024, month: 2, day: 29 })).toBe('29.02.2024');
  expect(textToSlider('29.02.2024')).toEqual({ year: 2024, month: 2, day: 29 });
});

test('typed text drives the sliders the same way, including clamped ones', () => {
  expect(textToSlider('14.3.1991')).toEqual({ year: 1991, month: 3, day: 14 });
  expect(textToSlider('31.02.1991')).toBeNull(); // sliders stay put; submit shows the error
  expect(textToSlider('31.04.1991')).toBeNull(); // 31.04 rejects as before
  expect(textToSlider('29.02.2000')).toEqual({ year: 2000, month: 2, day: 29 });
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

// ——— the sliders feed the same resolveInstant gate ———

/** What the submit path computes for slider state: parts -> text -> the
 * existing parse -> resolveInstant. Deliberately identical in shape to
 * what app.ts does, so the DST cases below prove the path is unchanged. */
function resolveFromSliders(parts: { day: number; month: number; year: number; hour: number; minute: number }): ReturnType<typeof resolveInstant> {
  const dateText = sliderToText(parts);
  const timeText = fmtTime(parts.hour, parts.minute);
  const parsedDate = parseDateEt(dateText)!;
  const parsedTime = parseTimeEt(timeText ?? '');
  const input: BirthInput = {
    ...parsedDate, hour: parsedTime?.hour ?? null, minute: parsedTime?.minute ?? null,
    timeUnknown: false, place: TALLINN,
  };
  return resolveInstant(input);
}

test('a slider-selected wall time inside the DST spring gap is still rejected', () => {
  // 1991-03-31 02:00 EET -> 03:00 EEST: 02:30 never happened in Tallinn
  expect(resolveFromSliders({ year: 1991, month: 3, day: 31, hour: 2, minute: 30 })).toBeNull();
  // one hour later exists and keeps the entered wall time
  const exists = resolveFromSliders({ year: 1991, month: 3, day: 31, hour: 3, minute: 30 });
  expect(exists).not.toBeNull();
  expect(exists?.localTime).toEqual({ hour: 3, minute: 30 });
  expect(exists?.ambiguous).toBe(false);
});

test('a slider-selected fall-back overlap still resolves to the earlier occurrence and is flagged', () => {
  // 1991-09-29: 02:00..02:59 happened twice; the slider can pick this hour
  const inst = resolveFromSliders({ year: 1991, month: 9, day: 29, hour: 2, minute: 30 });
  expect(inst).not.toBeNull();
  expect(inst!.ambiguous).toBe(true);
  expect(inst!.utc.isoString.slice(0, 16)).toBe('1991-09-28T23:30');
  const ordinary = resolveFromSliders({ year: 1991, month: 9, day: 29, hour: 15, minute: 0 });
  expect(ordinary!.ambiguous).toBe(false);
});
