# Invariants

Rules that must never break, each with a stable id and a `verify:` pointer to a test that fails when it breaks.
Every rule here costs every session that reads it, so keep this list at most about ten entries and delete a rule when it stops being true.
When no test can assert a rule, say so with `manual:` and the reason a human check is the only evidence.

- PRIV-1: Birth data never leaves the device — our own source calls no network API, and the only remote addresses it names are the two reviewed credit links the page displays (the project's own source offer and GeoNames), which nothing loads; the built output is re-scanned whenever `dist/` exists. The vendored Swiss Ephemeris chunk is the one exemption on the API side: it carries an unreachable CDN constant, and its file loaders are never called. verify: tests/privacy.test.ts
- PRIV-2: Nothing is persisted server-side because there is no server: the build is static output only, with no API routes or SSR. manual: no test can prove the absence of a backend; the deployment target is reviewed by a human against `astro.config.mjs` (`output: 'static'`).
- EPH-1: Natal positions, house cusps and the Asc/MC are deterministic and stay within 0.01°/0.05° of the committed Swiss Ephemeris C references. verify: tests/chart-fixtures.test.ts
- TRANS-1: The transit engine reads the same fixture instants from the transit side and stays within the same 0.01° tolerance. verify: tests/transits.test.ts
- COPY-1: Every shipped Estonian word passes the committed et_EE hunspell dictionary, with only reviewed allowlist words exempt. verify: tests/spelling.test.ts
- COPY-2: No user-facing string promises an outcome, certainty, money or health result; the content gate fails on that vocabulary. verify: tests/content-gate.test.ts
- COPY-3: The story tier never names a planet, sign, house or aspect. verify: tests/meaning.test.ts
- SHARE-1: A share link encodes only the derived Sun/Moon/Rising signs and degrees — never birth time or birth place. verify: tests/logic.test.ts
- I18N-1: The interface is Estonian-first: Estonian is the default and only shipped language, with English marked as coming. manual: no test pins the default language or the placeholder state; a reviewer checks the ET/EN switch in the browser.
- LIC-1: The published work carries its licence and its credits: the repository holds the AGPL-3.0 text and the third-party notices, and the page names the licence and offers the project's own source. verify: tests/licence.test.ts
