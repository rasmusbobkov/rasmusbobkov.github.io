# Implementation Plan: One complete clean planning round

- **Branch**: `inf/one-clean-planning-round-67ea` | **Spec**: [spec.md](spec.md)
- **Specification**: single-clean-round-v1 | **Plan revision**: draft-8
- **Canonical issue**: [#41](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues/41); #39 remains the earlier routing outcome.
- **Owner**: One assigned workflow implementer; independent native Codex reviewers are coordinated by the first mate.

## Summary

Replace only automatic two-consecutive-clean convergence in planning critique/readiness with one complete clean aggregate. Preserve all required independent roles, current input coverage, affected repair verification, finite limits and human decisions. Use one atomic project-authority documentation override, not a new runner or changed installed package. This plan implements accepted requirements rather than reopening the chosen policy.

## Problem, overview and goals

The current planning rule requires two consecutive complete clean rounds. A first clean round does not converge, and the next round may start only within remaining allowance and authority. The proposed rule requires one complete clean aggregate while retaining independent scrutiny and other stops. The new rule requires fewer assessments in the all-clean case. It does not establish runtime savings, cost savings or reliability.

Planning means preparing and reviewing specifications and feature/bug plans: Spec Kit → applicable UI-only Lavish → Goldfish. Implementation separately follows first mate → native no-mistakes validation → PR, including independent committed-change/scenario review, actual checks and separate proof. Scope-preserving implementation repairs do not automatically restart planning. That boundary and ordinary continuation already exist and are not implemented again here.

Goals: one clear definition shared by critique/readiness; independent current coverage rather than author clearance; unchanged authority/finite accounting; prospective, invocation-pinned rollout; preserved historical evidence. Non-goals: app behavior, upstream/generated instruction edits, tooling, extra review runners, activation, merge, deployment or reliability benchmarking. There is no changed screen or product UI; Lavish visual-intent acceptance is inapplicable to this documentation-only policy change.

## Technical Context

- **Language/Version**: English Markdown; integrated constitution 1.2.0 is the starting authority.
- **Primary Dependencies**: Existing Spec Kit 1.2.5, EGM port 0.9.1 and preset 0.2.0 as documented by the project; no package change.
- **Storage**: Existing canonical documentation and external task evidence; no application data.
- **Testing**: Independent semantic/scenario review; protected-path/history comparisons; `npm ci`, `npm run check`, then `npm run build && npm test`; hosted checks.
- **Target Platform / Project Type**: Existing static web project; this change affects development policy only.
- **Performance Goals**: No measured latency/cost target; remove automatic confirmation only.
- **Constraints**: Codex only, no nested models/fallback; no scope, resource or consent expansion; review itself under current two-clean rule.
- **Scale/Scope**: Four feature files, constitution, guide, one decision and index, append-only history, three minimal predecessor forward references.

## Constitution Check

Integrated AGENTS, constitution and guide govern this work. This workflow change is significant, so it requires five planning phases. Native independent review is coordinated by the first mate, not self-review or nested dispatch. The specifically authorized canonical outcome issue is #41. No UI intent or external API/data contract is introduced.

After design: the proposed override changes only planning convergence, with prospective integration/alignment and invocation-start pinning. Current two-clean requirements still govern this change's own critique/readiness. Design clearance completed under the starting two-clean rule. Committed-change/scenario judgment, the ordered actual gate, separate proof and hosted checks remain pending. No constitutional exception or self-waiver is proposed.

## Project Structure and integration

Use the four canonical feature artifacts: `spec.md` owns requirements, this `plan.md` owns approach, `tasks.md` is derived execution, and `quickstart.md` owns validation/rollout procedure. Research decisions and record concepts are contained here because this internal documentation change has no new application data model, API or external contract; no extra research/data-model/contracts files or generic checklist are needed.

The constitution and process guide are mandatory project-authority reads. Place the override there and name the instruction it displaces: “Converged: Two consecutive clean rounds” in section 2.4 of the installed [review-loop skill](../../.agents/skills/speckit-egm-review-loop/SKILL.md#24-iteration-check--turn-boundary) and its [command mirror](../../.specify/extensions/egm/commands/speckit.egm.review-loop.md#24-iteration-check--turn-boundary). Preserve upstream/generated skills and preset bytes. New decision 0012 explains this narrow replacement; index and append-only history preserve prior decisions. Minimal links from the still-used routing artifacts explain future applicability without rewriting historical tasks or verdicts.

### Proposed convergence and coverage procedure

At invocation start, the coordinator verifies and records the applicable merged method and standing-direction revisions. If applicable authorities conflict or no effective rule can be established, stop affected work for first-mate reconciliation. Record the effective rule/version, phase, current bundle/hashes, required roles and standards, scope and context exclusions, invocation identity, inner round and outer usage, remaining allowance and actual launch authority. A future rule applies only after separately authorized integration and instruction alignment; an in-flight invocation retains its starting rule and counters.

Critique retains `design_critic.md`, `structural.md`, `style.md`; design and structural apply `feature-spec-standard.md`. Readiness retains `implementation_readiness.md`, `codebase_details.md`, `style.md`; readiness and codebase apply `implementation-readiness-standard.md`. Style applies its persona. Each role completes independently with actual reads, current matching inputs, attributed findings and status. Exactly one assigned readiness reviewer analyzes the same pinned spec/plan/tasks in a distinct section of its report; other roles do not repeat it. Apply the read-only [Spec Kit analyze rubric](../../.agents/skills/speckit-analyze/SKILL.md#4-detection-passes-token-efficient-analysis): trace requirements and acceptance criteria to planned work, required checks and derived tasks; check task ordering, omissions, contradictions and constitution alignment. Matching hashes identify the versions supplied. Separately record which files and ranges each reviewer actually read and the scope reviewed. A missing task for a mandatory check, or another unresolved discrepancy judged Blocker or Major for readiness, stops clearance until reconciled and independently verified. Keep analysis and design findings separately attributed, linking overlaps without counting them as separate defects. Minor wording alone does not block.

Determine round cleanliness before repairs: a clean aggregate has every required role completed, current coverage and no unresolved Blocker or Major. Record cleanliness separately from convergence. Converge only when the invocation's pinned threshold is met and no other stop applies; preserve a clean result even if a separate stop holds progression. Nits retain reviewer, scope and disposition without automatic confirmation. A missing/failed/unavailable/stale reviewer does not contribute zero findings. Preserve one retry for a failed reviewer; after a second failure record not run and stop affected clearance. Author self-review cannot fill the missing role.

A failed result stays failed. Author repair/disposition is not independent closure. Repin the bundle and delta. Obtain independent affected verification of decisions, findings, scenarios and explanations within the [applicable review allowance](#limits-and-preserved-phases); verification consumes that allowance. A targeted check proves only the scope it covers. For every retained portion, the original independent reviewer explicitly confirms its applicability to the current pinned bundle and delta, including when that reviewer also rechecks an affected portion. Combine the verified and reconfirmed portions only when they cover the whole assigned role; if impact or coverage is uncertain, broaden the review within authority or stop. If a reviewer is replaced, the independent replacement must establish and record coverage for the full assigned role on the current bundle, including relevant unchanged parts; it cannot inherit the predecessor's coverage by reading only the delta. Record the role's scope, actual inputs and reads, verified changes, and rationale for current coverage. If any role lacks that evidence, stop affected clearance. One role's check cannot fill other roles. Under the prospective rule, the first later complete clean aggregate can converge if no other stop applies. Material change invalidates affected coverage and earlier phase judgments. Recurring fixed findings reopen. Contests need permitted-input counter-evidence and independent agreement; disagreement stays open. Accepted-risk labels cannot waive required conditions.

Commission extra review only to answer a named high-consequence question or reconcile a conflicting finding, not for generic confidence. Record the evidence, deciding question, affected scope, current inputs, independent reviewer, expected signal, named authorized round or finite exception, and stopping condition. If the result is inconclusive, retain the stop. Use only actual remaining authority; scope changes, sensitive resources and exhausted caps still require their own decision.

### Limits and preserved phases

Five phases remain: initial zoom out (skeptical architect and inventive catalyst), standalone comprehension (one fresh plan-only reader with full paraphrase), critique (three roles), intermediate zoom out (skeptical architect with actual earlier findings/dispositions), readiness (three roles, one matching-trilogy analysis owner). Only the next genuinely input-ready phase is assigned; no empty reservations. Preserve stage reports and original findings.

Critique/readiness retain five inner rounds per invocation and one ordinary outer stage re-audit after repair. One outer audit contains an entire inner invocation. Spend the applicable slot at actual launch of a review or verification batch, once for the batch, not at reservation or separately for each role. All work in that batch uses one immutable input pin. A permitted failed-reviewer retry uses the same pin and cannot review new edits. If the inputs change before aggregation, retain the old findings and record the batch as nonclean or interrupted, without reclaiming its slot or clearing the new input. Any new pin requires a new separately accounted launch within actual remaining authority or an explicit finite exception.

If round 4 has an unresolved Major, round 4 is nonclean and breaks any clean streak. After repair, a permitted round 5 in the same invocation consumes inner slot 5 only, not the outer allowance. If the pin changes during that fifth batch, the spent fifth slot is not available again.

The ordinary outer re-audit is for a stage-level repair after the inner invocation has returned, not for continuing that invocation. For example, a completed invocation may need an affected re-audit after a later stage-level edit. At the stage checkpoint, the first mate checks that the repair needs independent re-audit, the single outer slot remains, the inputs and work are authorized, and no stop requiring a separate decision remains. A permitted outer re-audit starts a separate complete invocation and spends that outer slot. The installed [stage wrapper](../../.agents/skills/speckit-egm-review/SKILL.md) sets the re-audit limit; it does not supply a list of return states that by themselves grant eligibility.

If round 5 was nonclean or the invocation stopped at its cap or on churn, keep the stop and its counts. Even after the author repairs the text, an unused outer slot does not authorize restarting review. Any continuation of that stopped work requires a separate, explicit, finite captain decision naming the stopped limit, pinned inputs and whether it permits an inner continuation or an outer re-audit. A decision on one limit does not extend another. At other stops, reconcile the actual reason and authority before considering any launch. Record invocation, inner round and outer use separately; do not rename checks to bypass limits, reset counts or carry unused slots forward.

Comprehension has no inner loop: initial assessment plus one ordinary direct re-audit, with any additional existing finite exception separately recorded. Churn remains a new finding at an applied fix's scope that reverting the fix would resolve. Churn, missing required review and exhausted allowance without convergence stop affected work. Drafting does not reset anything.

This change's planning retains the current two-consecutive-clean requirement. A lone clean fifth round reaches the cap without convergence; complete clean rounds 4 and 5 within the same invocation can converge if no other stop remains. Under the prospective rule a complete clean fifth round can converge with no earlier clean round, provided no other stop remains. A nonclean fifth round stops under either rule. No retrospective application is permitted. Preserve ordinary authorized first-mate continuation without routine extra approval questions, and preserve all actual product/scope/resource/cost/sensitive-access/exception/cap/churn/merge/deployment decisions.

### Alternatives considered

The accepted project-authority override defines one shared stopping rule in the existing governing documents, without changing the preset or adding a runner. Explicit precedence tells reviewers what to follow when the installed instructions differ; it cannot ensure every reviewer follows it.

After separately authorized integration and instruction alignment, the first mate must observe the next genuine, authorized, input-ready critique/readiness case in a fresh session. Actual method and direction reads, reviewer coverage, counts and stops are operating evidence; repository alignment, direction alignment and document walkthroughs are not. For example, a fresh coordinator might read the applicable merged method and aligned direction but still apply the superseded installed stopping rule. Record and reconcile that mismatch rather than counting it as a pass. If no eligible case exists, record the first-mate-owned gap; a missing real case establishes neither success nor failure. See [publication and rollout](#6-publish-only-the-validated-version-preserve-rollout-separation).

A maintained preset override would distribute changed generated instructions but requires tooling maintenance outside this scope. An observed mismatch can inform separately authorized preset reconsideration. Hand-editing generated/upstream files risks upgrade drift and violates protected scope. Keeping two-clean preserves a second fresh sample of unchanged text that can surface an unanticipated gap, but does not meet the accepted change. Targeted extra review answers named questions; it does not replace sampling for unknown shared blind spots. Neither targeted review nor a future real observation establishes equal detection reliability. Splitting critique/readiness changes would temporarily create conflicting stopping rules. Reducing reviewer count or allowing author clearance would remove safeguards and is not accepted.

## Complexity Tracking

No new subsystem, dependency or runner. No constitutional exception. Reuse existing records and native assignments; their presence does not demonstrate operation. The documentation-shape gate does not replace semantic review.

## Detailed Implementation Plan

### 1. Establish canonical artifacts and immutable baseline

Setup established the four canonical feature files and the specifically consented outcome issue #41. Do not recreate those files, republish #41 or repurpose #39. Verify that feature identifier 003 and decision 0012 remain free on refreshed integrated main. Record the integrated base and exact execution-start pin; reconcile authority and overlap, and retain input hashes and protected bytes/history externally. Keep one implementation owner. Do not persist a feature pointer or modify setup configuration.

### 2. Complete current planning scrutiny

Apply the existing review/review-loop procedures with project authority overriding generated human-chat gates and nested spawning. The first mate launches independent Codex-only native assignments, only for the next input-ready phase. Initial zoom out reads this full plan with declared spec/current authority/root project context; use `zoom_out.md` and `inventive_catalyst.md`, mode REVIEW, zoom-out standard. Aggregate both actual reports before proceeding.

Next, standalone comprehension receives this full plan as its sole design input, no conversation, spec, linked-file expansion or earlier findings; preserve full paraphrase and findings. Resolve findings within actual allowance, never substituting unread explanations.

Critique examines the high-level portion with its three roles. Intermediate zoom out reads the full current plan and actual earlier findings and dispositions. In readiness, each of the three roles assesses its assigned scope on the same current bundle. Only the assigned implementation-readiness reviewer applies Spec Kit analyze to the pinned spec, plan and tasks, reporting consistency and coverage separately from design findings. Refresh line ranges and hashes after repairs. Retain each role's actual reads, inputs, standards, context boundaries, findings, dispositions and independent closure.

Record invocation, round, outer usage, failures, clean streak and stops. Critique/readiness need two consecutive complete clean rounds under the invocation-start rule; five inner rounds and one outer re-audit remain. Comprehension retains initial-plus-one ordinary allowance. No counter reset or blanket continuation past cap/churn. This real significant case contributes only actually completed stages to existing routing rollout evidence. The separate small-route gap requires a real authorized correction under current accepted intent, with known cause, bounded scope and expected result, and no significant trigger. In a fresh session, the first mate records actual merged method and direction reads, the classification and zero EGM planning assignments, plus the real native delivery review, checks and separate proof judgment. Do not invent a task for that observation, claim full routing proof from direction alignment, or treat it as the prospective one-clean operating case.

**Prospective same-pin fifth-slot check.** If round 4 was complete and clean but a named question held progression, an authorized batch charged to slot 5 must produce its own complete current aggregate, even if the pin did not change. The independent question reviewer verifies the deciding signal in its assigned scope; it cannot fill the other roles. For every retained portion, its original independent reviewer must explicitly confirm applicability in round 5 to the same pinned bundle, the unchanged inputs and the impact of the answer. Do not require a full reread for confirmed unaffected coverage. If a role is replaced, the replacement must independently cover its full current role. Aggregate the three roles before repairs; converge only if round 5 is complete and clean and no stop remains. If any role coverage is missing, the answer is inconclusive or another required condition fails, record the slot as spent and stop at the cap. Preserve round 4's clean-but-held result without retroactive release. No sixth ordinary round, outer escape or waiver; see quickstart V4/V5. This is not the rule governing this change's current two-clean scrutiny.

**PE-1 — Pre-edit story evidence checkpoint.** Before T009–T015, verify T008's complete independent readiness clearance. For each story, record its acceptance criteria, actual check method, derived task IDs, intended evidence location and owner. Use the matching spec, plan, tasks and quickstart scenarios. Distinguish deferred operating evidence and explicit exceptions from passing results. Retain the record in external task evidence and reference it in the execution handoff; hold policy edits if it or readiness clearance is missing. Recording the method does not execute a check.

### 3. Implement the narrow documentation override after design clearance

Operations are relative to the exact execution-start pin recorded in step 1, where all four feature files already exist and decision 0012 does not. Verify the expected paths before writing; stop affected work for reconciliation if an identifier or operation conflicts with the refreshed baseline.

| Operation | Exact path | Authorized change |
| --- | --- | --- |
| Modify | `.specify/memory/constitution.md` | Advance the then-current minor version (1.2.0 to 1.3.0 if unchanged). Add the planning convergence override, current independent coverage, finite accounting and prospective transition. Preserve planning/implementation separation. |
| Modify | `docs/process/spec-kit-egm.md` | Add the shared planning override and identify the displaced installed instruction. Retain roles, independent coverage and affected verification, retry, churn, outer/comprehension limits, question-driven review and launch authority. Include the same-pin fifth-slot coverage and cap boundary from step 2. Preserve the five phases, single readiness analysis and separate implementation/proof/publication route. |
| Create | `docs/decisions/0012-single-clean-round.md` | Record rationale, narrow override, trade-offs, protected scope and prospective rollout. Distinguish targeted questions from the risk of missing an unknown shared blind spot after losing a fresh sample. |
| Modify | `docs/decisions/index.md` | Add 0012; qualify an older entry only if needed to prevent a competing rule, without broadening supersession. |
| Modify | `RECORD.md` | Append one factual history entry; preserve the original byte prefix. |
| Modify | `specs/002-review-routing/spec.md` | Add only a forward reference distinguishing prospective convergence from historical or invocation-pinned accounting. |
| Modify | `specs/002-review-routing/plan.md` | Add only that forward reference; retain historical rules and verdicts. |
| Modify | `specs/002-review-routing/quickstart.md` | Add only that forward reference; preserve existing procedure and limits. |
| Modify only if needed | `specs/003-single-clean-round/spec.md` | Retain canonical requirements and #41; reconcile only actual status/evidence references as needed. |
| Modify only if needed | `specs/003-single-clean-round/plan.md` | Retain the approved approach and #41; reconcile only actual status/evidence references as needed. |
| Modify only if needed | `specs/003-single-clean-round/tasks.md` | Update derived checklist status only as actual evidence supports it. |
| Modify only if needed | `specs/003-single-clean-round/quickstart.md` | Retain the scenarios and #41; reconcile only actual status/evidence references as needed. |
| Delete | None | No deletions. |

Do not rewrite historical decision bodies, review verdicts, evidence or `specs/002-review-routing/tasks.md`. Do not put review reports inside the canonical plan.

No other file is an implementation target. App source/views/data, tests/expectations, dependencies/lockfile, gate/security config, installed skills/personas/standards/preset, licences, disabled events/hooks and host/care settings are protected. No architecture-map change applies to this documentation-only change.

### 4. Independently review the committed change and scenarios before proof execution

Commit the authorized documentation, then supply full baseline diff, current accepted artifacts and the eight scenario groups from quickstart to the first mate for native independent committed-documentation/scenario review. This is separate from design clearance. Repair findings and obtain independent affected judgment; changes that introduce design decisions reopen affected planning, not automatically all phases. Retain current coverage/applicability rather than declaring author repairs independently clear.

### 5. Execute checks and retain separate proof

After that review, read `engines.node` in the current `package.json` (currently `>=22.23.4`). Check the actual `node --version` satisfies it before `npm ci`; otherwise stop for environment reconciliation. Record Node and npm versions. Set `gate_processors` and `gate_memory_mib` to the entire run's resource needs, then pass the ordered gate as one program to the existing load launcher:

```bash
infinitary-load-axi run --processors "$gate_processors" --memory-mib "$gate_memory_mib" -- \
  bash -c 'npm ci && npm run check && npm run build && npm test'
```

All four commands run inside the reservation. An earlier failure stops the chain; tests cannot run after a failed build. Retain exact commit, environment, command, output and exit status externally. No test edit or new suite is proposed, so edited-test repetition does not apply unless scope changes with actual authority. Compare protected paths, historical decision bytes, old routing tasks and RECORD prefix. Read the whole diff against accepted intent and update documents made stale only within authorized scope.

Manually walk the proposed semantics against retained real review history and all adverse/limit/transition cases in quickstart. Label these walkthroughs, not new reviewer reports or live activation. An independent reader checks semantic preservation; docs:check proves shape only. There is no executable changed app surface and no invented app journey. For [V8 — Prospective operation](quickstart.md#required-acceptance-scenarios), pre-publication review checks only the documentary adequacy of the rollout procedure, ownership and gap accounting. Actual V8 operation remains pending with the first mate after separately authorized integration and alignment; a walkthrough neither passes nor waives it.

Obtain separate independent proof judgment of the applicable pre-publication evidence, without duplicating the suite. Before every push, read head-bound independent change/scenario review and every required proof disposition. For each live claim registered as required before publication, require accepted live proof for the current version or an approved disposition for that exact gap. If any is missing, hold. Reconcile any conflict in scenario timing rather than treating documentary adequacy as live proof or skipping the claim. Earlier approvals do not transfer automatically.

### 6. Publish only the validated version; preserve rollout separation

Refresh current task policies and default branch, rebase only this change, resolve overlap and renew affected review/check/proof applicability. Push only after the current version satisfies the pre-publication gate. Open the PR, inspect hosted checks and logs, repair owned failures and recheck. Build approval is not merge, deployment or activation permission. The existing Pages workflow is configured to run on pushes to `main`, including a merge. Its build attempts a metrics snapshot refresh before the deploy job; published output could change if deployment proceeds. Before offering merge, the first mate verifies the hosted `github-pages` controls, identifies the possible published effect and resolves separate deployment authority. Hold merge while the effect or authority is unresolved. Do not manually trigger deployment, change the workflow/environment or treat merge as policy activation. Present the green merge card only after these prerequisites are satisfied.

Record the dependent work in the story's after-merge section. After separately authorized integration, the first mate aligns the existing direction in place, then observes the next genuinely authorized, input-ready one-clean invocation in a fresh session. Retain actual method and direction reads, roles and coverage, aggregates, counts and stops. Record affected rechecks only if the real case requires them. If no suitable case exists, retain the first-mate-owned gap, separate from the existing missing real small-route case. Repository alignment, direction alignment and operating proof are distinct checkpoints.
