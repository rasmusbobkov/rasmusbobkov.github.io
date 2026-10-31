/** Domain constants: zodiac signs, bodies, aspects, orbs. */

export interface SignDef {
  /** 1–12, 1 = Aries */
  readonly num: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  readonly glyph: string;
  /** start longitude of the sign, degrees 0..330 (tropical, 0° = Aries 0°) */
  readonly startDeg: 0 | 30 | 60 | 90 | 120 | 150 | 180 | 210 | 240 | 270 | 300 | 330;
}

export const SIGNS: readonly SignDef[] = [
  { num: 1, glyph: '♈', startDeg: 0 },
  { num: 2, glyph: '♉', startDeg: 30 },
  { num: 3, glyph: '♊', startDeg: 60 },
  { num: 4, glyph: '♋', startDeg: 90 },
  { num: 5, glyph: '♌', startDeg: 120 },
  { num: 6, glyph: '♍', startDeg: 150 },
  { num: 7, glyph: '♎', startDeg: 180 },
  { num: 8, glyph: '♏', startDeg: 210 },
  { num: 9, glyph: '♐', startDeg: 240 },
  { num: 10, glyph: '♑', startDeg: 270 },
  { num: 11, glyph: '♒', startDeg: 300 },
  { num: 12, glyph: '♓', startDeg: 330 },
] as const;

export type BodyId =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars'
  | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto'
  | 'meanNode';

export interface BodyDef {
  readonly id: BodyId;
  readonly glyph: string;
  /** Swiss Ephemeris body number */
  readonly sweNumber: number;
}

export const BODIES: readonly BodyDef[] = [
  { id: 'sun', glyph: '☉', sweNumber: 0 },
  { id: 'moon', glyph: '☽', sweNumber: 1 },
  { id: 'mercury', glyph: '☿', sweNumber: 2 },
  { id: 'venus', glyph: '♀', sweNumber: 3 },
  { id: 'mars', glyph: '♂', sweNumber: 4 },
  { id: 'jupiter', glyph: '♃', sweNumber: 5 },
  { id: 'saturn', glyph: '♄', sweNumber: 6 },
  { id: 'uranus', glyph: '♅', sweNumber: 7 },
  { id: 'neptune', glyph: '♆', sweNumber: 8 },
  { id: 'pluto', glyph: '♇', sweNumber: 9 },
  { id: 'meanNode', glyph: '☊', sweNumber: 10 },
] as const;

export type AspectKind = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface AspectDef {
  readonly kind: AspectKind;
  /** exact angle 0/60/90/120/180 */
  readonly angle: 0 | 60 | 90 | 120 | 180;
  /** standard natal orb in degrees */
  readonly orb: number;
  /** glyph on the wheel line label, e.g. ☌ □ △ ✶ ☍ */
  readonly glyph: string;
}

export const ASPECTS: readonly AspectDef[] = [
  { kind: 'conjunction', angle: 0, orb: 10, glyph: '☌' },
  { kind: 'sextile', angle: 60, orb: 6, glyph: '✶' },
  { kind: 'square', angle: 90, orb: 8, glyph: '□' },
  { kind: 'trine', angle: 120, orb: 8, glyph: '△' },
  { kind: 'opposition', angle: 180, orb: 10, glyph: '☍' },
] as const;

/** Placidus house cusp ids 1..12 */
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * The four life domains the daily story speaks about. The user picks at
 * most three once, in a setup step; the choice steers which meaning unit
 * is chosen for the day. It never changes the chart.
 */
export type FocusArea = 'work' | 'relationships' | 'creative' | 'money';

export const FOCUS_AREAS: readonly FocusArea[] = ['work', 'relationships', 'creative', 'money'];

/** The most focus areas a single setup may select. */
export const MAX_FOCUS_AREAS = 3;
