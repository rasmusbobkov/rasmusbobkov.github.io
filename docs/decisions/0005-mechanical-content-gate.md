# 0005 — The app mechanically blocks bad copy

## Context

Astrology copy drifts easily into promises of outcomes, certainty, money or health claims. The captain reversed the earlier posture that tests only prove mechanics: "sisu on toode" — the content is the product, so the app itself must stop a bad sentence rather than relying on review discipline.

## Decision

Put deterministic, offline content gates inside `npm test`. `tests/content-gate.test.ts` rejects promise and certainty vocabulary and money/health patterns across the catalogue, interpolated strings and every meaning-unit field; enforces a four-paragraph story that closes with its unit's action; forbids astrology vocabulary in the story tier; and bounds length and readability. `tests/content-golden.test.ts` pins 31 day readings, with a separate approvals block that only the captain's hand edit can mark approved. `tests/spelling.test.ts` runs every shipped word through a committed et_EE dictionary with a reviewed allowlist. Every trip wire ships a proven failing case.

## Consequence

Copy changes are slower and deliberate: a golden update re-pins text and an approval only moves by human edit, so a generator change that alters the voice fails until reviewed. In exchange, banned language and misspellings cannot reach production unnoticed, and the gates run offline and fast enough to be part of every test run.
