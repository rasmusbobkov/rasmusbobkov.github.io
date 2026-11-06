// @ts-check
import { defineConfig } from 'astro/config';

// Static output only: no server runtime, no API routes, no SSR, no edge functions.
//
// `site` is the published address, and the page is served from that address's
// root: no `base` is declared, so nothing is prefixed and every asset link the
// page writes is root-relative. Serving from a domain's root is what decision
// `docs/decisions/0008-product-name-and-public-address.md` chose; the DNS
// records and the Pages custom domain that make the address answer are set
// outside this file, and `tests/published-page.test.ts` reads the built page
// back and fails if a root-relative path does not resolve to a file the build
// ships, which is the way a published page loses its stylesheet without anyone
// noticing locally.
//
// The address is Estonian and keeps the name's own letters; its DNS records and
// the Pages setting take the Punycode form, `xn--thelugu-5wa.ee`.
export default defineConfig({
  site: 'https://tähelugu.ee',
  output: 'static',
  vite: {
    build: {
      // Keep the ephemeris WASM as its own asset so the browser cache holds it
      // across sessions; nothing else in the bundle is remotely large.
      assetsInlineLimit: 0,
    },
  },
});
