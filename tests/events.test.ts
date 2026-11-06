/**
 * THE MEASUREMENT EVENT LAYER — the payload rule and the transport switch.
 *
 * The captain's approved measurement plan (card-f77f7896-fm-measurement-plan)
 * asked for one typed event list, a payload of the event name and the app
 * version only, and a transport that starts switched off. These tests pin
 * those three facts so the layer cannot quietly widen what leaves the page:
 * the six approved names with exactly three wired, the payload keys, the
 * version staying in step with `package.json`, and no sink meaning no request.
 *
 * The approved counter request is tested here too: one GET per event, to the
 * one address, carrying only the event name and the version and offering no
 * cookie or referrer. A counter that does not answer never reaches the page.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  APP_VERSION,
  COUNTER_URL,
  EVENT_NAMES,
  UNWIRED_EVENTS,
  WIRED_EVENTS,
  counterSink,
  emit,
  setSink,
  type EventPayload,
} from '../src/lib/events';

const ROOT = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')) as {
  version: string;
};

/** Run `fn` with a sink that records every payload, then switch it off. */
function withRecordingSink(fn: (seen: EventPayload[]) => void): EventPayload[] {
  const seen: EventPayload[] = [];
  setSink((payload) => seen.push(payload));
  try {
    fn(seen);
  } finally {
    setSink(null);
  }
  return seen;
}

describe('the approved event list', () => {
  test('six names, three wired and three named for later features', () => {
    expect([...EVENT_NAMES]).toEqual([...WIRED_EVENTS, ...UNWIRED_EVENTS]);
    expect([...WIRED_EVENTS]).toEqual(['visit', 'birthDataGiven', 'storyOpened']);
    expect([...UNWIRED_EVENTS]).toEqual(['notificationPermission', 'paywallSeen', 'purchase']);
    expect(new Set(EVENT_NAMES).size, 'a duplicate name would hide a removal').toBe(EVENT_NAMES.length);
  });

  test('the app version the payload carries is the package version', () => {
    expect(APP_VERSION).toBe(pkg.version);
  });
});

describe('the payload rule', () => {
  test('an emitted event carries its name and the app version, nothing else', () => {
    const seen = withRecordingSink((recorded) => {
      for (const event of WIRED_EVENTS) emit(event);
      expect(recorded).toHaveLength(WIRED_EVENTS.length);
    });
    for (const payload of seen) {
      expect(Object.keys(payload).sort()).toEqual(['event', 'version']);
      expect(payload.version).toBe(APP_VERSION);
      // the serialized payload is exactly the two approved fields
      expect(JSON.stringify(payload)).toBe(
        `{"event":"${payload.event}","version":"${APP_VERSION}"}`,
      );
    }
  });

  test('a named event with no feature behind it sends nothing', () => {
    const seen = withRecordingSink((recorded) => {
      for (const event of UNWIRED_EVENTS) emit(event);
      expect(recorded, 'an unwired event must not leave the page').toEqual([]);
    });
    expect(seen).toEqual([]);
  });

  test('with no sink set the transport is off and an event goes nowhere', () => {
    const seen: EventPayload[] = [];
    setSink((payload) => seen.push(payload));
    setSink(null);
    emit('visit');
    emit('birthDataGiven');
    emit('storyOpened');
    expect(seen, 'nothing may be delivered while no sink is set').toEqual([]);
  });
});

describe('the approved counter request', () => {
  test('one GET per event carries only the event name and the version', () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const original = globalThis.fetch;
    globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init: init ?? {} });
      return Promise.resolve(new Response(''));
    }) as typeof fetch;
    try {
      counterSink()({ event: 'visit', version: '0.1.0' });
      expect(calls).toHaveLength(1);
      const requested = new URL(calls[0]!.url);
      const approved = new URL(COUNTER_URL);
      expect(requested.origin).toBe(approved.origin);
      expect(requested.pathname).toBe(approved.pathname);
      // the whole query is the event name and the app version: p and t
      expect([...requested.searchParams.keys()].sort()).toEqual(['p', 't']);
      expect(requested.searchParams.get('p')).toBe('visit');
      expect(requested.searchParams.get('t')).toBe('0.1.0');
      // no cookie, no referrer, and the page does not wait on the answer
      expect(calls[0]!.init.credentials).toBe('omit');
      expect(calls[0]!.init.referrerPolicy).toBe('no-referrer');
      expect(calls[0]!.init.keepalive).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  });

  test('a counter that does not answer never throws into the page', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (() => Promise.reject(new Error('offline'))) as typeof fetch;
    try {
      expect(() => counterSink()({ event: 'visit', version: '0.1.0' })).not.toThrow();
      await Promise.resolve();
    } finally {
      globalThis.fetch = original;
    }
  });
});
