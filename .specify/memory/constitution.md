# Tähelugu development constitution

**Version:** 1.1.0

## Authority and intent

Spec Kit and the Elephant-Goldfish Model (EGM) are the project development workflow. Host instructions, task scope, consent and applicable permissions take precedence. Reading these documents grants no implementation, merge, deployment or resource-access permission. Engineering documentation is English; the application is Estonian-first.

## Canonical artifacts and ownership

Each bounded outcome has one canonical issue in its established product-planning or technical-issue tracker, one implementation owner and one `specs/<feature>/spec.md` for intended behavior. `plan.md` owns the technical approach; EGM drafting refines that same file. `tasks.md` is a derived execution checklist, not another backlog. Concepts briefs and review reports are working inputs or evidence, not competing specifications. Do not migrate or publish private tracker contents. Branch names and feature directories are independent; use `SPECIFY_FEATURE_DIRECTORY` or an ignored local pointer.

The project architecture and run/verify guide is [docs/architecture.md](../../docs/architecture.md); product rules and their verification owners are [docs/invariants.md](../../docs/invariants.md), including the approved cookieless measurement exception. [Decisions](../../docs/decisions/index.md) retain reasons and [RECORD.md](../../RECORD.md) retains history. Do not weaken or duplicate those records.

## Workflow and review

1. Reconcile the canonical issue, single implementation owner, branch, scope and accepted source revisions. The first mate records classification and reasons. Missing or stale applicable intent/artifacts stop affected work for reconciliation.
2. A small understood correction has a known cause, bounded scope and expected result under current accepted intent, with none of the significant impacts below. It uses zero EGM phases, no EGM-Lite substitute and no automatic new requirements checklist. Reuse valid intent/artifacts and update documents made stale by the correction.
3. New behavior, shared contracts, saved-data or security boundaries, workflow changes and unresolved architecture require all five EGM design phases: initial zoom out, standalone comprehension, design critique, intermediate zoom out and implementation readiness. Ambiguity takes this significant route. Use Spec Kit specify/clarify for requirements, plan for the technical approach, EGM draft to refine that same plan, and tasks for the derived execution list.
4. Coordinate fresh reviewers through native host tasks using explicit persona filenames, pinned inputs and declared context boundaries. Standalone comprehension receives the plan alone as design input, without author conversation or explanatory sources. Final derived tasks must match the current spec and plan before readiness. Exactly one assigned readiness reviewer applies Spec Kit analyze to that same trilogy in its readiness report, separating consistency/coverage findings from EGM design findings; do not commission a duplicate general reread. Extra requirements checklists require a concrete domain gap and are not implementation proof.
5. Preserve existing stage reports, loop limits and actual continuation checkpoints. Record actual reads, versions, reviewer status, attributed findings and dispositions. A missing reviewer or unresolved Blocker/Major stops the affected step; Nits alone do not block. Author fixes are not independent clearance. Follow the integration guide's disposition and affected-repeat rules.
6. After implementation authorization, implement accepted scope and use converge only for remaining accepted work. Both routes retain one native independent delivery-review track: committed-code/documentation and scenario review, actual author validation, then a separate independent proof read of the retained evidence. The reviewer reads author evidence instead of repeating the suite. Design review does not replace implementation review; one track is not one model call. No external no-mistakes agent pipeline or automatic care-setting change is added. Attestation requires actual accepted current-version records, not a label or an invented claim.
7. Obtain separate merge and deployment authority. Repository alignment, post-merge standing-direction reconciliation and real fresh-session both-route observations are distinct checkpoints. The first mate replaces the existing direction in place after authorized integration and coordinates unavailable launches/proof; conflicting instructions stop affected work until reconciled. Plans and reviews are not executed checks or rollout proof.

Automatic EGM spawning, persona registration, nested delegation and a complete automated review loop are unproven. Do not replace them with self-review, a second runner, automatic hooks or event handlers. Host card and authority rules govern interaction when generated instructions conflict. Reconcile stale or missing specifications before work and report gaps rather than inventing success.

## Verification

Run `npm ci`, `npm run check` and `npm run build && npm test`; build precedes tests because checks read built output. The test gate includes documentation and file-length checks. Preserve the final full local gate, current hosted checks and applicable changed-test repetitions. Record affected-review/check applicability after edits; new design decisions reopen affected design scrutiny, not every unchanged phase automatically. Record actual commands, source revision, environment, findings and retained evidence. Follow project test rules and the [integration guide](../../docs/process/spec-kit-egm.md).
