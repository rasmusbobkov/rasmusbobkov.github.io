/**
 * Node-side helper: the browser WASM build loads swisseph.wasm through
 * `fetch`, so under Node we shim file:// URLs before the ephemeris module
 * is first used. Only test-side — the app never touches this.
 */
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

declare global {
  // eslint-disable-next-line no-var
  var __fmaShimInstalled: boolean;
}

export const WASM_PATH = 'node_modules/@swisseph/browser/dist/swisseph.wasm';

export function wasmFileUrl(): string {
  return pathToFileURL(WASM_PATH).href;
}

if (!globalThis.__fmaShimInstalled) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith('file:')) {
      // fileURLToPath decodes percent escapes (`%20` in a checkout path) and
      // handles Windows drive letters; a raw `new URL(url).pathname` does not.
      const bytes = fs.readFileSync(fileURLToPath(url));
      return new Response(bytes, { status: 200, headers: { 'Content-Type': 'application/wasm' } });
    }
    return realFetch(input, init);
  };
  globalThis.__fmaShimInstalled = true;
}
