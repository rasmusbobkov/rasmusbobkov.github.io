/**
 * REGRESSION — the file shim in `tests/helpers/node-ephemeris-loader.ts` must
 * read the WASM bytes from a decoded path. A checkout whose path contains a
 * space arrives as `%20` in the file URL, and reading the raw URL pathname
 * throws ENOENT, which aborts the ephemeris engine: the correctness gates in
 * tests/chart-fixtures.test.ts and tests/transits.test.ts then skip every
 * assertion in a checkout the CI runner's path never resembles. So this test
 * makes its own directory with a space in the name rather than trusting where
 * the repository happens to sit.
 */
import { afterAll, expect, test } from 'vitest';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { WASM_PATH } from './helpers/node-ephemeris-loader.js';

const spacedDir = mkdtempSync(path.join(tmpdir(), 'fma wasm '));

afterAll(() => {
  rmSync(spacedDir, { recursive: true, force: true });
});

test('the file shim reads a wasm file whose path contains a space', async () => {
  const copy = path.join(spacedDir, 'swisseph.wasm');
  copyFileSync(WASM_PATH, copy);
  const url = pathToFileURL(copy).href;
  expect(url).toContain('%20');

  const response = await globalThis.fetch(url);

  expect(response.status).toBe(200);
  expect(Buffer.from(await response.arrayBuffer())).toEqual(readFileSync(copy));
});
