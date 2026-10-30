/** Locale-aware formatting: decimal comma, 14.03.1991 dates, 24-hour time. */

/** 11.76 -> "11,8" (one decimal, decimal comma) without sign/radix rounding surprises */
export function fmtDegComma(deg: number): string {
  const rounded = Math.round(Math.abs(deg) * 10) / 10;
  return rounded.toFixed(1).replace('.', ',');
}

/** Longitude in degrees (0..360) -> "12,4° Lisaks? no" keep numeric+sign separately. */
export function fmtDeg(deg: number): string {
  return `${fmtDegComma(deg)}°`;
}

/** dd.mm.yyyy, Estonian rendering of a birth date (Gregorian) */
export function fmtDateEt(y: number, m: number, d: number): string {
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${y}`;
}

/** 9:5 -> 09:05 */
export function fmtTime(h: number | null, m: number | null): string | null {
  if (h == null || m == null) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
