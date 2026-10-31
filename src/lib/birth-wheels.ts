/**
 * Birth entry wheels: the pure logic behind the five selectable wheels —
 * day, month, year side by side for the date, hour and minute side by side
 * for the time. The DOM wiring in app.ts owns no rules of its own:
 * clamping, keyboard stepping, screen-reader text and the shared year
 * bound all come from here, so the behaviour is testable without a browser.
 *
 * The wheels never invent a birth value: they render the selection as the
 * same dd.mm.yyyy / HH:MM strings the form has always parsed, and submit
 * keeps feeding parseDateEt/parseTimeEt -> resolveInstant.
 */
import { DateTime } from 'luxon';
import { fmt, t, type Lang, type MessageKey } from '../messages/catalogue';
import { fmtTime } from './format';

/** The one shared year floor: the parser, the year wheel, the seeded
 * defaults and the import validation all read this — no second range
 * anywhere. */
export const MIN_BIRTH_YEAR = 1800;

/** The one shared year ceiling: the current calendar year, computed at
 * runtime so the control cannot go stale as years pass. */
export function maxBirthYear(): number {
  return new Date().getFullYear();
}

/** The wheel's option height counts as measured once readings above the
 * 10 px real-height floor stopped changing between frames — a 40 px item
 * on a narrow viewport settles exactly like the 44 px default, never
 * against a hardcoded constant. */
export function isSettledItemPx(previous: number, current: number): boolean {
  return current > 10 && current === previous;
}

/** True when a birth year is inside the single shared bound. */
export function isValidBirthYear(year: number, floor: number = MIN_BIRTH_YEAR, ceiling: number = maxBirthYear()): boolean {
  return Number.isFinite(year) && year >= floor && year <= ceiling;
}

/** How many days the month actually has (29.02 only in a leap year).
 * Out-of-range months fall back to 31; the text parser, not the wheel,
 * decides calendar validity. */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 31;
  return DateTime.utc(year, month, 1).daysInMonth ?? 31;
}

/** The day forced back into what the selected month and year contain:
 * 31.04 becomes 30, 29.02 exists only in a leap year, 0 or below is 1. */
export function clampDay(year: number, month: number, day: number): number {
  return Math.max(1, Math.min(daysInMonth(year, month), day));
}

export interface BirthParts {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
}

/** Re-clamp a whole set of parts against the selected month and year; a
 * value inside the shared year bound is never altered. */
export function clampParts(parts: BirthParts): BirthParts {
  return { ...parts, day: clampDay(parts.year, parts.month, parts.day) };
}

/** Keyboard movement inside a wheel whose list ascends downward:
 * ArrowUp selects the item above (one smaller), ArrowDown one below,
 * Home is the first item, End the last. Other keys belong to the browser
 * and return null so the handler can ignore them. */
export function wheelKeyStep(
  key: string,
  value: number,
  min: number,
  max: number,
): number | null {
  switch (key) {
    case 'ArrowUp':
      return Math.max(min, value - 1);
    case 'ArrowDown':
      return Math.min(max, value + 1);
    case 'Home':
      return min;
    case 'End':
      return max;
    default:
      return null;
  }
}

/** The documented fresh-form birth entry: the example value the form has
 * always shown. The wheels, the text fields and the SSR markup all seed
 * from this, so an untouched form reads 14.03.1991 from the first paint. */
export const SEED_BIRTH_ENTRY = { day: 14, month: 3, year: 1991, hour: 14, minute: 30 } as const;

/** Estonian month names, lowercase nominative as in "14. märts 1991". */
export function monthName(lang: Lang, month: number): string {
  return t(lang, ('form.month.' + month) as MessageKey);
}

/** The whole date as one spoken phrase: "14. märts 1991". Every date
 * wheel option carries it, so the selection reads with full meaning. */
export function dateWheelText(lang: Lang, parts: BirthParts): string {
  return fmt(lang, 'form.wheel.datePhrase', {
    day: String(parts.day),
    month: monthName(lang, parts.month),
    year: String(parts.year),
  });
}

/** The whole time as one spoken phrase: "kell 14:30" — the meaning both
 * time wheels carry, not just the part being turned. */
export function timeWheelText(lang: Lang, parts: BirthParts): string {
  const time = fmtTime(parts.hour, parts.minute);
  if (!time) return '';
  return fmt(lang, 'form.wheel.timePhrase', { time });
}
