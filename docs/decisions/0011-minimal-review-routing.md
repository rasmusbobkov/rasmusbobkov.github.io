# 0011: Match design review to change impact

## Context

Decision 0010 introduced Spec Kit and EGM with a relevant design phase even for bounded corrections. A correction whose accepted intent, cause, scope and expected result are understood can omit that separate design handoff while retaining independent delivery review and proof. Incorrect classification remains a residual risk, not a measured saving.

## Decision

Use zero EGM phases for small understood corrections with current accepted intent and no significant impact. New behavior, shared contracts, saved-data/security boundaries, workflow changes, unresolved architecture and ambiguity retain all five EGM design phases. Missing or stale inputs stop affected work for reconciliation.

This decision supersedes **only** decision 0010's bounded-correction relevant-phase requirement. Its other decisions, including all five phases for consequential changes, remain accepted. Preserve the original 0010 text as history and qualify its index status rather than rewriting its reasoning.

Final derived tasks must exist before readiness. Exactly one assigned readiness reviewer applies Spec Kit analyze to the same current spec/plan/tasks in its readiness report, separating consistency and design findings. Extra checklists require a concrete requirements-domain gap. Neither analysis nor design review proves working implementation.

Both routes retain one native independent delivery-review track: committed-code/documentation/scenario review, actual author validation and separate independent proof reading without duplicating the suite. Preserve the full npm gate, hosted checks, applicable changed-test repeats, existing review limits and actual continuation authority. No extra runner, plugin, external review pipeline, automatic care change or fabricated attestation is introduced.

## Consequences

Retaining one phase for every correction would add a design handoff despite unchanged understood intent; universal five-phase review adds more such coordination. An overlapping diff-review pipeline duplicates native delivery review. The chosen route reduces routine design handoffs but depends on accurate classification; current intent, recorded reasons, ambiguity escalation and independent delivery judgments mitigate rather than eliminate that risk. No time, token or cost saving is measured.

Application code, tests/expectations, packages, gate/security configuration, installed instructions, preset 0.2.0, licences and earlier history remain unchanged. Events and automatic hook execution remain disabled independently. Earlier installation-reduction candidates remain deferred, not part of this decision.

Repository alignment is distinct from activation and operating proof. After separately authorized integration, the first mate reconciles the existing standing direction in place and coordinates real fresh-session observations of both routes, retaining actual inputs, task counts and review/proof records. Missing reviewers, stale inputs or missing proof remain explicit gaps. This decision grants no merge or deployment authority.
