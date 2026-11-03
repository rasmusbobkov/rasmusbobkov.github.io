# 0001 — Compute charts on the device, with no backend

## Context

The app asks for a birth date, time and place, which is sensitive personal data, and it is meant for the general public rather than a signed-in audience. A natal chart is derived, not fetched, so nothing about the product requires a shared service.

## Decision

Compute the entire natal chart in the browser and ship a static site: no backend, no API routes, no SSR, no accounts, no third-party requests. Persist birth data only in versioned localStorage, with JSON export/import for the user's own backup, and share only a URL fragment carrying the derived Sun/Moon/Rising signs.

## Consequence

The privacy claim is mechanically testable: `tests/privacy.test.ts` scans `src/` and the built output for network APIs and remote URLs. There is no server-side data to breach, and the app works offline once loaded. The trade-offs are real: no cross-device sync, no server-side personalisation or analytics, and a lost browser profile means a lost saved chart unless the user exported it.
