/**
 * Birth entry sliders: the pure logic behind the five selectable parts
 * (day, month, year, hour, minute). The DOM wiring in app.ts owns no rules
 * of its own — sequencing, clamping, keyboard stepping and screen-reader
 * text all come from here, so the behaviour is testable without a browser.
 *
 * The sliders never invent a birth value: they render it as the same
 * dd.mm.yyyy / HH:MM strings the form has always parsed, and submit keeps
 * feeding parseDateEt/parseTimeEt -> resolveInstant.
 */
import { DateTime } from 'luxon';
import { fmt, t, type Lang, type MessageKey } from '../messages/catalogue';
import { fmtTime } from './format';

/** How many days the month actually has (29.02 only in a leap year).
 * Out-of-range months fall back to 31; the text parser, not the slider,
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

/** Re-clamp a whole set of parts against the selected month and year.
 * The day slider's max follows them, so choosing a shorter month clamps
 * the day down instead of leaving an impossible combination. */
export function clampParts(parts: BirthParts): BirthParts {
  return { ...parts, day: clampDay(parts.year, parts.month, parts.day) };
}

/** Extra keyboard steps for a range input. Arrows, Home and End move a
 * real range input natively; PageUp/PageDown do not in every browser.
 * Returns null for untouched keys so the handler can ignore them. */
export function keyboardStep(
  key: string,
  value: number,
  min: number,
  max: number,
): number | null {
  switch (key) {
    case 'PageUp':
      return Math.min(max, value + 10);
    case 'PageDown':
      return Math.max(min, value - 10);
    case 'Home':
      return min;
    case 'End':
      return max;
    default:
      return null;
  }
}

/** Estonian month names, lowercase nominative as in "14. märts 1991". */
export function monthName(lang: Lang, month: number): string {
  return t(lang, ('form.month.' + month) as MessageKey);
}

/** The whole date as one spoken phrase: "14. märts 1991". Used as the
 * aria-valuetext of all three date sliders so each reads the same meaning. */
export function dateAriaText(lang: Lang, parts: BirthParts): string {
  return fmt(lang, 'form.slider.datePhrase', {
    day: String(parts.day),
    month: monthName(lang, parts.month),
    year: String(parts.year),
  });
}

/** The whole time as one spoken phrase: "kell 14:30" — the meaning both
 * time sliders carry, not just the part being dragged. */
export function timeAriaText(lang: Lang, parts: BirthParts): string {
  const time = fmtTime(parts.hour, parts.minute);
  if (!time) return '';
  return fmt(lang, 'form.slider.timePhrase', { time });
}
