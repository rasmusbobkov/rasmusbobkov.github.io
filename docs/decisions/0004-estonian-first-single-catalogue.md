# 0004 — Estonian is the source language in one message catalogue

## Context

The audience is Estonian-speaking, and the vocabulary is a product decision, not a translation detail: *sünnikaart*, *tõusumärk*, *maja*, *ruut*, *vastasseis*, *trigoon*. Copy spread across components would drift, and a second language would immediately diverge from the first.

## Decision

Keep every user-facing string in `src/messages/catalogue.ts`, with Estonian as the source language and the default. English exists only as structure for the language switch and is explicitly marked as coming, not shipped. Components carry `data-i18n` keys and no hardcoded copy. Local formats are Estonian: `14.03.1991`, 24-hour clock, decimal comma, and the address form *sina* throughout.

## Consequence

A copy change is one edit in one file, and every gate can read the whole corpus from that one place: the content gate and spellcheck both run over the catalogue, including strings the app forms by interpolation. The cost is a single large file, and adding a language later means completing a table rather than changing components. The ET/EN switch currently only shows the "coming" note.
