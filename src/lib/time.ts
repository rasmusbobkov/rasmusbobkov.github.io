/**
 * Birth time handling: local wall time + place timezone -> UTC instant.
 * Historical offsets come from the IANA tz database built into the runtime
 * (via Luxon/Intl) — fully offline, correct across Estonia's shifting
 * offsets (Moscow-time era +03:00, EET/EEST rules, etc.).
 */
import { DateTime } from 'luxon';
import { fmtDateEt, fmtTime } from './format';

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  /** hours/minutes of local clock time; null when unknown */
  hour: number | null;
  minute: number | null;
  /** place as resolved from the dataset */
  place: { lat: number; lon: number; tz: string };
  /** true: user said they don't know the birth time */
  timeUnknown: boolean;
}

export interface BirthInstant {
  /** date components carry the LOCAL birth date as entered */
  local: { year: number; month: number; day: number };
  localTime: { hour: number; minute: number } | null;
  place: { lat: number; lon: number; tz: string };
  timeUnknown: boolean;
  /** resolved UTC instant */
  utc: { year: number; month: number; day: number; hourDecimal: number; isoString: string };
  /** the IANA offset actually applied, minutes east of UTC */
  offsetMinutes: number | null;
  /** true when the entered wall time occurs twice in the zone (DST fall-back);
   * the recorded instant is the earlier occurrence */
  ambiguous: boolean;
  /** Julian day UT, set by the chart engine */
  julianDayUt?: number;
}

/** null when the date/time combination does not exist (e.g. a DST gap) */
export function resolveInstant(input: BirthInput): BirthInstant | null {
  const hour = input.timeUnknown ? 12 : (input.hour ?? 0);
  const minute = input.timeUnknown ? 0 : (input.minute ?? 0);
  const local = DateTime.fromObject(
    { year: input.year, month: input.month, day: input.day, hour, minute },
    { zone: input.place.tz },
  );
  if (!local.isValid) return null;
  // Luxon constructs a DST-gap wall time as valid but forward-shifted, so
  // require the resolved wall clock to be the one that was entered.
  if (local.hour !== hour || local.minute !== minute) return null;

  let ambiguous = false;
  let resolved = local;
  if (!input.timeUnknown) {
    const twin = foldTwin(local);
    if (twin && twin.isValid) {
      ambiguous = true;
      if (twin.toMillis() < local.toMillis()) resolved = twin as DateTime<true>;
    }
  }

  const utcDt = resolved.toUTC();
  // The zone's offset actually applied to this instant, minutes east of UTC.
  const offsetMinutes = resolved.offset;
  return {
    local: { year: resolved.year, month: resolved.month, day: resolved.day },
    localTime: input.timeUnknown ? null : { hour, minute },
    place: input.place,
    timeUnknown: input.timeUnknown,
    utc: {
      year: utcDt.year,
      month: utcDt.month,
      day: utcDt.day,
      hourDecimal: utcDt.hour + utcDt.minute / 60,
      isoString: utcDt.toISO(),
    },
    offsetMinutes,
    ambiguous,
  } satisfies BirthInstant;
}

/** The other instant of a DST fall-back, when the wall clock occurs again
 * after the clocks were set back. Bounded to four hours, wider than any
 * real fall-back. */
function foldTwin(dt: DateTime): DateTime | null {
  for (let minutes = 1; minutes <= 240; minutes += 1) {
    const later = dt.plus({ minutes });
    if (later.hour === dt.hour && later.minute === dt.minute) return later;
    const earlier = dt.minus({ minutes });
    if (earlier.hour === dt.hour && earlier.minute === dt.minute) return earlier;
  }
  return null;
}

/** "14:30" -> { hour: 14, minute: 30 } | null */
export function parseTimeEt(text: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** A calendar-real date inside the app's supported years: months 1–12, a day
 * the month actually contains. The form parser and storage validation share
 * this so every date the app accepts is one. */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  if (year < 1800 || year > 2399) return false;
  return DateTime.utc(year, month, day, 12).isValid;
}

/** "14.03.1991" or "14.3.1991" -> components | null */
export function parseDateEt(text: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  return isValidCalendarDate(year, month, day) ? { year, month, day } : null;
}

export function displayBirthLine(input: BirthInput): string {
  const date = fmtDateEt(input.year, input.month, input.day);
  if (input.timeUnknown) return date;
  const time = fmtTime(input.hour, input.minute);
  return time ? `${date} ${time}` : date;
}
