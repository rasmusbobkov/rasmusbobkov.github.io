/**
 * The chart wheel: programmatic SVG in the board's design language.
 * Rings for signs, planets with collision-avoiding glyph placement, house
 * spokes with numerals, aspect lines across the centre. Everything is
 * tappable (planets, houses, aspect lines) and the same content exists as
 * text in the accessible list outside the SVG.
 */
import { SIGNS, BODIES, ASPECTS, type BodyId } from '../lib/astro-constants';
import type { Chart, Placement, HouseCusp } from '../lib/chart';
import type { AspectParticipant } from '../lib/chart';

export type Selection =
  | { type: 'body'; id: BodyId }
  | { type: 'house'; house: number }
  | { type: 'aspect'; index: number };

export interface WheelLabels {
  /** index 0..11 -> Estonian sign name */
  signGlyphs?: undefined;
  bodyNames: Partial<Record<BodyId, string>>;
  houseItem: (n: number) => string;
}

const NS = 'http://www.w3.org/2000/svg';

function el(name: string, attrs: Record<string, string | number> = {}): SVGElement {
  const node = document.createElementNS(NS, name) as SVGElement;
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

function polar(cx: number, cy: number, r: number, mathAngleDeg: number): { x: number; y: number } {
  const rad = (mathAngleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function normDelta(x: number, base: number): number {
  return ((x - base) % 360 + 360) % 360;
}

/** longitude -> math angle: Ascendant fixed at the left (180°), signs counter-clockwise */
function lonToAngle(lon: number, ascLon: number): number {
  return 180 + normDelta(lon, ascLon);
}

function attachActivation(node: SVGElement, handler: () => void): void {
  node.addEventListener('click', (ev) => {
    ev.stopPropagation();
    handler();
  });
  node.addEventListener('keydown', (ev) => {
    const key = (ev as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ') {
      ev.preventDefault();
      handler();
    }
  });
}

/** collision-avoiding glyph angles, preserving longitude order */
export function displayAnglesFor(longitudes: readonly number[]): number[] {
  const MIN_SEP = 6.2;
  const sorted = longitudes.map((lon, idx) => ({ lon, idx })).sort((a, b) => a.lon - b.lon);
  const result = new Array<number>(longitudes.length);
  let last = -Infinity;
  for (const { lon, idx } of sorted) {
    let bumped = lon;
    while (bumped < last) bumped += 360;
    while (bumped - last < MIN_SEP) bumped += MIN_SEP;
    result[idx] = bumped % 360;
    last = bumped;
  }
  return result;
}

export function renderWheel(
  svgHost: SVGSVGElement,
  chart: Chart,
  labels: WheelLabels,
  onSelect: (sel: Selection) => void,
): void {
  const SIZE = 640;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  svgHost.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svgHost.setAttribute('role', 'img');
  while (svgHost.firstChild) svgHost.removeChild(svgHost.firstChild);

  const ascLon = chart.ascendant?.longitude ?? 0;
  const A = (lon: number) => lonToAngle(lon, ascLon);

  // ——— defs: centre glow ———
  const defs = el('defs');
  const grad = el('radialGradient', { id: 'fma-core', cx: '50%', cy: '50%', r: '50%' });
  grad.appendChild(el('stop', { offset: '0%', 'stop-color': 'var(--gold)', 'stop-opacity': '0.14' }));
  grad.appendChild(el('stop', { offset: '100%', 'stop-color': 'var(--gold)', 'stop-opacity': '0' }));
  defs.appendChild(grad);
  svgHost.appendChild(defs);

  // ——— rings ———
  svgHost.appendChild(el('circle', { cx: CX, cy: CY, r: 300, fill: 'url(#fma-core)' }));
  svgHost.appendChild(el('circle', { cx: CX, cy: CY, r: 300, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1 }));
  svgHost.appendChild(el('circle', { cx: CX, cy: CY, r: 222, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1 }));
  svgHost.appendChild(el('circle', { cx: CX, cy: CY, r: 168, fill: 'none', stroke: 'var(--line)', 'stroke-width': 1 }));

  // ——— zodiac ring ———
  for (const sign of SIGNS) {
    const a = A(sign.startDeg + 15);
    const gp = polar(CX, CY, 284, a);
    const glyphText = el('text', {
      x: gp.x.toFixed(1), y: gp.y.toFixed(1),
      fill: 'var(--paper)', 'font-size': 21, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-family': 'var(--glyph)', opacity: 0.85,
    });
    glyphText.textContent = sign.glyph;
    svgHost.appendChild(glyphText);

    const b1 = polar(CX, CY, 262, A(sign.startDeg));
    const b2 = polar(CX, CY, 300, A(sign.startDeg));
    svgHost.appendChild(el('line', {
      x1: b1.x.toFixed(1), y1: b1.y.toFixed(1), x2: b2.x.toFixed(1), y2: b2.y.toFixed(1),
      stroke: 'var(--line)', 'stroke-width': 1.4,
    }));
  }

  // ——— house spokes + numerals ———
  if (chart.houses) {
    for (const cusp of chart.houses) {
      const inPt = polar(CX, CY, 168, A(cusp.cuspLongitude));
      const outPt = polar(CX, CY, 300, A(cusp.cuspLongitude));
      const isAngle = cusp.house === 1 || cusp.house === 4 || cusp.house === 7 || cusp.house === 10;
      svgHost.appendChild(el('line', {
        x1: inPt.x.toFixed(1), y1: inPt.y.toFixed(1), x2: outPt.x.toFixed(1), y2: outPt.y.toFixed(1),
        stroke: isAngle ? 'var(--gold)' : 'var(--line)', 'stroke-width': isAngle ? 1.3 : 0.9,
        opacity: isAngle ? 0.9 : 1,
      }));
      const next = chart.houses.find((c: HouseCusp) => c.house === ((cusp.house % 12) + 1));
      const midLon = cusp.cuspLongitude + (next ? normDelta(next.cuspLongitude, cusp.cuspLongitude) : 30) / 2;
      const nPos = polar(CX, CY, 208, A(midLon));
      const hitG = el('g', {
        class: 'wheel-hit', tabindex: '0', role: 'button',
        'aria-label': labels.houseItem(cusp.house),
      });
      const numText = el('text', {
        x: nPos.x.toFixed(1), y: nPos.y.toFixed(1),
        fill: 'var(--faint)', 'font-size': 12.5, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-family': 'var(--mono)',
      });
      numText.textContent = String(cusp.house);
      hitG.appendChild(numText);
      hitG.appendChild(el('circle', { cx: nPos.x.toFixed(1), cy: nPos.y.toFixed(1), r: 14, fill: 'transparent' }));
      attachActivation(hitG, () => onSelect({ type: 'house', house: cusp.house }));
      svgHost.appendChild(hitG);
    }
  }

  // ——— true-position ticks (bodies + the two angles) ———
  const ticks = new Map<AspectParticipant, { x: number; y: number }>();
  chart.placements.forEach((p: Placement) => {
    ticks.set(p.body, polar(CX, CY, 190, A(p.longitude)));
  });
  if (chart.ascendant) ticks.set('asc', polar(CX, CY, 190, A(chart.ascendant.longitude)));
  if (chart.mediumCoeli) ticks.set('mc', polar(CX, CY, 190, A(chart.mediumCoeli.longitude)));

  // ——— planets ———
  const displayAngles = displayAnglesFor(chart.placements.map((p) => p.longitude));
  chart.placements.forEach((p, idx) => {
    const glyph = BODIES.find((b) => b.id === p.body)!.glyph;
    const trueAngle = A(p.longitude);
    const displayAngle = displayAngles[idx] ?? trueAngle;
    const gPos = polar(CX, CY, 246, displayAngle);

    const radDisp = (displayAngle * Math.PI) / 180;
    const radTrue = (trueAngle * Math.PI) / 180;
    svgHost.appendChild(el('line', {
      x1: (CX + 214 * Math.cos(radDisp)).toFixed(1),
      y1: (CY - 214 * Math.sin(radDisp)).toFixed(1),
      x2: (CX + 198 * Math.cos(radTrue)).toFixed(1),
      y2: (CY - 198 * Math.sin(radTrue)).toFixed(1),
      stroke: 'var(--line)', 'stroke-width': 0.8,
    }));

    const tick = ticks.get(p.body)!;
    svgHost.appendChild(el('circle', {
      cx: tick.x.toFixed(1), cy: tick.y.toFixed(1), r: 2.6,
      fill: p.retrograde ? 'var(--rose)' : 'var(--gold)',
    }));

    const hitG = el('g', {
      class: 'wheel-hit', tabindex: '0', role: 'button',
      'aria-label': labels.bodyNames[p.body] ?? p.body,
    });
    const glyphText = el('text', {
      x: gPos.x.toFixed(1), y: gPos.y.toFixed(1),
      'font-size': 19, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      'font-family': 'var(--glyph)',
      fill: p.retrograde ? 'var(--rose)' : 'var(--gold)',
    });
    glyphText.textContent = glyph;
    hitG.appendChild(glyphText);
    hitG.appendChild(el('circle', { cx: gPos.x.toFixed(1), cy: gPos.y.toFixed(1), r: 15, fill: 'transparent' }));
    attachActivation(hitG, () => onSelect({ type: 'body', id: p.body }));
    svgHost.appendChild(hitG);
  });

  // ——— aspect lines ———
  chart.aspects.forEach((asp, idx) => {
    const pa = ticks.get(asp.a);
    const pb = ticks.get(asp.b);
    if (!pa || !pb) return;
    const color = asp.kind === 'square' || asp.kind === 'opposition'
      ? 'var(--rose)'
      : asp.kind === 'trine' || asp.kind === 'sextile'
        ? 'var(--sage)'
        : 'var(--gold)';
    const group = el('g', {
      class: 'wheel-aspect', tabindex: '0', role: 'button',
      'aria-label': `${labels.bodyNames[asp.a as BodyId] ?? asp.a} ${asp.kind} ${labels.bodyNames[asp.b as BodyId] ?? asp.b}`,
    });
    if (asp.kind === 'conjunction') {
      const midX = (pa.x + pb.x) / 2;
      const midY = (pa.y + pb.y) / 2;
      const midAngle = (Math.atan2(midY - CY, midX - CX) * 180) / Math.PI;
      const arcR = Math.max(40, Math.hypot(midX - CX, midY - CY) * 0.3);
      const arcMid = polar(CX, CY, arcR, -midAngle);
      group.appendChild(el('path', {
        d: `M ${pa.x.toFixed(1)} ${pa.y.toFixed(1)} Q ${arcMid.x.toFixed(1)} ${arcMid.y.toFixed(1)} ${pb.x.toFixed(1)} ${pb.y.toFixed(1)}`,
        fill: 'none', stroke: color, 'stroke-width': 4.5, opacity: 0.55, 'stroke-linecap': 'round',
      }));
    } else {
      group.appendChild(el('line', {
        x1: pa.x.toFixed(1), y1: pa.y.toFixed(1), x2: pb.x.toFixed(1), y2: pb.y.toFixed(1),
        stroke: color, 'stroke-width': 1.5, opacity: 0.7,
      }));
    }
    group.appendChild(el('line', {
      x1: pa.x.toFixed(1), y1: pa.y.toFixed(1), x2: pb.x.toFixed(1), y2: pb.y.toFixed(1),
      stroke: 'transparent', 'stroke-width': 15,
    }));
    attachActivation(group, () => onSelect({ type: 'aspect', index: idx }));
    svgHost.appendChild(group);
  });

  void ASPECTS.length;
}
