# Specification: Spec Kit and EGM workflow transition

**Specification:** spec-kit-egm-replacement-v1
**Status:** Approved for implementation; not merge or deployment approval
**Review policy:** Proportionate, selected as “Match review to the change”

## Outcome

Replace the existing custom development manual entirely with Spec Kit and EGM as the project workflow. The application remains unchanged. The constitution and integration guide describe canonical artifacts, existing tracker roles, selected review scope, checks and host limits. One coherent change removes the old manual while installing consistent replacement entrypoints and adaptations.

## Requirements and acceptance

1. Remove the old active manual; no root instruction, guide or local preset selects it. Preserve historical references as history.
2. A fresh reader can identify the constitution, workflow, canonical specification and issue roles, owner, gate and host limits without private author conversation.
3. Constitution 1.0.0 has no unexplained placeholders; product-rule links resolve, including the approved cookieless counter exception.
4. A feature directory owns one `spec.md`, one `plan.md` and a derived `tasks.md`; neither a parallel design master nor another backlog is created. Product planning and technical issues keep their established roles, with one canonical issue per outcome.
5. Preset 0.2.0 resolves adapted commands and plan template. Repeated regeneration produces identical generated content and retains prior stage-report and feature/task identity fixes.
6. Inspect all seven EGM definitions and shared instructions against the replacement authority. Report unresolved references, personas and delegation as gaps.
7. At the new committed version, use an installed documentation skill for a bounded journey; retain its output and independently coordinated fresh review with declared inputs, sources and actual context boundary.
8. Demonstrate review routing for a small correction and a consequential change. New behavior, shared contracts, saved-data/security boundaries and workflow changes use all five EGM phases; bounded corrections use the relevant phase, and ambiguity takes the full route. The first mate records classification and reasons.
9. Demonstrate stale-specification and missing-reviewer handling: reconcile or report not run, never substitute self-review or fabricate delegation.
10. Run `npm run check` and `npm run build && npm test`, including documentation and file-length checks, on final contents. Build precedes tests.
11. Obtain independent review and current hosted checks for the revised existing pull request; older passes are historical.
12. After separately authorized integration, the first mate reconciles the standing direction and verifies it and actual new-artifact reads in a fresh project session.

## Constraints and non-goals

Preserve application behavior, product invariants, architecture ownership, historical decisions and record entries, test expectations and gate configuration. Keep credentials, host authority, release/deployment settings, other projects and pinned component versions unchanged. No new runner, automatic delegation, hook or event handler, global plugin, mass README bootstrap, backlog migration, unrelated repair, merge or deployment is authorized.

## Assumptions and boundaries

One canonical specification applies per bounded outcome. Existing product and technical trackers retain distinct roles without duplicating outcomes. EGM concepts briefs and reports are working inputs/evidence. Host permissions outrank generated instructions. Coordinated fresh review is not evidence of automatic EGM delegation. Engineering documentation is English; the product remains Estonian-first.
