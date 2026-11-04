# 0007 — Ship firstmate_astro under AGPL-3.0 and offer the source

## Context

The chart engine is Swiss Ephemeris C 2.10.03 compiled to WebAssembly
(`@swisseph/browser`, `@swisseph/core`), and both npm packages are published
under AGPL-3.0 — see
[0002](0002-swiss-ephemeris-wasm-and-agpl.md). Astrodienst offers two models
for the engine: AGPL-3.0, or the commercial Swiss Ephemeris Professional
License (750 CHF for the first commercial project, 400 CHF for each further
one, 1550 CHF unlimited), and the choice has to be made before the program is
distributed or run as a public service. Until now the project had made no
choice: the repository carried no licence file, GitHub reported
`license: null`, and 0002 recorded the question as open.

On 4.11.2026 the captain chose, on card `d4a005dc-4`, the AGPL-3.0 branch with
a public page — over a commercial licence with a closed publication, and over
publishing nothing at all.

## Decision

Publish the project, its code and its copy under the GNU Affero General Public
License version 3 (AGPL-3.0, SPDX `AGPL-3.0-only`). Concretely:

- `LICENSE` holds the verbatim AGPL-3.0 text, and it covers the whole published
  work, because the AGPL-3.0 engine runs inside the same program.
- `THIRD-PARTY-NOTICES.md` records every component the build ships, its version
  and its licence, and the licence texts stay beside what they cover: each font
  family's OFL text under `public/fonts`, the test dictionary's LGPL-2.1
  notice where the dictionary is committed.
- The page names the licence and links to the project's own source, so a
  visitor of a published page can obtain the Corresponding Source — the offer
  AGPL-3.0 §13 requires of a program reached over a network. The address and
  the licence id live in `src/lib/licence.ts` and are rendered by the footer in
  `src/pages/index.astro`.
- The place data derived from GeoNames stays credited as CC BY 4.0, on the page
  and in the notices.

## Consequence

The choice is one-way: AGPL-3.0 lets anyone copy, host, modify and even sell
the work as long as they publish their own source under the same terms, so the
code and the copy cannot be closed later, and the project pays Astrodienst
nothing.

Two things stay open until the project is actually published: the repository
must become public and the page must be served. Until then the footer's offer
points at a repository a visitor cannot read; licensing the work is not
distributing it, which AGPL-3.0 permits.
