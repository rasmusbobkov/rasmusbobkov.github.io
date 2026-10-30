/**
 * Share links encode ONLY the derived placements (Sun, Moon, Rising) in the
 * URL fragment — never birth time, never birth place. Format:
 *   #p4=S3:12.4,M9:24.0,R7:3.1
 * (fragment version 4, S=sun M=moon R=rising, sign 1..12, degree 0..29.9)
 */
import type { Placement } from './chart';

interface Trio {
  sun: { signNum: number; degree: number } | null;
  moon: { signNum: number; degree: number } | null;
  rising: { signNum: number; degree: number } | null;
}

export function encodeShareFragment(
  placements: readonly Placement[],
  ascendant: { signNum: number; degreeInSign: number } | null,
): string | null {
  const sun = placements.find((p) => p.body === 'sun');
  const moon = placements.find((p) => p.body === 'moon');
  if (!sun || !moon) return null;
  const parts = [
    `S${sun.signNum}:${sun.degreeInSign.toFixed(1)}`,
    `M${moon.signNum}:${moon.degreeInSign.toFixed(1)}`,
  ];
  if (ascendant) {
    parts.push(`R${ascendant.signNum}:${ascendant.degreeInSign.toFixed(1)}`);
  }
  return `p4=${parts.join(',')}`;
}

export function decodeShareFragment(fragment: string | null | undefined): Trio | null {
  if (!fragment) return null;
  const cleaned = fragment.replace(/^#/, '');
  if (!cleaned.startsWith('p4=')) return null;
  const body = cleaned.slice(3);
  const out: Trio = { sun: null, moon: null, rising: null };
  const re = /([SMR])(\d+):(\d+(?:\.\d+)?)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    const kind = match[1];
    const signNum = Number(match[2]);
    const degree = Number(match[3]);
    if (signNum < 1 || signNum > 12 || degree < 0 || degree >= 30) continue;
    const value = { signNum, degree };
    if (kind === 'S' && !out.sun) out.sun = value;
    if (kind === 'M' && !out.moon) out.moon = value;
    if (kind === 'R' && !out.rising) out.rising = value;
  }
  if (!out.sun && !out.moon && !out.rising) return null;
  return out;
}
