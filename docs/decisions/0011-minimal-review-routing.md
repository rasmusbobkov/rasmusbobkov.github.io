# 0011: Match design review to change impact

## Planning and implementation boundary

Planning and implementation are separate tracks. Spec Kit → applicable Lavish visual-intent feedback → Goldfish prepares and reviews specifications and feature/bug plans under the existing zero/five classification. An understood correction with current accepted intent still needs no new EGM planning phase. Implementation follows first mate → native no-mistakes validation → PR: execute the accepted story, independently review the committed change, run criterion-specific and project checks, confirm documentation currency and obtain separate proof judgment before publication. Ordinary scope-preserving implementation repairs do not restart the planning track; changed intent returns to the affected planning step within actual authority. This distinction changes no finite allowance, consent, merge or deployment boundary and adds no external runner.

## Context

Decision 0010 introduced Spec Kit and EGM with a relevant design phase even for bounded corrections. A correction whose accepted intent, cause, scope and expected result are understood can omit that separate design handoff while retaining independent delivery review and proof. Incorrect classification remains a residual risk, not a measured saving.

## Decision

Use zero EGM phases for small understood corrections with current accepted intent and no significant impact. New behavior, shared contracts, saved-data/security boundaries, workflow changes, unresolved architecture and ambiguity retain all five EGM design phases. Missing or stale inputs stop affected work for reconciliation.

This decision supersedes **only** decision 0010's bounded-correction relevant-phase requirement. Its other decisions, including all five phases for consequential changes, remain accepted. Preserve the original 0010 text as history and qualify its index status rather than rewriting its reasoning.

Final derived tasks must exist before readiness. Exactly one assigned readiness reviewer applies Spec Kit analyze to the same current spec/plan/tasks in its readiness report, separating consistency and design findings. Extra checklists require a concrete requirements-domain gap. Neither analysis nor design review proves working implementation.

Both routes retain one native independent delivery-review track: committed-code/documentation/scenario review, actual author validation and separate independent proof reading without duplicating the suite. Preserve the full npm gate, hosted checks, applicable changed-test repeats, existing review limits and actual continuation authority. No extra runner, plugin, external review pipeline, automatic care change or fabricated attestation is introduced.

Routine input-ready continuation and scope-preserving repair are first-mate coordinated within actual remaining finite authority, not repeated human approval questions. Product/scope, unresolved intent, resource/cost/sensitive effects, exceptions and cap/churn extensions remain human decisions. No allowance resets.

UI-changing intent requires supported local Lavish feedback and recorded human acceptance of the CURRENT canonical spec/mock visual direction before FIRST Goldfish, including brainstorm concept review. Codex generates HTML; Lavish renders and returns feedback. Revise spec before mock; rejection/material change returns to visual review. Feedback, silence, session end or reply receipt never accepts a direction. Non-UI work records inapplicability; missing capability/permission stops affected work. The process guide carries isolation, one-shot listener rearming and owned-cleanup obligations; no publication/account/tooling permission follows.

Story criteria and check/evidence links precede implementation. Completion requires actual criterion-covering execution and independent proof, not code, generic tests or mock suitability. Failures return to bounded repair/retest/review; missing evidence blocks completion and an approved exception is not a pass. Current independent committed-change/scenario review, actual story/project checks, documentation currency and separate proof precede new or updated PR publication. Hosted checks follow publication.

## Consequences

Retaining one phase for every correction would add a design handoff despite unchanged understood intent; universal five-phase review adds more such coordination. An overlapping diff-review pipeline duplicates native delivery review. The chosen route reduces routine design handoffs but depends on accurate classification; current intent, recorded reasons, ambiguity escalation and independent delivery judgments mitigate rather than eliminate that risk. No time, token or cost saving is measured.

Application code, tests/expectations, packages, gate/security configuration, installed instructions, preset 0.2.0, licences and earlier history remain unchanged. Events and automatic hook execution remain disabled independently. Earlier installation-reduction candidates remain deferred, not part of this decision.

Repository alignment is distinct from activation and operating proof. After separately authorized integration, the first mate reconciles the existing standing direction in place and coordinates real fresh-session observations of both routes, retaining actual inputs, task counts and review/proof records. Missing reviewers, stale inputs or missing proof remain explicit gaps. This decision grants no merge or deployment authority.
