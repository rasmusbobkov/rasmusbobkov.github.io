# 0002 — Ship Swiss Ephemeris as WASM in Moshier mode

## Context

The chart must be accurate enough to trust and small enough to load in a static browser app. The project set a 2.5 MB gzipped payload budget. Several JavaScript astrology libraries were rejected because their reference values could not be traced to a known engine, and no expected test value was ever taken from a consumer astrology app.

## Decision

Use `@swisseph/browser` 1.4.0 — Swiss Ephemeris C library 2.10.03 compiled to WebAssembly — running the built-in Moshier ephemeris instead of fetching `.se1` files. The WASM payload is ≈0.21 MB gzipped plus ~14 KB of glue. The optional standard-ephemeris loaders are never called, and that is enforced by the privacy test. The committed fixtures come from the official C library and each fixture's Sun is cross-anchored against NASA JPL Horizons.

## Consequence

Accuracy is pinned by `tests/chart-fixtures.test.ts` at 0.01° for longitudes and 0.05° for Placidus cusps, and the trade-off (Moshier precision rather than full Swiss Ephemeris files) is deliberate and documented. The engine is also AGPL-3.0, and that is what decides the project's own licence. **Resolved:** the captain chose AGPL-3.0 with a public page on 4.11.2026, so distributing this AGPL-derived engine ships the work under the same copyleft licence, with the licence file, the third-party notices and the source offer that choice requires — see [0007](0007-agpl-3-0-and-source-offer.md).
