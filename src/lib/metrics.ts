/**
 * THE MEASUREMENT SNAPSHOT — the shape the public metrics page bakes at build
 * time and the small pure helpers both the page and its tests read.
 *
 * The snapshot is written by `scripts/refresh-metrics.mjs` from the counter's
 * public counts and committed as `src/data/metrics.json`. The page imports it
 * at build time, so the numbers are in the served HTML and the page itself
 * sends no request to show them. A missing count renders as a dash, never as a
 * zero the build cannot prove.
 */
import { fmtDateEt } from './format';
import { WIRED_EVENTS, type EventName } from './events';

/** What the committed snapshot holds. */
export interface MetricsSnapshot {
  /** The day the counts were read, as YYYY-MM-DD, or null before the first read. */
  readonly readAt: string | null;
  /** One count per wired event; null or missing means the counter has not answered. */
  readonly counts: Record<string, number | null>;
}

/** One row the page renders: the event and its count, or null when unread. */
export interface MetricsRow {
  readonly event: EventName;
  readonly count: number | null;
}

/** The three wired events in the approved order, each with its count or null. */
export function metricsRows(snapshot: MetricsSnapshot): MetricsRow[] {
  return WIRED_EVENTS.map((event) => {
    const value = snapshot.counts[event];
    const count = typeof value === 'number' && Number.isFinite(value) ? value : null;
    return { event, count };
  });
}

/** "6.11.2026" from the stored YYYY-MM-DD read date, or null when unread. */
export function readAtLabel(snapshot: MetricsSnapshot): string | null {
  if (!snapshot.readAt) return null;
  const [y, m, d] = snapshot.readAt.split('-').map(Number);
  if (!y || !m || !d) return null;
  return fmtDateEt(y, m, d);
}
