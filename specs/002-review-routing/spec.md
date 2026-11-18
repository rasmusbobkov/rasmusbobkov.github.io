# Feature Specification: Minimal review routing

**Specification**: minimal-review-routing-v1
**Status**: Draft for five-phase design review; not active policy
**Canonical technical issue**: Assignment pending; proposed new issue, not closed #38
**Implementation owner**: Assigned workflow implementer (one owner throughout)
**Feature directory**: `specs/002-review-routing`

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

## Assumptions and dependencies

Existing Spec Kit 1.2.5, installed EGM port 0.9.1 and local preset 0.2.0 remain sufficient; automatic delegation is unproven. Native host task launches and post-merge standing-direction activation require first-mate coordination. Issue creation awaits its single specific consent. Implementation is approved; merge and deployment are not. No product data model or external runtime interface changes.
