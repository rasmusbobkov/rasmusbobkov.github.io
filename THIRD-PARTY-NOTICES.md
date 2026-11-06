# Third-party notices

The published work is licensed under the **GNU Affero General Public License,
version 3** (AGPL-3.0, SPDX `AGPL-3.0-only`); the full text is in
[`LICENSE`](LICENSE). The whole published work carries that licence, because
the app runs the AGPL-3.0 Swiss Ephemeris engine inside the same program — the
choice is recorded in
[`docs/decisions/0007-agpl-3-0-and-source-offer.md`](docs/decisions/0007-agpl-3-0-and-source-offer.md).

The page footer names the licence and offers the source, so a visitor of a
published page can obtain the Corresponding Source from the project's own
repository (AGPL-3.0 §13).

## What the published app ships

| Component | Version | Licence | Licence text kept here |
| --- | --- | --- | --- |
| `@swisseph/browser` and `@swisseph/core` — Swiss Ephemeris (© Astrodienst AG) C 2.10.03 compiled to WebAssembly | 1.4.0 | AGPL-3.0 | `LICENSE` |
| `luxon` — timezone and formatting, over the runtime's IANA timezone data | 3.7.2 | MIT | below |
| `astro` — the static site build | 7.4.4 | MIT | below |
| Fraunces (self-hosted font subsets) | — | SIL Open Font License 1.1 | `public/fonts/fraunces-OFL.txt` |
| Inter (self-hosted font subsets) | — | SIL Open Font License 1.1 | `public/fonts/inter-OFL.txt` |
| JetBrains Mono (self-hosted font subsets) | — | SIL Open Font License 1.1 | `public/fonts/jetbrains-mono-OFL.txt` |

### Swiss Ephemeris — AGPL-3.0

The ephemeris engine is Swiss Ephemeris, © Astrodienst AG, Zollikon
(<https://www.astro.com/swisseph/>). Astrodienst publishes it under a choice
of the GNU Affero General Public License version 3 or a commercial Swiss
Ephemeris Professional License; this project takes the AGPL-3.0 branch, which
is also the licence the `@swisseph/*` WebAssembly packages are published
under (<https://github.com/swisseph-js/swisseph>). The AGPL-3.0 text is
`LICENSE` in this repository.

### Fonts — SIL Open Font License 1.1

The font subsets under `public/fonts` (`.woff2`) come from the Google Fonts
repository and are redistributed under the SIL Open Font License 1.1, with
each family's own copyright line in the OFL text beside the files:

- Fraunces — Copyright 2018 The Fraunces Project Authors
  (<https://github.com/undercasetype/Fraunces>)
- Inter — Copyright 2020 The Inter Project Authors
  (<https://github.com/rsms/inter>)
- JetBrains Mono — Copyright 2020 The JetBrains Mono Project Authors
  (<https://github.com/JetBrains/JetBrainsMono>)

The OFL text's own header, also carried verbatim, names the licence FAQ:
<http://scripts.sil.org/OFL> in the Fraunces text and
<https://scripts.sil.org/OFL> in the Inter and JetBrains Mono texts.

### MIT components — Astro, Luxon

```
MIT License

Copyright (c) 2021 Fred K. Schott (Astro)
Copyright 2019 JS Foundation and other contributors (Luxon)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Place and timezone data — GeoNames, CC BY 4.0

The bundled place datasets (`src/data/estonia-places.json`,
`src/data/world-cities.json` — each place reduced to a name, coordinates, a
population figure and an IANA timezone) are derived from the GeoNames dumps.
GeoNames data is published under the Creative Commons Attribution 4.0
License (<https://creativecommons.org/licenses/by/4.0/>) and its terms ask for
credit to GeoNames with a link or another reference.

Attribution: **place data © GeoNames (<https://www.geonames.org/>), CC BY 4.0,
modified — reduced to the fields this app searches and shows.** The page
footer carries the same credit, and the world city set is filtered to
population ≥ ≈206 000 and the Estonian set to the settlements and districts
listed in `src/data/estonia-places.json`.

Historical UTC offsets are not redistributed here: the app reads the IANA
timezone database that ships inside the visitor's browser runtime, through
`Intl`/Luxon.

## Not distributed — development and test dependencies

These run on the developer's machine and in CI and are not part of the
published output: `vitest` 4.1.12 (MIT), `@astrojs/check` 0.9.12 (MIT),
`typescript` 5.9.3 (Apache-2.0), `hunspell-asm` 4.0.2 (MIT, hunspell WebAssembly
under the hunspell project's tri-licence).

The Estonian spell check dictionary committed for the test suite
(`tests/spelling/dictionaries/et/et.aff`, `et.dic`, from
`wooorm/dictionaries`, generated from <http://www.meso.ee/~jjpp/speller>) is
redistributed under the GNU Lesser General Public License 2.1; its notice is
`tests/spelling/dictionaries/et/LICENSE`.

## Keeping this file true

Every runtime dependency declared in `package.json`, every font family served
from `public/fonts`, the engine, the place data and the test dictionary are
listed above with their licence; `tests/licence.test.ts` reads the installed
packages and the served font list and fails when one of them is missing here.
Add a component and its notice in the same change.
