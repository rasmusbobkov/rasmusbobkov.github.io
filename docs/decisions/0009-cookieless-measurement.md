# 0009 — Measure three events with one cookieless counter, baked at build time

## Context

The roadmap's second item under S1 asked how to know whether the app is used at
all without turning the product into a tracker. The captain approved the plan
in `card-f77f7896-fm-measurement-plan` and answered its four questions the way
the plan recommended: a free cookieless counter as the only transport, a public
page in the app for the numbers with those numbers baked in at build time, only
the three events that exist today, and one sentence in the footer beside the
existing privacy sentence. This decision records what that answer changes in the
code and what it deliberately leaves alone.

## Decision

Measure three events and nothing else. `src/lib/events.ts` holds the one typed
event list: three wired events — a visit, birth data given, a story opened —
and three named but unwired ones (notification permission, the paywall, a
purchase) that stay silent until their features arrive in S2 and S4. An event
carries its name and the app version and nothing else: no birth data, no
cookie, no device identifier, no page address, no referrer.

The one outbound address is the cookieless counter's `/count` endpoint. It is
declared once in `src/data/counter.json`, read by the event layer that sends to
it and by the build script that reads its counts. `src/lib/events.ts` is the
only authored module allowed to call the network; the privacy scan permits that
module and the built chunk that names the address, and a second address from
anywhere else still fails.

The public metrics page at `/mõõdikud/` shows each wired event's count and the
day those counts were read, in Estonian. `scripts/refresh-metrics.mjs` reads the
counter's public counts and writes `src/data/metrics.json`; the page imports
that file at build time, so the numbers are in the served HTML and the page
sends no request to show them. The Pages workflow runs the refresh once a day
before the build. A count the counter has not answered for renders as a dash,
never as a zero the build cannot prove.

The footer carries one sentence naming the measurement beside the existing
privacy sentence and linking to the page. There is no consent banner: the
counter stores no personal data and sets no cookie, so there is nothing to
consent to.

## Consequences

PRIV-1 is re-typed rather than abandoned: the scan now allows exactly one
counter address from exactly one module, with a bait proving a second address
fails. The chart, story, wheel, place data, storage schema, export and the two
credit links are untouched. The page's promise that birth data stays in the
browser is still true: the event payload carries the event name and version
only.

The trade-off is real and recorded: a cookieless counter still sees a request's
IP address long enough to count it and dedupe within a short window. The plan
accepted that as the cost of knowing whether the app is used, and the page says
so in plain Estonian. A later item covers the full privacy policy and terms.
