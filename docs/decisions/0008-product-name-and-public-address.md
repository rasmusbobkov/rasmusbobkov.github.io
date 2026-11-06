# 0008 — Tähelugu is the product's name, published at tähelugu.ee

## Context

The roadmap's first item settles the product's name, its public address and the
brand direction behind them, and it comes before the other S1 items because
most of them write that name or address into their own text, terms or file.
The name a visitor reads comes from one interface key, `app.name` in
`src/messages/catalogue.ts`, which `src/pages/index.astro` renders as the page
title and the header mark. The address lives in `astro.config.mjs` (`site` and
`base`), and the footer's source offer in `src/lib/licence.ts`; the repository's
own name is written through the documents and that source address.

The captain's direction for the name: it comes from Estonian — a short word or
compound that can be said, typed and remembered, that a search finds, and for
which a `.ee` domain is logical. The visible name and the address change; the
storage keys (`firstmate-astro.*`), the export marker, the export file name and
the package name stay, so the birth data and focus a person has already saved
keep working without a migration.

## Candidates

Three candidates were researched on 6.11.2026, each by querying the `.ee`
registry for its address and by searching for the name:

| Name | Pronounced | Address | Reads as | Search |
| --- | --- | --- | --- | --- |
| Tähelugu | TÄ-he-lu-gu | `tähelugu.ee`, also `tahelugu.ee` | *täht + lugu*: the sky's story, the form the product speaks in | nobody else uses the name |
| Kuutõus | KUU-tõus | `kuutõus.ee`, also `kuutous.ee` | *kuu + tõus*: the rising moon, the day's beat | also the Estonian title of a youth novel, so search is shared |
| Kuuke | KUU-ke | `kuuke.ee` | the diminutive of *kuu*: a small moon | a dictionary entry and stray clips, no product |

Each address answered "Domain not found", so each was free to register at the
time of the check. Names that failed the same check were set aside: `täheke.ee`,
`tähetark.ee` and `tahetee.ee` are registered, and *koidutäht*, *päevatäht*,
*öötäht* and *koidik* already belong to a book, a company, a party or a product.

## Decision

On 6.11.2026 the captain chose **Tähelugu** as the product's visible name and
`tähelugu.ee` as the address the page is served from. The name is one Estonian
word, so the address keeps the name's own letters.

The brand direction the name carries: the product speaks to one person, in the
second person singular and in plain Estonian, reading the day from a real natal
chart and saying what is happening and what to do with it. Its tone is calm and
matter-of-fact rather than mystical or alarming, it gives no medical, financial
or legal advice, and where it does not know something — an unknown birth time,
for instance — it says so instead of guessing.

## Consequence

The item splits into three steps with different owners, so each stands on its
own: this record; the name in the interface (the catalogue key, the spellcheck
allowlist, and the documents that carry the name); and the address (the domain
purchase, its DNS records, the site's own address and the repository rename).
The purchase, the DNS records and the site setting are the captain's steps, not
development days; once the domain answers, the old GitHub address carries a
permanent redirect to it.

A purchased domain is taken to serve the page from its root, so the address
becomes the page's own and `base` in `astro.config.mjs` falls away. Freshly
written storage keeps the old keys, and nothing a visitor saved is rewritten.
