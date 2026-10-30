/**
 * Glyph placement on the wheel: display angles must keep glyphs apart on the
 * circle — including pairs straddling the 0°/360° Aries seam. The minimum
 * separation (6.2° glyph width) comes from the placement helper's contract.
 */
import { expect, test } from 'vitest';
import { displayAnglesFor } from '../src/scripts/wheel';

const MIN_SEP = 6.2;

/** smallest gap between consecutive positions on the circle, seam included */
function minRingGap(angles: number[]): number {
  const sorted = [...angles].sort((a, b) => a - b);
  let min = Infinity;
  for (let i = 0; i < sorted.length; i++) {
    const next = i === sorted.length - 1 ? sorted[0] + 360 : sorted[i + 1];
    min = Math.min(min, next - sorted[i]);
  }
  return min;
}

test('glyph angles stay separated on the ring, including across the Aries seam', () => {
  expect(minRingGap(displayAnglesFor([359, 2.2]))).toBeGreaterThanOrEqual(MIN_SEP);
  // the same configuration rotated 180° must behave identically
  const rotated = displayAnglesFor([359, 2.2].map((lon) => (lon + 180) % 360));
  expect(minRingGap(rotated)).toBeGreaterThanOrEqual(MIN_SEP);
  // a tight cluster that forces the bump chain to wrap the whole ring
  expect(minRingGap(displayAnglesFor([100, 100.1, 106.2, 106.3]))).toBeGreaterThanOrEqual(MIN_SEP);
  // exact duplicates are split apart, not stacked
  const dup = displayAnglesFor([100, 100]);
  expect(minRingGap(dup)).toBeGreaterThanOrEqual(MIN_SEP);
  expect(new Set(dup).size).toBe(2);
  // already-separated longitudes are left where they are
  expect(displayAnglesFor([0, 10])).toEqual([0, 10]);
  expect(displayAnglesFor([10, 0])).toEqual([10, 0]);
});
