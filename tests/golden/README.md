# Golden copy set — the pinned voice

`tests/golden/day-readings.json` pins the day-view copy: one entry per
day unit (the 18 transit-shape meaning units plus the honest quiet
unit). Each entry snapshots the strings the app renders for that unit's
**fixed input** — a synthetic transit hit defined in
`tests/content-golden.test.ts` (never the device clock, no ephemeris,
no network) — so a generator change that alters the voice fails `npm
test` until the changed copy has been re-read and re-pinned.

## What the goldens are

- **Real shipped copy, not placeholders.** Every snapshot is taken from
  the app's live rendering path (`selectDayReading` over the unit's
  fixed input), so the pinned tokens are exactly what the app displays.
- **Provisional until the captain says otherwise.** The pinning comment
  at the top of the JSON and each entry's `status: "provisional"` mark
  that this unit's text has not yet been through a captain-owned edit.
  That marking exists precisely so provisional copy is never passed off
  as approved. Flipping an entry to `approved` requires the captain's
  edit/review of the exact strings; note the approving review here.

## Re-pinning after a reviewed copy change

```sh
GOLDEN_UPDATE=1 npm test -- --run tests/content-golden.test.ts
```

This rewrites the file from the live app copy (deterministic, offline)
and re-runs the checks. The update run does not itself approve anything:
status stays `provisional` unless the reviewer ALSO edits the status by
hand, with the captain's review as the basis.

## What else guards the voice

`tests/content-gate.test.ts` runs the mechanical voice rules over the
same corpus: banned promise/certainty/money/health vocabulary, story
shape (four paragraphs, imperative close, per-paragraph word and
syllable bounds), tier-2 astrological containment, and tier-1 approved
aspect terms. The goldens pin the exact wording; the gate pins the
rules the wording must obey.
