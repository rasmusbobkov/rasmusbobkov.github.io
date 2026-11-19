# Feature Specification: Minimal review routing

**Specification**: minimal-review-routing-v1
**Status**: Original routing design reviewed and implemented; an approved workflow enhancement is being reconciled in this same feature. Its affected review and delivery are pending; integration and activation remain pending.
**Canonical technical issue**: [#39](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues/39); distinct from closed #38
**Implementation owner**: Assigned workflow implementer (one owner throughout)
**Feature directory**: `specs/002-review-routing`

## Planning and implementation boundary

Planning and implementation are separate tracks. Spec Kit → applicable Lavish visual-intent feedback → Goldfish prepares and reviews specifications and feature/bug plans under the existing zero/five classification. An understood correction with current accepted intent still needs no new EGM planning phase. Implementation follows first mate → native no-mistakes validation → PR: execute the accepted story, independently review the committed change, run criterion-specific and project checks, confirm documentation currency and obtain separate proof judgment before publication. Ordinary scope-preserving implementation repairs do not restart the planning track; changed intent returns to the affected planning step within actual authority. This distinction changes no finite allowance, consent, merge or deployment boundary and adds no external runner.

For new critique/readiness invocations after separately authorized integration and instruction alignment, see [decision 0012](../../docs/decisions/0012-single-clean-round.md) for the convergence threshold. The two-clean rule described here remains historical or invocation-pinned; prior verdicts and counters do not change.

## User Scenarios & Testing

### User Story 1 — Correct understood defects without duplicate design review (P1)

A maintainer with a bounded, understood correction uses applicable accepted intent and artifacts without commissioning an EGM phase.

**Why this priority**: Remove an unnecessary design review without dropping delivery checks.

**Independent test**: Observe a fresh session classify a real small correction, record its accepted inputs and reason, and create zero EGM tasks.

**Acceptance scenarios**:
1. Given current accepted intent and a correction with no significant impact, classification selects zero EGM phases and one independent delivery-review track.
2. Given missing or stale intent, the affected work stops for reconciliation instead of using the exception.

### User Story 2 — Keep significant design scrutiny (P1)

A maintainer changing behavior, shared contracts, saved-data or security boundaries, workflow, or unresolved architecture receives all five design phases.

**Why this priority**: The smaller route must not weaken consequential decisions.

**Independent test**: Observe a real significant case with five ordered phase records and a final current-artifact readiness report.

**Acceptance scenarios**:
1. Given any significant trigger or ambiguity, the first mate records the reason and coordinates fresh reviewers for initial zoom out, comprehension, design critique, intermediate zoom out and implementation readiness.
2. Given final derived tasks, one assigned readiness reviewer also analyzes the matching specification, plan and tasks in the same report, separating consistency findings from design findings.
3. Given standalone comprehension, its only design input is the plan, without author conversation or explanatory sources.

### User Story 3 — Deliver with one independent review track and honest proof (P1)

A maintainer obtains independent committed-change/scenario review, executes checks, and receives a separate evidence judgment without another generic reread or duplicate test run.

**Independent test**: Follow a real delivery record from pinned change review through author execution and independent proof read.

**Acceptance scenarios**:
1. Both routes retain implementation/documentation review, the full local gate, hosted checks and applicable changed-test repetitions.
2. A reviewer reads author evidence rather than rerunning the suite. Missing reviewer or proof remains a gap, not success.
3. Care labels and design approval do not stand in for accepted review/evidence records or grant merge/deployment authority.

### User Story 4 — Refine UI intent visually before design review (P1)

A maintainer sees a Lavish mock derived from the current specification and user stories before the first Goldfish review, including brainstorm concept review, so visual feedback corrects intent before detailed review and implementation.

**Independent test**: Trace a real authorized UI specification through a version-linked mock, human feedback, canonical specification revision and only then initial EGM review. Do not claim this observation from a textual procedure alone.

**Acceptance scenarios**:
1. Given UI intent and an established supported Lavish route, agents prepare the mock linked to the specification version; the human judges the intended visual direction.
2. Given visual feedback, update the canonical specification and revised mock, then obtain recorded human acceptance of the CURRENT version-linked visual direction before submitting matching intent and plan to FIRST Goldfish. Rejected/materially changed direction returns to visual review; feedback, silence, session end and reply receipt do not accept it.
3. Given no UI impact, record why the visual step is inapplicable. Given unavailable Lavish capability or permission, stop that affected step and record the dependency rather than inventing an integration or substituting another tool silently.
4. A suitable mock is neither implemented behavior nor an implementation, merge or deployment authorization.

### User Story 5 — Agents close bounded implementation and validation loops (P1)

The human chooses goals and consequential decisions while agents coordinate ordinary scope-preserving implementation, tests, independent judgments and repairs within finite existing limits.

**Independent test**: Trace a user story from acceptance criteria through actual execution evidence and independent proof judgment, including a failed criterion returned for repair and affected retest, or an explicit missing-proof stop.

**Acceptance scenarios**:
1. Before implementation, each story has explicit acceptance criteria and an actual check method; derived tasks connect the story, check and evidence.
2. A story is not marked implemented/accepted from code or generic passing tests alone: actual criterion-covering execution and independent proof judgment are required, using end-to-end checks where appropriate.
3. Ordinary repair, affected retest/review and the next input-ready phase or allowed round are agent-coordinated without another generic human continuation question, within actual remaining allowances and resource authority.
4. Product/scope choices, unresolved intent, sensitive access/cost, evidence exceptions, exhausted limits or churn stop for the actual human decision. Existing used allowances do not reset.
5. One native delivery-control track must complete independent change review, actual story/project checks and a separate proof judgment before PR publication or publishing an updated version. Required hosted checks follow publication; merge remains separately authorized. No duplicate external no-mistakes runner is added.

## Requirements

- **FR-001**: Record one canonical issue, one implementation owner, current intent/artifact references, classification and reasons. Pending assignment is explicit and does not prohibit drafting its scope.
- **FR-002**: Small understood corrections with none of FR-003's triggers receive zero EGM phases, no EGM-Lite substitute and no automatic new requirements checklist.
- **FR-003**: New behavior, shared contracts, saved data, security, workflow changes, unresolved architecture and ambiguity require all five current EGM design phases.
- **FR-004**: Use genuine fresh native host reviewers with declared inputs, versions, context boundaries, statuses and attributed findings. Missing reviewers and unresolved blockers stop affected progression.
- **FR-005**: Standalone comprehension receives the plan alone as design input, not the author conversation, linked explanations or earlier review findings.
- **FR-006**: Final derived tasks exist before readiness. Exactly one assigned readiness reviewer applies Spec Kit analyze to the same current spec/plan/tasks and reports analysis and EGM findings distinctly. Do not commission duplicate general reads of unchanged inputs.
- **FR-007**: Additional checklists require a concrete requirements-domain gap and never prove functioning implementation. This feature's requested requirements checklist assesses its specification only.
- **FR-008**: Retain one native independent committed-code/documentation/scenario review track, actual author validation and a separate proof read. Design review cannot substitute for implementation review.
- **FR-009**: Preserve `npm ci`, `npm run check`, `npm run build && npm test` (build first), final full gate, hosted checks and applicable edited-test repetitions. Reviewers consume evidence, not duplicate the suite.
- **FR-010**: Change neither care settings nor attestation rules automatically. Only actual accepted current-version records can support compatible host attestation; never fabricate one.
- **FR-011**: Keep app code, tests/expectations, packages, gate/security configuration, installed files, local preset 0.2.0, licences and historical records unchanged. Keep events disabled AND automatic hook execution disabled. No new plugin, runner, nested agent or installation reduction.
- **FR-012**: Align the constitution, process guide, decision 0011/index and factual history as one change after this change's required design clearance. Preserve earlier history and tracker roles.
- **FR-013**: After separately authorized merge, the first mate replaces the existing standing direction in place and coordinates real fresh-session verification of both routes. Until reconciliation, conflicting active instructions stop affected work.
- **FR-014**: Later changes invalidate affected checks/reviews; new design decisions reopen affected design scrutiny, not every unchanged phase automatically. Preserve existing loop limits and report unresolved limits honestly.

- **FR-015**: UI-changing design MUST pass a specification/story-linked Lavish visual-feedback loop before its first Goldfish review, including early brainstorm concept review. When the human identifies an error, correct every affected canonical specification section first, then revise the mock and conduct another Lavish visual-review round. Do not dispatch FIRST Goldfish until the human is satisfied with and explicitly accepts that current spec/mock pair; this prerequisite applies again after revisions. Non-UI inapplicability is recorded. Missing capability or permission stops the affected step.
- **FR-016**: Each story MUST specify acceptance criteria and an actual verification method before implementation. Tasks link criteria to checks/evidence; actual execution and independent proof judgment are required before claiming story completion. Exceptions remain explicit exceptions, not test passes.
- **FR-017**: The first mate MUST coordinate bounded scope-preserving fixes, affected checks/reviews and next input-ready stages/allowed rounds without routine human continuation cards. This replaces the original routine-checkpoint policy only; actual finite counters, churn stops and required human authority remain intact.
- **FR-018**: Human authority MUST remain required for new product/scope decisions, unresolved intent, access/cost/sensitive effects, limit extension, evidence exceptions, merge and deployment. Codex-only direct independent reviews remain; no nested models or alternative provider fallback.
- **FR-019**: One native pre-PR delivery-control track MUST include independent committed-change/scenario review, actual story/project checks, documentation currency and separate proof judgment, including for an updated PR version. This is repository policy, not new host enforcement, care-setting change, plugin/runner installation or a claim of automatic Lavish integration.

### Edge cases

- A short workflow edit is significant despite its size; this feature itself takes five phases under the current constitution.
- A stale final trilogy blocks readiness; matching filenames alone are insufficient.
- Documentation-only validation must not invent an application journey or measured savings.
- Repository alignment alone is not activation or proof of automatic delegation.
- Reaching a review-loop limit does not turn unresolved blocking findings into clearance.

## Success Criteria

- **SC-001**: A real fresh-session small case records zero EGM tasks and a significant case records all five phases, with observed inputs, task identities/counts and reasons.
- **SC-002**: One final readiness report identifies the matching three artifacts and separately attributes consistency and design findings.
- **SC-003**: One current delivery record links independent committed-change review, actual gate results, hosted results and separate proof judgment, with gaps explicit.
- **SC-004**: All active project policy documents agree on routing after integration; activation and both-route verification remain separately observable rollout checkpoints.
- **SC-005**: The change contains no app, installed-package, gate, security, test-expectation or historical-content alteration and claims no unmeasured time/cost saving.

- **SC-006**: A real UI case records the version-linked Lavish feedback/spec revision before initial EGM review, or its actual missing-route/permission gap; a non-UI case records justified inapplicability.
- **SC-007**: A real story's completion record identifies acceptance criteria, actual execution evidence and independent proof judgment; failed/missing evidence cannot silently become completion.
- **SC-008**: An ordinary within-limit repair/next-stage continuation is agent-owned, while a genuine authority/limit decision stops; earlier used counters remain visible.

## Assumptions and dependencies

Existing Spec Kit 1.2.5, installed EGM port 0.9.1 and local preset 0.2.0 remain sufficient; automatic delegation is unproven. Native host task launches and post-merge standing-direction activation require first-mate coordination. Canonical technical issue #39 was created with its specific consent. Implementation is approved; merge and deployment are not. No product data model or external runtime interface changes. The approved enhancement is part of this same feature/issue/PR, not another builder or backlog. The established route is Kun Chen's installed lavish-axi 0.1.96 local HTML review CLI: Codex generates the HTML, Lavish renders/annotates/returns feedback. Discovery does not prove actual rendering/feedback/resumption. Telemetry is off, host/link are loopback, task state and unused port are isolated, assets/data are local/disposable and an owned tracked listener is cleaned up. No integration installation, share/publication/upload, hooks, account change or paid service permission is assumed. Original design/gate/proof records remain evidence only for their actual inputs; changed claims require affected review and proof.
