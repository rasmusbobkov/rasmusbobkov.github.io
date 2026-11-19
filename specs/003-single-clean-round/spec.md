# Feature Specification: One complete clean planning round

**Feature Branch**: `inf/one-clean-planning-round-67ea`
**Status**: Accepted intent documented; delivery checks and dependent rollout remain pending
**Specification**: single-clean-round-v1
**Canonical issue**: [#41](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues/41); #39 remains the earlier routing outcome.
**Owner**: One assigned workflow implementer; the first mate coordinates independent reviews and dependent rollout.
**Input**: Approved planning-policy change, including the clarified separation of planning and implementation.

## User Scenarios & Testing

### User Story 1 — Finish a complete clean planning phase (Priority: P1)

A planning coordinator ends critique or readiness at its first complete clean aggregate rather than ordering another clean round automatically.

**Why this priority**: Remove the automatic confirmation round without removing independent reviewers or current coverage.
**Independent Test**: Independently apply the rule to a complete current three-person aggregate and verify that no automatic confirmation is required. Before activation this is a labelled rule walkthrough, not an observed live invocation.

**Acceptance Scenarios**:
1. Given all three required reviewers completed on matching current inputs without unresolved Blocker/Major, when the coordinator aggregates their results before repairs, then record one clean round. It converges under the new rule only if no separate stop applies. If a named unresolved question still stops progression, keep the aggregate clean and record the hold separately.
2. Given only attributed Nit findings, when they receive explicit dispositions, then they remain nonblocking and do not trigger automatic confirmation.
3. Given a missing, failed, unavailable or stale reviewer, mismatched readiness trilogy or unresolved blocking finding, when results are aggregated, then affected clearance stops; absence is not zero findings.

### User Story 2 — Verify repairs without rewriting history (Priority: P1)

A coordinator retains a failed result, obtains independent affected verification after repair, and confirms every role has current coverage before convergence.

**Why this priority**: Removing confirmation must not turn author fixes or stale reports into independent clearance.
**Independent Test**: Trace retained real review history through a labelled proposed-rule walkthrough, keeping historical verdicts unchanged and identifying the independent evidence required at each step.

**Acceptance Scenarios**:
1. Given a failed round, when the author repairs and repins inputs, then the original round remains failed and the repair is not review.
2. Given independent affected verification plus each unaffected reviewer's explicit applicability confirmation against the current bundle and delta, when the complete aggregate is clean and no separate stop applies, then it can converge without an automatic confirmation.
3. Given material later edits or uncertain impact, when coverage is assessed, then affected coverage and prior phase judgments reopen; uncertain scope broadens review or stops for reconciliation.
4. Given a recurring fixed issue, when an independent reviewer raises it again, then it reopens. A justified independent contest remains attributed; an accepted-risk label cannot waive a required condition.

### User Story 3 — Keep finite authority and prospective rollout (Priority: P1)

A coordinator knows which rule applies, which allowance is consumed and when work must stop, while keeping implementation validation separate.

**Why this priority**: A faster stopping rule must not create unbounded review, retrospective waivers or activation authority.
**Independent Test**: Independently inspect fifth-round, outer-limit, comprehension, churn, failed-reviewer and extra-review decisions, and inspect protected paths/history and transition instructions.

**Acceptance Scenarios**:
1. Given a new invocation after separately authorized integration and instruction alignment, when it starts, then its rule version is pinned. An underway invocation retains its starting rule and spent counters.
2. Given a complete clean fifth round and no other stop, then prospective convergence is allowed; a nonclean fifth round, missing review, churn or exhausted allowance stops. Drafting, renaming verification or starting another invocation resets nothing.
3. Given extra review, require a recorded high-consequence uncertainty or conflicting finding, evidence, deciding question, scope, reviewer, current inputs, expected signal, finite allowance and stopping condition; generic confidence is insufficient.
4. Given a clean-but-held fourth round and an authorized fifth-slot check of the open question on the same pin, require complete independent current role coverage in round 5. An answer alone cannot release round 4. Unaffected original reviewers may explicitly confirm applicability without a full reread; if complete coverage or another convergence condition is missing at the cap, stop.
5. Given implementation or a scope-preserving implementation repair, then the separate first-mate/no-mistakes/PR route remains; no automatic Lavish or Goldfish restart follows.

### Edge Cases

A clean aggregate cannot drop an unresolved named risk question to finish. An affected-only review cannot fill all three roles. A failed reviewer gets only the existing bounded retry. Numerical slots confer no launch authority. Comprehension has no critique/readiness inner loop. An exhausted outer allowance cannot conceal a sixth inner round. An exception remains an exception, not a clean result or passed proof.

## Requirements

### Functional Requirements

- **FR-001 — Required aggregate**: Critique retains design, structural and style; readiness retains implementation-readiness, codebase-details and style. Each independent reviewer declares persona, applicable standard, semantic scope, actual reads and matching current inputs. Exactly one assigned readiness reviewer analyzes the matching spec/plan/tasks in its report, separating analysis from design findings.
- **FR-002 — Clean and converged**: Determine cleanliness before repairs: a complete aggregate with no unresolved Blocker/Major is clean. One such aggregate meets the prospective convergence threshold, but an applicable separate stop still holds progression. Keep Nit attribution, affected scope and disposition separately; Nits alone need no confirmation. Missing/failed/unavailable/stale review is not zero findings. Preserve existing failed-reviewer handling, including its one bounded retry; never substitute author self-review.
- **FR-003 — Independent closure**: Author dispositions or fixes are not independent clearance. Required fixes receive independent affected verification on repinned inputs. Preserve failed verdicts. Reopen recurring fixed findings. Contests require concrete permitted-input counter-evidence and independent agreement; preserve exception and accepted-risk boundaries without manufacturing cleanliness.
- **FR-004 — Current coverage**: Review affected decisions, findings, scenarios and explanations independently. Retain unaffected coverage only when its independent reviewer explicitly confirms applicability to the current pinned bundle and delta. Every role needs current coverage. Material changes invalidate affected coverage and prior phase judgments; uncertain impact broadens affected review or stops for reconciliation.
- **FR-005 — Question-driven extra review**: Record the high-consequence uncertainty/conflict, evidence, deciding question, affected scope, independent reviewer, expected signal and stopping condition. Use actual remaining allowance and launch authority. Unresolved questions remain stops; do not order a generic second clean round for confidence.
- **FR-006 — Finite accounting**: Preserve five inner rounds per critique/readiness invocation, one outer stage re-audit after repair, comprehension's distinct initial-plus-one ordinary allowance and existing finite exceptions. Preserve churn: a new finding at an applied fix's scope that reverting the fix would resolve. Record phase/invocation, inner round, outer usage and remaining allowance separately. Repair verification consumes its applicable allowance. A complete clean fifth round may converge prospectively only if no other stop remains. An extra check charged to slot five must establish its own complete current coverage; on the same pin, earlier unaffected coverage counts only with the original reviewer's explicit current applicability confirmation. An incomplete fifth batch cannot release a clean-but-held fourth round. Nonclean fifth/missing review/churn/exhaustion stops; no new invocation or return to drafting hides or resets spent allowance.
- **FR-007 — Preserved authority and delivery**: Preserve ordinary first-mate-owned continuation within actual authority without implementing it again. Preserve all five significant-planning phases, plan-only comprehension, zero/five classification and separate implementation delivery. Keep criterion/check/evidence links, native committed-change/scenario review before proof execution, actual story/project checks, separate independent proof judgment and current hosted checks. Preserve product/scope, resource/cost/sensitive access, exception, merge and deployment consent. Codex only; no nested models, fallback or second runner.
- **FR-008 — Narrow integration and history**: One atomic project-authority override displaces only automatic two-clean convergence in planning critique/readiness. Do not edit installed/upstream/generated skills, personas, standards or preset. Advance the then-current constitution minor version. Preserve historical decisions, tasks, verdicts and evidence; append history and add only minimal forward references to the still-used routing specification, plan and quickstart.
- **FR-009 — Prospective transition**: Apply only to new invocations after separately authorized integration and matching instruction alignment. Pin the rule at invocation start; no retrospective waiver, counter reset or unused-slot transfer. This change's own planning uses then-current five phases and two-clean convergence until replacement becomes effective. Build approval is not activation, merge or deployment permission.
- **FR-010 — Honest operating evidence**: After integration/alignment the first mate owns a real fresh-session observation on genuinely authorized input-ready work. Retain actual method reads, reviewer ownership/coverage, aggregate, counts, affected verification when naturally needed and stops. Real retained history may support labelled rule walkthroughs only, never fabricated reports/live proof. Missing real cases remain explicit gaps. Repository alignment, activation and operating proof are distinct.

### Key Entities

- **Invocation record**: Starting rule/version, phase, pinned input bundle, context boundaries, assigned independent identities, rounds, outer usage, remaining authority and stops.
- **Review coverage**: Attributed findings and dispositions, reviewed input hashes, affected verification and explicit independent applicability confirmations for retained coverage.
- **Delivery record**: Committed-change/scenario judgment, actual checks and evidence, separate proof judgment, hosted checks and recorded gaps or specific exceptions.

## Success Criteria

### Measurable Outcomes

- **SC-001**: With no separate stop, a complete clean-first three-person aggregate finishes in one round without automatic confirmation. Otherwise retain the clean verdict and record the stop. Identities, reads, hashes and findings remain attributable.
- **SC-002**: When no separate stop applies, a failed/repair/independently verified sequence finishes at its first complete clean current aggregate while every original failed verdict remains unchanged.
- **SC-003**: Missing/stale review, mismatched trilogy, unresolved blocking findings and material later edits each prevent affected clearance; Nit-only findings remain attributed and nonblocking.
- **SC-004**: Fifth-round, outer-limit, comprehension and churn decisions retain separate finite accounting, no hidden sixth round and no drafting reset.
- **SC-005**: Every extra review has its named high-consequence question/conflict, current inputs, allowance and deciding signal; no unresolved question is silently dropped.
- **SC-006**: Independent preservation review confirms five phases/personas, plan-only comprehension, single readiness analysis, zero/five routing, separate implementation/proof, actual checks and consent; protected paths and historical bytes remain intact. Remaining two-clean wording is explained as upstream, historical or invocation-start applicability, not a competing active rule.
- **SC-007**: This change completes then-current design scrutiny, independent committed-documentation/scenario review, actual ordered full project gate, separate proof judgment and current hosted checks. No app journey or test edit is proposed; documentation-shape success alone proves none of the convergence semantics.
- **SC-008**: Dependent fresh-session real-case observation records actual reads, reviewer coverage and stops after integration/alignment, or explicitly retains the missing case and first-mate owner without claiming operating proof.

## Assumptions and Scope

Mandatory method reads provide project authority; native independent Codex contexts are available through first-mate coordination. Separate contexts are not independent model families or established reliability. No reliability percentage, runtime or cost saving is claimed.

Unchanged: app code/views/data, tests and expectations, dependencies, gate/security configuration, installed instructions/personas/standards, preset 0.2.0, licences, historical decisions/evidence, disabled events/hooks, care settings and host enforcement. Out of scope: reimplementing planning/implementation separation or ordinary continuation, Lavish work, installation reduction, workflow optimizations, providers/runners and reliability benchmarks. Future direction alignment and operating observation are dependent first-mate work, not completed by repository edits.
