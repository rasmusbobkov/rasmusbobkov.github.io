# Implementation Plan: Minimal review routing

**Specification**: minimal-review-routing-v1
**Plan revision**: draft-1
**Status**: Design inputs only; policy implementation awaits five-phase clearance
**Canonical technical issue**: Assignment pending; do not reuse closed #38
**Implementation owner**: Assigned workflow implementer (single owner)
**Spec**: [spec.md](spec.md)

## Summary

Replace the current single relevant EGM phase for small understood corrections with zero EGM phases. Keep all five design phases for significant changes, and keep one independent native delivery-review track for either route. This changes development documentation only, not the application or installed tooling.

The first mate classifies impact from current accepted intent, not line count. New behavior, shared contracts, saved-data/security boundaries, workflow changes, unresolved architecture or ambiguity select the significant route. Missing or stale intent stops affected work for reconciliation. Small corrections reuse valid intent and artifacts rather than generating a new design ceremony.

## Review responsibilities

Spec Kit owns requirements, the technical plan and derived execution tasks. EGM judges design. The native delivery-review track judges the committed implementation/documentation and scenarios, then separately judges author evidence. None substitutes for the others, and one track does not mean one model call.

Significant work uses fresh reviewers in order: initial zoom out, standalone comprehension, design critique, intermediate zoom out, implementation readiness. The first mate launches direct native host tasks only after the author supplies real pinned inputs. Initial zoom out receives this actual draft and declared baseline context. Comprehension receives this plan alone as design input, without the author conversation, explanatory sources, earlier reports or automatic linked-file expansion. Other phases receive declared appropriate current context and prior findings where required.

Before readiness, update the derived tasks to match the final specification and plan. One assigned readiness reviewer applies Spec Kit analyze to that exact trilogy in the same report; separate design findings from consistency/coverage findings. Other reviewers do not duplicate that analysis. Additional requirements checklists need a concrete domain gap, not a stage name. Preserve phase-specific reports, attributed findings and existing loop limits. Missing reviewers or unresolved blockers are not clearance.

Independent delivery review covers all changed files and accepted scenarios at the committed version. The author executes actual checks; the proof reader reads their retained evidence rather than rerunning the suite. Subsequent edits invalidate affected evidence/reviews, not unchanged facts automatically. A new design decision reopens affected design scrutiny. Care settings stay unchanged; no attestation is invented from labels, green checks or design approval.

## Technical Context

- English Markdown workflow documentation; no runtime/API/schema change.
- Existing Spec Kit 1.2.5, EGM port 0.9.1 and local preset 0.2.0 stay installed unchanged.
- Existing Astro application and npm lockfile/gate remain untouched.
- Node baseline verified as v22.23.4; npm 10.9.9.
- Verification: author runs `npm ci`, `npm run check`, then `npm run build && npm test`; hosted checks remain required. Applicable edited-test repeats remain unchanged; no test edit is planned.
- No measured latency/cost target, new package, runner, nested agent, plugin or hook.

## Constitution Check

Current constitution 1.0.0 requires five phases for this workflow change. Drafting canonical inputs is authorized, not policy activation. Required design reviews are not yet run. Canonical issue assignment is pending, explicitly not satisfied by the old transition issue. One owner remains responsible. The approved exception changes the bounded-correction rule only after review and integration; current significant-review authority is not bypassed.

All hooks are empty and `auto_execute_hooks: false` remains unchanged; events remain disabled independently. No application or installed instruction-file changes are planned. Review records must name actual files, revisions/hashes, persona/standard, context exclusions, results and dispositions. This draft is not a completed review or executed test.

## Project Structure

Canonical artifacts: `specs/002-review-routing/{spec.md,plan.md,tasks.md,quickstart.md,checklists/requirements.md}`. Policy targets: `.specify/memory/constitution.md`, `docs/process/spec-kit-egm.md`, `docs/decisions/0011-minimal-review-routing.md`, `docs/decisions/index.md`, `RECORD.md`. Existing architecture/invariant documents remain owners of application rules; inspect references for actual staleness, without unrelated rewrites. No new data-model or API-contract artifact is needed for this internal documentation change. Earlier transition artifacts remain history.

## Detailed Implementation Plan

### 1. Establish and review canonical inputs

Draft the five feature artifacts with issue assignment explicitly pending and one implementation owner. Request only consent to create the proposed canonical technical issue; once created, record its actual public reference without private task records. Keep product-planning and technical trackers in their established roles. No issue is fabricated, reopened or duplicated across trackers.

Pin draft content in a commit. Before each phase request exact real input paths, commit and content hashes, persona and standard, required reviewers and context exclusions through the first mate. Do not reserve reviewers with extra sessions. For initial zoom out use zoom_out.md and inventive_catalyst.md with the installed zoom-out standard; comprehension uses comprehension.md and plan-only input. Critique uses design_critic.md, structural.md and style.md; intermediate zoom out uses zoom_out.md plus actual previous phase findings/dispositions. Readiness uses implementation_readiness.md, codebase_details.md and style.md, with exactly one assigned trilogy-analysis owner. Preserve distinct stage reports in task evidence, not a competing design master. Resolve findings in this plan and regenerate matching tasks before readiness. Stop on missing/stale inputs or missing required reviewers.

### 2. Align policy after required design clearance

Update `.specify/memory/constitution.md` from 1.0.0 to 1.1.0, preserving authority, artifact ownership and verification. Replace the bounded correction's one-phase requirement with the zero-phase exception; retain significant triggers and all five phases. Describe nonduplicative final analysis, implementation review and separate evidence read.

Update `docs/process/spec-kit-egm.md` with the matching classification, readiness ownership, context boundaries and single native delivery-review track. Keep existing installed-port/preset/licence/version provenance, generated-instruction dispositions and disabled hooks/events. Explicitly retain `npm ci`, `npm run check`, `npm run build && npm test`, hosted checks and applicable changed-test repeats. No external no-mistakes agent pipeline or automatic care change is added.

Add `docs/decisions/0011-minimal-review-routing.md` with context, decision and consequence: removing one unnecessary small-correction design phase, not weakening significant scrutiny. Add its sole index row in `docs/decisions/index.md`. Append factual history in `RECORD.md`; do not rewrite earlier events or claim fresh-session proof not yet observed.

### 3. Validate and obtain independent delivery judgments

Read the whole diff against accepted scope and check unchanged protected areas. Obtain native independent committed-documentation/scenario review. Run the full local gate with logs outside the working copy; retain command, source version, exit status and environment. Resolve regressions owned by this change. Documentation-only work has no changed application view or legitimate new application journey; do not manufacture one. Gate output proves checks, not live routing.

Use `quickstart.md` for the actual routing observations. The delivery proof reader separately examines current author evidence, scope preservation and explicit rollout gaps without repeating the suite. Rebase onto the current default branch, resolve overlap, rerun affected validation and satisfy hosted checks before the merge card. A later change receives affected review/check updates. Build approval is not merge/deployment permission.

### 4. Dependent post-merge rollout

The first mate replaces the existing project standing direction in place after separately authorized integration, matching merged constitution/guide rather than creating a competing policy. Then a real fresh Infinitary session reads merged method inputs and the active direction and demonstrates both real routes. Record input revisions/readings, actual case intent, classification reasons, task identities/counts (zero EGM for small; five ordered phases for significant), readiness trilogy-analysis ownership and the delivery review/proof chain. Do not implement the sample changes without their own scope authority.

Report repository alignment, direction activation and fresh-session proof as distinct checkpoints. Conflicting old direction/new documents stop affected routing until reconciliation. Missing launches/proof stay open with the first mate; no claim of automatic delegation, completed activation, measured saving or fabricated attestation. Include this dependent work in the eventual change story's after-merge handoff.

## Dependencies and evidence boundaries

Issue creation consent, real fresh design reviewers, independent delivery review/proof reading and first-mate rollout are dependencies, not inferred successes. Authoring can continue while issue consent waits; issue identity must be reconciled before claiming canonical readiness. No policy edit occurs before the five required design phases clear. Review acceptance never authorizes merge or deployment. Installation reductions (both previously considered sizes) remain deferred and unqueued.
