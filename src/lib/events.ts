/**
 * THE MEASUREMENT EVENT LAYER — the one place the app names a measurement
 * event, and the one place a request may leave the page.
 *
 * The payload rule: an event carries its own name and the app version, and
 * nothing else. No birth data, no cookie, no device identifier, no page
 * address and no referrer. The layer starts with its transport switched off:
 * the page injects a sink through `setSink`, and until it does, nothing
 * leaves the page at all. The counter sink that sends the approved request
 * lives in this same module, so the event layer and its one outbound address
 * cannot drift apart.
 *
 * Three events exist today and are wired where they happen: `visit`,
 * `birthDataGiven`, `storyOpened`. The other three — `notificationPermission`,
 * `paywallSeen`, `purchase` — are named now so the list is complete, and stay
 * unwired until their features arrive in S2 and S4. A named event with no
 * feature behind it sends nothing.
 */

/**
 * The version an event carries. It stays in step with `package.json`;
 * `tests/events.test.ts` fails when the two drift, so the payload never
 * claims a version the build did not ship.
 */
export const APP_VERSION = '0.1.0';

/** Every event the app knows by name. */
export const EVENT_NAMES = [
  'visit',
  'birthDataGiven',
  'storyOpened',
  'notificationPermission',
  'paywallSeen',
  'purchase',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** The three events that exist today: they fire where the thing happens. */
export const WIRED_EVENTS = ['visit', 'birthDataGiven', 'storyOpened'] as const satisfies readonly EventName[];

/** Named now, wired when their features arrive: nothing sends these yet. */
export const UNWIRED_EVENTS = [
  'notificationPermission',
  'paywallSeen',
  'purchase',
] as const satisfies readonly EventName[];

/** What one event may carry: its name and the app version. */
export interface EventPayload {
  readonly event: EventName;
  readonly version: string;
}

/** Where an event goes once it is emitted. */
export type EventSink = (payload: EventPayload) => void;

const wired: readonly EventName[] = WIRED_EVENTS;

let sink: EventSink | null = null;

/** Point the layer at a sink; `null` switches the transport off. */
export function setSink(next: EventSink | null): void {
  sink = next;
}

/**
 * Emit one event. A named-but-unwired event sends nothing, and with no sink
 * set nothing leaves the page: the transport is off until it is injected.
 */
export function emit(event: EventName): void {
  if (!wired.includes(event)) return;
  sink?.({ event, version: APP_VERSION });
}
