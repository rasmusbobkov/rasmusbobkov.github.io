# Implementation Plan: Minimal review routing

**Specification**: minimal-review-routing-v1
**Plan revision**: draft-2
**Status**: Design inputs only; policy implementation awaits five-phase clearance
**Canonical technical issue**: [#39](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues/39); distinct from closed #38
**Implementation owner**: Assigned workflow implementer (single owner)
**Spec**: [spec.md](spec.md)

## Summary

Replace the current single relevant EGM phase for small understood corrections with zero EGM phases. Keep all five design phases for significant changes, and keep one independent native delivery-review track for either route. This changes development documentation only, not the application or installed tooling.

A **small understood correction** means a bounded correction to accepted intent whose cause, scope and expected result are understood and which has none of the significant triggers below. These are one category, not two exceptions. This plan uses “small understood correction” throughout.

The first mate classifies impact from current accepted intent, not line count. New behavior, shared contracts, saved-data/security boundaries, workflow changes, unresolved architecture or ambiguity select the significant route. Missing or stale intent stops affected work for reconciliation. Small corrections reuse valid intent and artifacts rather than generating a new design ceremony.

## Review responsibilities

Spec Kit owns requirements, the technical plan and derived execution tasks. EGM judges design. The native delivery-review track judges the committed implementation/documentation and scenarios, then separately judges author evidence. None substitutes for the others, and one track does not mean one model call.

Significant work uses fresh reviewers in order: initial zoom out, standalone comprehension, design critique, intermediate zoom out, implementation readiness. The first mate launches direct native host tasks only after the author supplies real pinned inputs. Initial zoom out receives this actual draft and declared baseline context. Comprehension receives this plan alone as design input, without the author conversation, explanatory sources, earlier reports or automatic linked-file expansion. Other phases receive declared appropriate current context and prior findings where required.

Each phase has a distinct question and output:

1. **Initial zoom out**: the skeptical architect tests whether the overall approach solves the root problem simply and reuses existing infrastructure; the inventive catalyst looks for false compromises and simpler alternatives. Aggregate both attributed reports before progression.
2. **Standalone comprehension**: a fresh reader paraphrases the proposal and existing system from the plan alone, then identifies missing explanations. Preserve the complete paraphrase, not just deficiency counts.
3. **Design critique**: design, structural and style reviewers test the high-level design's requirements, boundaries, organization and clarity. Aggregate findings, resolve them in the canonical plan and retain the distinct critique report.
4. **Intermediate zoom out**: the skeptical architect rereads the full current plan with previous findings and dispositions to check that repairs still form a coherent, simple solution rather than accumulating workarounds.
5. **Implementation readiness**: readiness, codebase-details and style reviewers check the detailed implementation section for executable steps, dependencies, compatibility with existing project sources and verifiable acceptance. This is design judgment before implementation, not code-review clearance.

For each phase the author reads actual reports, preserves required reviewer identities/status and dispositions, and requests the next phase only after the phase's completion rules are met. A proposed repair is not a clean review. A missing reviewer or unresolved blocking finding stops progression; explicit gap reporting is required. Critique and readiness additionally follow the loop convergence rules below.

Before readiness, update the derived tasks to match the final specification and plan. One assigned readiness reviewer applies Spec Kit analyze to that exact trilogy in the same report; separate design findings from consistency/coverage findings. Other reviewers do not duplicate that analysis. Additional requirements checklists need a concrete domain gap, not a stage name. Preserve phase-specific reports, attributed findings and existing loop limits. Missing reviewers or unresolved blockers are not clearance.

### Delivery initiation and clearance

After authorized implementation is committed, the author asks the first mate to launch a native independent change/scenario reviewer with the accepted intent, full committed diff, changed-file scope and planned validation scenarios. The first judgment decides whether the implementation/documentation matches accepted intent, preserves protected behavior and covers necessary success/adverse scenarios. It returns attributed findings and a clear, findings or blocked status at that commit. The author repairs owned findings and obtains affected review again; design approval cannot clear implementation defects.

The author then executes the actual local gate and selected authorized observations, retaining commands, environment, versions, results and artifacts. A separate native proof-reading judgment examines those retained records against each required scenario and the current change: what actually ran, what it showed, what remains untested, and whether the evidence supports delivery. It does not rerun the suite. The same native review track contains these two separately recorded judgments; it is not an external review pipeline or one undifferentiated model call. The first mate coordinates unavailable reviewer launches. No author self-review substitutes for either independent judgment.

Pre-merge delivery clears only when independent committed-change review has no unresolved blocking findings, actual required local and hosted checks pass at the applicable version, and the separate proof read accepts the available pre-merge evidence with dependent rollout gaps explicitly assigned. Missing required pre-merge proof or reviewer blocks delivery. Post-merge direction activation and fresh-session routing evidence are not pretended to have run before merge; they remain explicit dependent rollout obligations, so repository delivery is not full rollout completion. Merge still needs separate captain authorization; deployment is not authorized. Care settings stay unchanged; no attestation is invented from labels, green checks or design approval.

### Finding cycles, limits and affected repeats

The installed review-stage wrapper permits at most one re-audit of a stage after repairs. Comprehension therefore gets its initial review and one recheck of the revised plan; unresolved blocking gaps after that stop for first-mate reconciliation rather than another automatic cycle. The critique/readiness antagonistic subloop separately allows up to five rounds and requires two consecutive clean rounds to converge. A clean round has no unsettled Blocker or Major and all required reviewers completed; Nits alone do not block. Determine cleanliness before applying that round's repairs. An applied fix is not a settled finding: recurrence means the fix failed or was reintroduced. Preserve justified contests/explicit accepted-risk dispositions so an unchanged settled finding is not reopened merely by a new reviewer.

These are different bounds: subloop rounds do not grant unlimited outer-stage re-audits. At five rounds or churn (a new finding caused by a fix that would disappear on reverting it), retain open findings and stop for the host-governed choice of further drafting, explicitly authorized continuation or a permissible risk decision. Generated automatic-advance wording never clears an unresolved blocking finding under project authority. Do not silently extend limits or invent acceptance. The author classifies each finding with the resolver, records precise edits/disposition, applies authorized repairs and repins inputs before renewed review.

For each later edit the author records an impact decision: changed requirement/design decision, affected files and scenarios, affected prior review finding or evidence fact, and proposed repeat. The independent reviewer verifies that coverage decision; the first mate reconciles disputed scope. Pure wording repair needs comprehension/style recheck of affected explanations, not unrelated phase repetition. Changed routing criteria, authority or review contracts reopen the affected design judgments. Implementation edits need review of the changed diff and checks that exercise its affected behavior; new shared surfaces expand that set. Evidence from an unchanged version-dependent fact may be retained only with an explicit applicability explanation. Missing/stale affected evidence blocks clearance. The final full local gate and current hosted checks are retained even when narrower affected checks were run during repair.

## Technical Context

- English Markdown workflow documentation; no runtime/API/schema change.
- Existing Spec Kit 1.2.5, EGM port 0.9.1 and local preset 0.2.0 stay installed unchanged.
- Existing Astro application and npm lockfile/gate remain untouched.
- Node baseline verified as v22.23.4; npm 10.9.9.
- Verification: author runs `npm ci`, `npm run check`, then `npm run build && npm test`; hosted checks remain required. Applicable edited-test repeats remain unchanged; no test edit is planned.
- No measured latency/cost target, new package, runner, nested agent, plugin or hook.

## Constitution Check

Current constitution 1.0.0 requires five phases for this workflow change. Drafting canonical inputs is authorized, not policy activation. Design clearance is incomplete; an initial-phase report does not clear later phases. Canonical technical issue #39 was created with the specific creation consent; the old transition issue is not reused. One owner remains responsible. The approved exception changes the small-understood-correction rule only after review and integration; current significant-review authority is not bypassed.

All hooks are empty and `auto_execute_hooks: false` remains unchanged; events remain disabled independently. No application or installed instruction-file changes are planned. Review records must name actual files, revisions/hashes, persona/standard, context exclusions, results and dispositions. This draft is not a completed review or executed test.

## Project Structure

Canonical artifacts: `specs/002-review-routing/{spec.md,plan.md,tasks.md,quickstart.md,checklists/requirements.md}`. Policy targets: `.specify/memory/constitution.md`, `docs/process/spec-kit-egm.md`, `docs/decisions/0011-minimal-review-routing.md`, `docs/decisions/index.md`, `RECORD.md`. Existing architecture/invariant documents remain owners of application rules; inspect references for actual staleness, without unrelated rewrites. No new data-model or API-contract artifact is needed for this internal documentation change. Earlier transition artifacts remain history.

## Detailed Implementation Plan

### 1. Establish and review canonical inputs

Draft the five feature artifacts with issue assignment explicitly pending and one implementation owner. Request only consent to create the proposed canonical technical issue; once created, record its actual public reference without private task records. Keep product-planning and technical trackers in their established roles. No issue is fabricated, reopened or duplicated across trackers.

Pin draft content in a commit. Before each phase request exact real input paths, commit and content hashes, persona and standard, required reviewers and context exclusions through the first mate. Do not reserve reviewers with extra sessions. For initial zoom out use zoom_out.md and inventive_catalyst.md with the installed zoom-out standard; comprehension uses comprehension.md and plan-only input. Critique uses design_critic.md, structural.md and style.md; intermediate zoom out uses zoom_out.md plus actual previous phase findings/dispositions. Readiness uses implementation_readiness.md, codebase_details.md and style.md, with exactly one assigned trilogy-analysis owner. Preserve distinct stage reports in task evidence, not a competing design master. Resolve findings in this plan and regenerate matching tasks before readiness. Stop on missing/stale inputs or missing required reviewers.

### 2. Align policy after required design clearance

Update `.specify/memory/constitution.md` from 1.0.0 to 1.1.0, preserving authority, artifact ownership and verification. Replace the small understood correction's one-phase requirement with the zero-phase exception; retain significant triggers and all five phases. Describe nonduplicative final analysis, implementation review and separate evidence read.

Update `docs/process/spec-kit-egm.md` with the matching classification, readiness ownership, context boundaries and single native delivery-review track. Keep existing installed-port/preset/licence/version provenance, generated-instruction dispositions and disabled hooks/events. Explicitly retain `npm ci`, `npm run check`, `npm run build && npm test`, hosted checks and applicable changed-test repeats. No external no-mistakes agent pipeline or automatic care change is added.

Add `docs/decisions/0011-minimal-review-routing.md` with context, decision and consequence: removing one unnecessary small-correction design phase, not weakening significant scrutiny. Add its sole index row in `docs/decisions/index.md`. Append factual history in `RECORD.md`; do not rewrite earlier events or claim fresh-session proof not yet observed.

### 3. Validate and obtain independent delivery judgments

Read the whole diff against accepted scope and check unchanged protected areas. Obtain native independent committed-documentation/scenario review. Run the full local gate with logs outside the working copy; retain command, source version, exit status and environment. Resolve regressions owned by this change. Documentation-only work has no changed application view or legitimate new application journey; do not manufacture one. Gate output proves checks, not live routing.

The routing observation protocol below is also carried into `quickstart.md`; a link alone is not the protocol. The delivery proof reader separately examines current author evidence, scope preservation and explicit rollout gaps without repeating the suite. Rebase onto the current default branch, resolve overlap, rerun affected validation and satisfy hosted checks before the merge card. A later change receives affected review/check updates. Build approval is not merge/deployment permission.

### 4. Dependent post-merge rollout

The first mate replaces the existing project standing direction in place after separately authorized integration, matching merged constitution/guide rather than creating a competing policy. Then a real fresh Infinitary session reads merged method inputs and the active direction and demonstrates both real routes. Record input revisions/readings, actual case intent, classification reasons, task identities/counts (zero EGM for small; five ordered phases for significant), readiness trilogy-analysis ownership and the delivery review/proof chain. Do not implement the sample changes without their own scope authority.

Reproduce routing observations without implementing sample changes:

1. The first mate selects two real pending cases within existing authorized work: a small understood correction with current accepted intent and a significant case with an explicit trigger. Record the exact case input, scope authority, owner and accepted artifact versions. Do not fabricate a product defect or authorize sample implementation merely to test routing.
2. In the fresh session, record actual reads of merged constitution/guide and active standing direction, including versions/hashes. Present each case's unchanged recorded intent for classification and review-task preparation only; no product editing, merging, deployment or additional sensitive access is part of this observation.
3. For the small case retain the classification/reason and actual task-register reading showing zero EGM assignments for that case; retain the planned single independent delivery-review track. For the significant case the first mate creates legitimate native review assignments from real input-ready artifacts: record all five ordered phase/task identities and prerequisites. Later phases wait for prior results; do not launch empty reservation sessions. A proposed list of five names is not observed task creation or completed review.
4. As the significant case progresses under its own authorization, retain actual reviewer statuses and outputs, plan-only comprehension boundaries and final readiness's same-trilogy analysis owner. Follow a real delivery case through committed-change review, author checks and separate proof judgment. Classifying two cases alone proves routing classification only, not completed five-phase execution or delivery proof.
5. Keep original prompts/inputs, host task readings and attributed reports so another reader can reproduce the classification and count actual assignments. If no suitable real case or input-ready artifact exists, report the missing case/step and first-mate owner; do not substitute invented task counts, unauthorized sample implementation or historical unrelated reviews. Missing later results keep that part of rollout unverified.

Report repository alignment, direction activation and fresh-session proof as distinct checkpoints. Conflicting old direction/new documents stop affected routing until reconciliation. Missing launches/proof stay open with the first mate; no claim of automatic delegation, completed activation, measured saving or fabricated attestation. Include this dependent work in the eventual change story's after-merge handoff.

## Dependencies and evidence boundaries

Canonical issue identity (#39), real fresh design reviewers, independent delivery review/proof reading and first-mate rollout are dependencies, not inferred successes. Issue creation is complete; the remaining reviewer and proof dependencies still prevent claiming readiness. No policy edit occurs before the five required design phases clear. Review acceptance never authorizes merge or deployment. Installation reductions (both previously considered sizes) remain deferred and unqueued.
