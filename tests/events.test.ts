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
 * The counter request itself is tested beside this file once the approved
 * address is wired in.
 */
import { describe, expect, test } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  APP_VERSION,
  EVENT_NAMES,
  UNWIRED_EVENTS,
  WIRED_EVENTS,
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
