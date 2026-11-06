/**
 * The licence surface, in one place: what the page tells a visitor about the
 * licence it is under and where the source of the running program lives.
 *
 * The captain's direction (AGPL-3.0 and a public page, chosen on
 * card-d4a005dc-4) makes the footer a licence obligation, not a design
 * detail: AGPL-3.0 §13 requires a program that users reach over a network to
 * offer them the Corresponding Source, so the page names the licence and
 * links to the project's own repository. The footer markup, the repository
 * documents and tests/licence.test.ts all read these constants, so the offer
 * cannot drift from the address it points at.
 */

/** The licence the whole published work carries (SPDX `AGPL-3.0-only`). */
export const LICENCE_ID = 'AGPL-3.0';

/** The project's own repository — the source offer AGPL-3.0 §13 requires. */
export const SOURCE_URL = 'https://github.com/rasmusbobkov/rasmusbobkov.github.io';

/** The credited source of the bundled place data (GeoNames, CC BY 4.0). */
export const PLACE_DATA_URL = 'https://www.geonames.org/';
