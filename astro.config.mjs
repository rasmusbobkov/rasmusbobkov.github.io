// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server runtime, no API routes, no SSR, no edge functions.
export default defineConfig({
  output: 'static',
  vite: {
    build: {
      // Keep the ephemeris WASM as its own asset so the browser cache holds it
      // across sessions; nothing else in the bundle is remotely large.
      assetsInlineLimit: 0,
    },
  },
});
