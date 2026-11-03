# 0004 — Estonian is the source language in one interface message catalogue

## Context

The audience is Estonian-speaking, and the vocabulary is a product decision, not a translation detail: *sünnikaart*, *tõusumärk*, *maja*, *ruut*, *vastasseis*, *trigoon*. Copy spread across components would drift, and a second language would immediately diverge from the first.

## Decision

Keep every interface string in `src/messages/catalogue.ts`, with Estonian as the source language and the default. English exists only as structure for the language switch and is explicitly marked as coming, not shipped. Components carry `data-i18n` keys and no hardcoded copy. The day's story copy is content rather than interface: it is a field set on each typed unit in `src/lib/meaning.ts` (`open`, `tight`, `action`, `pitfall`, `astroNote`, and the four story paragraphs), which `app.ts` renders directly, so story wording is edited in the unit it belongs to. Local formats are Estonian: `14.03.1991`, 24-hour clock, decimal comma, and the address form *sina* throughout.

## Consequence

A copy change is one edit in one file — interface wording in the catalogue, story wording in its unit — and every gate can still read the whole corpus: the content gate and spellcheck run over the catalogue, including strings the app forms by interpolation, and over every field of every meaning unit. The cost is a single large file, and adding a language later means completing a table rather than changing components. The ET/EN switch currently only shows the "coming" note.
