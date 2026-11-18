# Verification journeys

These are expected checks, not claims that they ran.

1. Run `specify preset resolve speckit.egm.draft`, `specify preset resolve speckit.egm.review`, `specify preset resolve speckit.taskstoissues` and `specify preset resolve plan-template`; expect the local preset. Refresh twice and compare generated content hashes.
2. A documentation-only correction selects comprehension; a workflow change selects all five phases. An ambiguous classification selects all five. The first mate records the classification and reason.
3. A stale specification is reconciled before work. If a required reviewer cannot be launched, record that reviewer as not run and stop; do not claim a clean review or automatic delegation.
4. At the committed version, use an installed documentation skill for a bounded artifact and coordinate a fresh independent review with declared sources and a recorded procedural context boundary.
5. Run `npm run check`, then `npm run build && npm test`. Retain actual results and the checked version.
6. After separate integration authorization, the first mate reconciles the standing project direction and verifies actual new-artifact reads in a fresh session. This is not deployment proof.
