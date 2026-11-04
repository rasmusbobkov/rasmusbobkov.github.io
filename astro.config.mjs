// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server runtime, no API routes, no SSR, no edge functions.
//
// `site` and `base` are the published address: the page is served as a GitHub
// Pages project site at https://rasmusbobkov.github.io/firstmate_astro/, so
// everything Astro emits is prefixed with `base`, and the two hand-written
// asset links in `src/pages/index.astro` read `import.meta.env.BASE_URL` for
// the same reason. `tests/published-page.test.ts` reads the built page back
// and fails if any root-relative path escapes the base, which is the way a
// published page loses its stylesheet without anyone noticing locally.
export default defineConfig({
  site: 'https://rasmusbobkov.github.io',
  base: '/firstmate_astro',
  output: 'static',
  vite: {
    build: {
      // Keep the ephemeris WASM as its own asset so the browser cache holds it
      // across sessions; nothing else in the bundle is remotely large.
      assetsInlineLimit: 0,
    },
  },
});
