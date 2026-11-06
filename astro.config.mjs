// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server runtime, no API routes, no SSR, no edge functions.
//
// `site` is the published address, and the page is served from that address's
// root: no `base` is declared, so nothing is prefixed and every asset link the
// page writes is root-relative. The repository is named after the address (a
// GitHub Pages *user site*), so the page, the footer's source offer and the
// repository carry one name. Decision
// `docs/decisions/0008-product-name-and-public-address.md` chose the product's
// own domain: when `tähelugu.ee` answers, it becomes `site` here and the
// repository is renamed `tahelugu`.
//
// `tests/published-page.test.ts` reads the built page back and fails if a
// root-relative path does not resolve to a file the build ships, which is the
// way a published page loses its stylesheet without anyone noticing locally.
export default defineConfig({
  site: 'https://rasmusbobkov.github.io',
  output: 'static',
  vite: {
    build: {
      // Keep the ephemeris WASM as its own asset so the browser cache holds it
      // across sessions; nothing else in the bundle is remotely large.
      assetsInlineLimit: 0,
    },
  },
});
