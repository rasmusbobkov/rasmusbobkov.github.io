# Development process

**Status:** Project process manual. It takes effect through the normal documentation merge; it is not a workflow engine or a verified automation system.

**Purpose:** A portable process description that contributors and their assistants can read, reuse, review and improve without relying on private conversation history.

This is the canonical process for Tähelugu. The project mapping below selects existing records and entrypoints; the suggested issue taxonomy and reviewer lenses remain proportionate guidance, not newly installed fields or a fixed model roster. Adoption grants no product implementation, merge or deployment permission.

**Source and revision:** Adapted from the initial portable process snapshot, SHA-256 `36d2401e68fb7e96ff03a2f56479561d303858f012fea2f125ed0d352d1edf2e`. The project commit containing this manual is its method revision; record that actual commit in briefs and results. There is no separate runtime version counter. Local adaptations reuse existing project records, retain English engineering documentation and defer saved-direction activation until integration.

## 1. Principles and boundaries

1. Keep the method in versioned project resources, not in one person's private application settings or memory.
2. Separate design and learning, issues and roadmap, and delivery. Connect them with explicit artifacts and handoffs rather than one enormous prompt or a second workflow engine.
3. Ask the agent to explain alternatives and recommend a contextual choice. The human owns goals, constraints and consequential approvals without needing to outperform the agent at architecture.
4. Use one canonical backlog and one implementation owner per issue. Local assistant task lists are execution records, not independent product backlogs.
5. Distinguish intended behavior, implemented behavior, merged changes, published releases and behavior verified in the target environment.
6. Distinguish scenario reasoning, written tests and executed tests. Never substitute one for another.
7. Several fresh reviewers can reduce some blind spots, but do not guarantee exhaustive coverage, equal judgment or uncorrelated errors.
8. Make the route proportionate. Do not force every issue through a full architecture process, pull request, release and deployment.
9. Preserve evidence, uncertainty and unresolved decisions. A generated summary is not proof.
10. Improving the method does not silently change active work or authorize new implementation, access, spending, merging or deployment.

This method does not create application-level isolation, cross-instance locks, shared private memory or a new scheduler. Project instructions are guidance; actual tests, project checks and hosting policies enforce only what they can verify. Applicable application safety, authority and consent rules remain in force.

## 2. Vocabulary and sources of truth

| Item | Meaning | Canonical home |
| --- | --- | --- |
| Method | How the project designs, plans, reviews and delivers work | Versioned process documents |
| Specification | Intended behavior, constraints, invariants and acceptance | Project specification documents |
| Decision record | Alternatives, recommendation, accepted choice, reasons and unresolved questions | Project decision records |
| Project issue | One bounded outcome, such as a defect fix or an investigation answer | The canonical issue tracker or project-local issue records |
| Execution task | A bounded assignment to an assistant, reviewer or runner | The execution system, linked to the canonical issue |
| Roadmap | A view of outcomes, priorities and real dependencies | Derived from canonical issues |
| Development log | Meaningful changes, decisions, problems and evidence references | Project development history |
| Evidence | Observed results for an identified version and environment | The project's retained validation records or linked check results |

A product issue may require several execution tasks. That does not require several product issues for the same outcome. The roadmap must not become a second manually synchronized backlog.

## 3. Where the files live

**Canonical home:** `docs/process/development-process.md`, this versioned manual. Its three modules remain sections; it is not injected wholesale into every conversation.

Use the project's existing records rather than importing a second documentation structure:

| Record | Project home and role |
| --- | --- |
| Root instructions | [`AGENTS.md`](../../AGENTS.md), the existing worker authority; its short process pointer does not replace its other rules |
| Human guide | [`docs/README.md`](../README.md), linked from the root [`README.md`](../../README.md) |
| Current architecture and checks | [`docs/architecture.md`](../architecture.md), the only architecture page and the canonical run/verify guide |
| Invariants | [`docs/invariants.md`](../invariants.md), with existing test/manual verification pointers |
| Decisions | [`docs/decisions/index.md`](../decisions/index.md); retain one-page `NNNN-title.md` records with context, decision and consequence, adding options/recommendation/version references within that format when needed |
| Development history | [`RECORD.md`](../../RECORD.md), not a new `docs/development-log.md` or duplicate diary |
| Canonical backlog and roadmap | [GitHub issues](https://github.com/rasmusbobkov/rasmusbobkov.github.io/issues); roadmap views derive from those issues, not a separate editable list |
| Specification | The accepted versioned specification for the assigned work; no separate specification collection is introduced by this adoption. Link the actual issue/design artifact and revision; add a topic document only when work needs one. |
| Executable gates | Existing `package.json`, `.no-mistakes.yaml` and `.github/workflows/ci.yml`; no new scripts, dependencies or workflows accompany this manual |

Assistant tasks remain bounded execution records linked to canonical issues. Reconcile existing tasks, branches and pull requests before selecting or transferring work; do not migrate or duplicate a backlog merely to adopt this method. Do not treat a specification or historical log as proof of current owners, status or delivery.

Project test rules remain authoritative. Follow the run/verify guide: `npm run check` and `npm run build && npm test`; `npm run docs:check` is the documentation-only shape check, also run by `pretest`. Build first because the privacy and licence checks read the built output. The generated documentation checker is not hand-edited to adopt this method. A push to `main` triggers the existing Pages deployment; opening this documentation pull request is not permission to merge or deploy it.

The optional later `design.md`, `planning.md`, `delivery.md` and `reviewers.md` split is not needed now. If splitting becomes useful, make this manual an index with one authoritative body per module, not full and split duplicates.

The root entrypoint stays short. Reuse existing authority instead of introducing a competing `CLAUDE.md` or a second rulebook.

[VERIFIED-CODE/CONFIG] In the inspected Infinitary loading path, a root `AGENTS.md` takes precedence over a root `CLAUDE.md`. See the pinned application evidence in section 16; this project already has `AGENTS.md`.

The human guide links to canonical records, not copied status lists. An optional project skill would be only a thin discovery pointer to this manual; no skill is installed here. The proposed project-local `planning/issues/` fallback is not used because the project already has GitHub issues.

Keep personal sign-ins, private conversations, application databases and secrets out of the shared project. Do not synchronize entire assistant application homes through version control.

## 4. How an assistant receives the method

A file's presence is not proof that an assistant read or followed it. In Infinitary, the coordinating assistant is called the first mate.

For each independent assistant:

1. Identify the current project version, authoritative root instructions and adopted method revision.
2. Have a bounded reader inspect the relevant process documents and return a compact method brief to the coordinating assistant before it organizes work.
3. Put the method/specification references and applicable acceptance rules in execution handoffs.
4. Let each worker read detailed documents relevant to its task rather than injecting all process text into every request.
5. Reconcile stale or conflicting guidance before consequential work. Do not infer a new approval from a document update.

[VERIFIED-CODE/CONFIG] In the inspected Infinitary path, coding workers load root instructions and discover project skills. They do not automatically read every linked Markdown document, and this does not establish automatic first-mate workflow execution. See the pinned application evidence in section 16.

The method brief is a proposed use of existing worker/report handoffs, not a native plugin or new runtime feature. Verify the actual behavior for each installed version when adopting the method.

A method brief should identify:

- Method source and exact adopted revision.
- Project version and relevant specification versions.
- Authoritative process documents and project-specific deviations.
- Canonical backlog and implementation-ownership convention.
- Applicable validation commands/checks and their canonical configuration.
- Required evidence and review responsibilities.
- Open decisions, access boundaries and capabilities not established.

Do not use a personal memory entry as the authoritative copy of project rules.

### 4.1 Root-instruction pointer for workers

The existing `AGENTS.md` contains the worker pointer to this canonical process, preserving its other instructions. The reusable text below describes that present reading contract; it is not a pending proposal. The separate saved first-mate pointer in section 4.2 still requires post-integration activation:

```markdown
## Project development process

The canonical process description is docs/process/development-process.md.
Before assigned work, read its principles and activation rules, then the
module and acceptance/review rules relevant to this task. Do not treat a
link as evidence that the linked document was read.
Identify the method revision and relevant specification version in the
handoff/result. Report missing, unreadable or conflicting guidance rather
than inventing a replacement. Existing authority, task scope and
permissions still apply.
```

This is ordinary Markdown containing an instruction to read a file. It is not an `@include`, automatic import, hook or executable command. A new coding worker receives the selected root instruction text; following its pointer requires an actual document read.

The human guide at `docs/README.md` uses `[Development process](process/development-process.md)`. A link from the root `README.md` would instead use `docs/process/development-process.md`. These are navigation links, not runtime loaders.

### 4.2 Saved project pointer for the first mate

A root instruction file alone does not establish how the first mate will select and coordinate the process.

[VERIFIED-CODE/CONFIG] Infinitary has native saved standing directions. The first mate receives active directions, and project workers receive their project's directions. They are served as instruction text rather than merely returned as topical search candidates. See the pinned application evidence in section 16.

**Recommended persistent entrypoint:** one short saved instruction scoped to the chosen project registered in Infinitary, recorded by that installation's first mate only when its owner authorizes adoption. Store a pointer and briefing rule there, not a second copy of the process.

Activate the pointer only after the manual and root-instruction edits are available in the project's adopted version. Do not make a persistent pointer depend on a file present only in an unmerged isolated working copy; retain the project's normal integration and approval rules.

Proposed direction text:

```text
For this project, use docs/process/development-process.md as the canonical
process description, subject to existing authority, scope and permissions.
The first mate obtains or refreshes a bounded worker briefing for the
current method revision before planning work. It identifies authoritative
files, applicable module, specification/decision references, canonical
backlog, ownership, acceptance/evidence rules and unresolved gaps.
The first mate carries those references into execution tasks. Workers read
relevant documents and identify the method/specification revisions in
results. A path is not proof that the manual was read. Reading or adopting
the method does not authorize product implementation, merging or deployment.
```

The saved instruction belongs to Infinitary's project-scoped instruction state; the manual remains authoritative in the shared project. Do not copy the full manual into global preferences or personal knowledge as a substitute.

Two independent installations each need their own authorized project pointer. Sharing the project files does not synchronize these saved instructions. One contributor's owner cannot grant access to the other contributor's private app or sign-in.

If no persistent direction is recorded, an explicit project-work request can commission the same read-only briefing. That is a per-request entrypoint, not a persistent default. This documentation change does not configure the saved direction; the first mate activates it after integration and verifies the bootstrap before claiming persistent use.

### 4.3 Bootstrap and normal execution

The documentation adoption places this manual and its entrypoint links in the project. After integration, the first mate reconciles any existing project direction, activates the short project-scoped pointer under the adoption authority, and commissions the bounded reader. Do not activate it from an unmerged working copy or ask a contributor to move the files manually. No application source change, global direction or other installation is part of this adoption.

At the start of project work:

1. The first mate receives the project pointer or an explicit request to use the method.
2. The first mate commissions a bounded read-only worker to inspect the current root instructions and canonical manual. The worker reports the actual method revision and relevant project facts, without modifying the project.
3. The worker returns the method brief described above, including unresolved choices, applicable acceptance and evidence rules.
4. The first mate uses that brief to select the appropriate module and plan authorized work. Execution tasks carry the canonical issue and method/specification references.
5. A stale, missing or unverifiable revision triggers a new read/reconciliation. Method changes do not silently change active work or its authority.

A bootstrap assignment can be described as: read the root authority and `docs/process/development-process.md`; return a versioned method brief and missing/conflicting facts; make no edits and start no implementation. This describes the reader's contract, not a command for the human to run.

Reuse a current brief only when its relevant source revision is established. There is no claimed automatic watcher that notices a Markdown edit and refreshes every conversation. Check at work boundaries and after a known method change.

### 4.4 Automatic serving versus requested behavior

| Mechanism | What the inspected application provides | What still requires action or checking |
| --- | --- | --- |
| Root instruction file | The coding-worker path selects and serves the root instruction text | A worker reads the linked manual and follows its applicable rules |
| Saved project instruction | Native direction serving reaches the first mate and the project's workers | The first mate actually commissions or refreshes the briefing |
| Canonical manual | A versioned file after project adoption | No automatic import, installation or workflow execution follows from its existence |
| Method brief | A proposed bounded worker/report handoff using existing task primitives | Current revision, completeness and unresolved gaps must be checked |
| Independent installations | Separate app records and authority | No automatic project-direction synchronization or duplicate-work lock is established |

Automatic text delivery is not proof of obedience, complete review or semantic correctness. Common project checks and review evidence remain necessary.

## 5. The three process modules

```text
Design and learning       Issues and roadmap          Delivery
-------------------      -------------------         ----------------------
Goals and constraints -> Bounded outcomes          -> Implement and validate
Specification            Acceptance and ownership    Independent review
Decision records         Priority and dependencies   Authorized integration
Reviewed design version  Authorized ready work       Release/observe if needed
         ^                        ^                          |
         +------ new evidence can reopen a decision ----------+
```

These are responsibilities, not three services or mandatory states. An investigation can finish with an answer. A small defect can use a short route. A significant feature can require the full design and review loop.

### 5.1 Design and learning

**Input:** A problem or goal, available project evidence, current architecture, constraints and relevant existing plans/issues.

**Responsibilities:**

1. Inspect what the project already does before inventing a new architecture or duplicate work.
2. Establish goals, non-goals, constraints, users, invariants and material uncertainty.
3. Use manageable question rounds. Ask about preferences and consequential trade-offs the human owns; inspect facts that available tools can establish.
4. Explain viable approaches, how they work, pros/cons, failure modes, cost, maintenance and reversibility as relevant.
5. Recommend a fit for the actual context, including assumptions, uncertainty and conditions in which another option would be better.
6. Record intended behavior, interfaces, failure cases and acceptance scenarios in a specification.
7. Record decisions and unresolved questions separately from the specification.
8. Obtain distinct fresh reviews when proportionate, resolve material findings and identify the resulting specification version.

**Outputs:** Specification, decision records, open questions and review results linked to an identified version.

**Exit:** The scope and consequential choices required for the next authorized step are resolved. Unanswered material questions are not hidden behind a generic approval request.

The human need not independently design a better solution. The agent must make its recommendation understandable and show where it may be wrong. Mechanical choices should follow existing project conventions rather than burdening the human with an unexplained menu.

The specification should cover, proportionately: problem and outcome; scope/non-goals; current facts and assumptions; behavior and interfaces; invariants and data effects; failure/adverse cases; operational implications; acceptance scenarios; and links to decisions.

### 5.2 Issues and roadmap

**Input:** A sufficiently understood outcome, such as a reviewed design, reproducible defect or bounded investigation question.

**Responsibilities:**

1. Search canonical issues and existing changes before creating another issue.
2. Align the outcome with existing code, architecture, invariants and accepted plans.
3. Split only when outcomes can be independently understood, validated or handed off. Do not create an issue for every procedural action.
4. Define proportionate acceptance, dependencies, priority and implementation ownership.
5. Build the roadmap from canonical issues and real prerequisites, optionally grouped by release goal.
6. Select authorized ready work. A roadmap entry is not permission to start, merge or deploy.

**Outputs:** Canonical issue records, a roadmap view and bounded execution handoffs.

**Exit:** The next assignment has an owner, sufficient context, a checkable outcome and no unresolved prerequisite that makes it unsafe or impossible.

An investigation may be ready with a question and expected answer rather than an implementation specification. An initial idea needs less structure than implementation-ready work.

### 5.3 Delivery

**Input:** An authorized bounded issue, ownership, applicable method/specification versions, acceptance and validation obligations.

**Responsibilities:**

1. Reconcile the current code, active work and design version before editing.
2. Implement the bounded scope without unrelated repairs or unrequested redesign.
3. Run the project's applicable checks and adverse cases, using disposable environments/data where equivalent.
4. Preserve the exact version, environment, result, evidence and gaps. Stop on failed evidence or missing capability rather than relabeling a stage.
5. Obtain the applicable independent review of the delivered version. Preserve which findings were resolved, disputed or remain open.
6. Update affected specifications, decision records and development history with the change.
7. Request or perform integration, release and deployment only under the applicable explicit authority.
8. Verify the target-environment outcome when the issue requires it; record what is integrated, released and observed separately.

**Outputs:** Change or answer, executed validation records, review results, documentation updates and applicable release/observation references.

**Exit:** Mark the issue done only when its requested outcome and applicable evidence obligations are met. Otherwise report the blocker/gap and keep the issue not done; completing a blocked handoff does not complete the issue. Passing checks are not merge/deployment consent.

Project test rules govern how tests are written and run. This process does not impose one language, test framework, hosting provider, model family, reviewer count or universal command.

## 6. Issue classification: type, state and activities

### 6.1 Proposed primary types

| Type | Outcome |
| --- | --- |
| Defect/bug | Correct behavior that does not meet the accepted expectation |
| Feature | Add or change intended behavior |
| Dependency/platform upgrade | Move an external dependency or execution platform to an intended version |
| Refactor | Improve internal structure while preserving the intended external behavior |
| Investigation/reproduction | Establish an answer, evidence or a reproducible case |
| Documentation/specification | Improve a project document or its stated intent |
| Validation/developer tooling | Improve tests, checks or development support |
| Operation | Carry out a bounded operational change or verification |

Architecture is normally a cross-cutting impact plus a decision record, not a mutually exclusive primary type. A feature, upgrade or refactor can all affect architecture. Security, performance, reliability and observability are also cross-cutting concerns.

Technical debt often maps to refactor/tooling. An incident can produce an operation and a distinct investigation or defect. Upgrading dependencies is not the same as publishing the project's own release. The taxonomy should fit the actual project; these labels are not new native Infinitary task types.

### 6.2 Proposed conceptual states

`backlog → ready → doing → done`

`blocked` records an impediment; work can resume when it clears. `cancelled` records an abandoned outcome. Reopening requires a reason and the applicable authority.

These are conceptual project states. Do not claim that writing this document adds them to an application's native interface.

### 6.3 Activities are not mandatory states

| Activity | How to use it |
| --- | --- |
| Idea | Backlog maturity, not a compulsory stage for existing defects |
| Research | Optional investigation with a bounded question when uncertainty matters |
| Planning | Proportionate preparation for the outcome |
| Decomposition | Independent outcomes, not an issue per action |
| Alignment | Check existing code, architecture, invariants and plans early and after relevant changes |
| Test design | Define cases and expected outcomes during planning, then refine with evidence |
| Implementation and tests | Build and obtain actual proof; test code alone is not a passing run |
| Review/pull request | Review/delivery artifact where applicable, not a state every answer must enter |
| Deploy | Applicable operational work that may group several integrated issues |
| Post-deploy verification | Required when the requested outcome includes target-environment behavior |

Example routes:

- Investigation: question → evidence → answer; no forced code change or deployment.
- Small defect: reproduce → fix → execute relevant checks → review/integrate as required.
- Significant feature: dialogue → reviewed spec/decisions → issues → implementation/validation/review → authorized release → required observation.
- Documentation-only work: establish the intended correction → update the document → check accuracy and fresh-reader comprehension.

## 7. Issue and handoff contracts

An implementation-ready issue should identify:

- Stable canonical ID and primary type.
- Bounded outcome and non-goals.
- Specification/decision references and relevant versions.
- Acceptance scenarios, expected outcomes and needed evidence.
- Real prerequisites and priority.
- Project work state, implementation owner and any blocker.
- Relevant architecture/risk labels.
- Linked branch/change, results, evidence and release references as they become available.

Do not require fictitious information for an early idea or investigation. Do not use a field's presence as proof that its claim is correct.

Each execution handoff identifies the canonical issue, adopted method revision, relevant design version, scope, acceptance, ownership and expected output. Its result identifies the delivered version, actual outcome, proof, open findings and gaps.

A receiving module checks the handoff rather than assuming the previous label proves readiness. Machine checks can verify required fields, references and shape. Review and executed tests establish the applicable substantive claims.

## 8. Two-contributor coordination

Use separate independent assistants when each contributor should retain separate control and private application state. Share project artifacts and canonical issue records, not sign-ins or whole private transcripts.

### 8.1 Ownership protocol

1. Search for an existing issue/change before filing another outcome.
2. Assign one implementation owner before work begins. Preassigned issues are the simplest two-person starting point.
3. Link the active branch/change and evidence to the canonical issue.
4. Work on independently owned issues in parallel when their contracts and code areas permit it.
5. Order shared contracts and integration explicitly.
6. Transfer ownership explicitly after reconciling existing branches, running work and uncertain effects.

An assignee is an agreement, not an atomic lock. Two assistants could both read an unassigned issue before either records a claim. Autonomous selection requires a single dispatcher or an atomic claim/lease mechanism; that is additional coordination, not a guarantee supplied by a shared issue list. Hard prevention also needs admission enforcement that uncoordinated clients cannot bypass.

Do not invent native cross-instance task synchronization. Duplicate implementation is undesirable; independent review is useful intentional overlap.

### 8.2 Shared methodology and quality

Both contributors use the adopted process revision, common acceptance rules and required project checks. They review method changes like code. A task should not silently use a stale clone or private policy as the project method.

Common gates establish a baseline, not identical output quality. App versions, models, reasoning effort, personal instructions and environments can differ. Confirm the gate on actual representative work instead of assuming the assistants behave identically.

Device pairing must not be confused with independent teammate accounts.

[VERIFIED-CODE/CONFIG] In the inspected Infinitary build, joining another home is a view of one controller with broader captain authority for permitted requests, not a project-limited federation. See the pinned application evidence in section 16. Verify permissions and installed versions before any pairing decision; this document requests or configures none.

## 9. Fresh review and test evidence

Choose reviewer responsibilities according to risk. Illustrative lenses are:

| Lens | Primary question |
| --- | --- |
| Comprehension | Can a fresh reader reconstruct intent and use the document without private history? |
| Failure/security | What adverse cases or trust boundaries could invalidate the design? |
| Data invariants | What state must remain true across updates, retries, recovery and migration? |
| Implementation/test readiness | Are contracts and acceptance concrete enough to implement and validate? |

The exact number and model mix remain project decisions. Several reviewers using the same assumptions can still share blind spots.

For initial independent review:

1. Identify the reviewed artifact/version, task and permitted input documents.
2. Do not inherit the author's prior conversation or other reviewers' conclusions.
3. Ask for independent findings before synthesis.
4. Preserve findings by origin, their evidence and whether they are resolved or disputed.
5. Re-review changed material according to the project's rules; identify the actual delivered version.

Fresh context is not a filesystem sandbox or a guarantee that mandatory instructions and shared tools are absent. Record the real boundary rather than promising enforced restriction that the runtime does not provide.

Use a scenario matrix:

| Requirement | Case/adverse case | Expected outcome | Test code | Executed run/version/environment | Evidence | Gap |
| --- | --- | --- | --- | --- | --- | --- |
| A real requirement reference | Concrete trigger | Observable result | Present/absent, with reference | Actual result, or not run | Retained proof | Explicit limitation |

A scenario analysis can discover a missing case but is not a test execution. A written test can be wrong or unexecuted. A passing run proves its observed cases within its environment, not every possible condition. Line coverage and reviewer count are not exhaustive-coverage certificates.

Ask for required sensitive/costly access through the applicable consent mechanism. Missing devices, accounts or environments remain gaps; do not silently downgrade a required check or treat integration as deployment proof.

## 10. Shared project understanding

A reader should answer four questions using project artifacts alone:

1. What works now, at which version and with what proof?
2. What is active, who owns it, and what is blocked or problematic?
3. Why were the decisions made, and what remains unresolved?
4. What comes next, why that priority, and what dependencies lead there?

The guide is an index and concise account, not another tracker. The specification states intent. The current-state view cites observed delivery facts. The decision record explains choices. Development history records meaningful events and evidence references, not a raw assistant diary.

The issue owner updates affected records with the change. A meaningful log entry can identify:

- What changed or was learned.
- Relevant issue, design and change/release references.
- What was actually checked, at which version/environment.
- Known problems or remaining gaps, linked to canonical issues.
- A decision or dependency change that affects direction.

Do not copy all commits, checker output or private prompts into the log. Do not maintain another private list of project problems.

Show the source/version checked. Mark stale, unknown and unverified claims rather than filling gaps with generated narrative. An accepted design is not an implemented feature; a merged change is not automatically released or target-environment verified.

**Fresh-reader check:** Someone without the private conversations can reconstruct current behavior, active work, blockers, rationale and next steps from the guide and its links. A missing answer is a documentation defect, not a reason to require access to private history.

## 11. Control, checks and measurement

Use the existing execution system's task/result/dependency primitives where available. Do not introduce another runner merely to represent these modules.

Controls should verify the actual contract: correct method/spec revision, ownership, scope, required acceptance, evidence, unresolved findings and applicable authority. Shape validation is useful but cannot prove semantic truth or complete inspection.

Candidate measures include:

- Time waiting for a decision, prerequisite or ownership transfer.
- Implementation-to-result time and time blocked.
- Rework after design approval and its causes.
- Acceptance scenarios with actual executed proof versus explicit gaps.
- Defects discovered after the intended validation boundary.
- Model usage and cost where measured and available.

No target thresholds are established by this manual. Define the denominator, environment and baseline before claiming improvement. More reviewers, issues, stages or lines covered do not by themselves mean better quality. Extra review can increase usage and delay.

## 12. Reusing the method

### 12.1 Start with the existing project

For one project, its versioned process documents are sufficient. Both contributors read the same adopted revision. The portable manual can be mapped into those documents without introducing a separate method service, global configuration or a package ecosystem.

Keep the general method distinct from project-specific facts. The method says how to choose and prove; the project's own configuration owns its actual commands, platform choices and constraints.

### 12.2 Reuse across projects when needed

If several projects genuinely use the method, one ordinary versioned methodology source can become the upstream home. That is a future organizational choice, not a project or service created by this document.

Each adopting project should:

1. Record the source and exact adopted revision, using normal version-control references.
2. Keep the adopted method or its explicit reference accessible to contributors.
3. Record project-specific deviations with reasons and scope.
4. Review and explicitly adopt later changes rather than silently following an unreviewed latest version.
5. Keep active work on its identified method revision unless an explicit update is reconciled.

A deliberately pinned downstream adoption is not a second independently editable master of the same project policy. Distinguish upstream general improvements from intentional local deviations. Do not use personal-folder symlinks that another contributor cannot resolve or unreviewed network instructions loaded on every run.

Use the project commit/tag containing the adopted manual as the authoritative method revision. The portable input is identified by its source checksum above; it is not a separate published method release or runtime version counter.

## 13. Improving and versioning the process itself

The method needs its own development history, separate from the history of features built with it.

For a meaningful process change:

1. Record the observed problem and evidence in the canonical backlog, with a process-related label rather than creating another backlog.
2. Propose the smallest change to the affected module, handoff contract or example.
3. Explain the alternatives, recommendation, expected benefit, cost and what prior behavior changes.
4. Identify affected templates, checks, active work and downstream projects.
5. Have a fresh reviewer check clarity, consistency, failure cases and whether the claim is supported.
6. Validate the change proportionately on representative scenarios; distinguish proposed exercises from executed evidence.
7. Update the method and its examples/contracts together; record reasons and unresolved limits in normal version history/decision records.
8. Adopt the new revision explicitly in the relevant project. Coordinate migration of active work and local deviations; do not change other projects silently.

Distinguish editorial clarification from behavioral or breaking handoff changes. Use a compatible adoption plan or explicit migration when old records/clients would no longer satisfy the new contract. Versioning the document alone does not make the workflow comply.

Suggested process-validation scenarios for later authorized work:

| Scenario | Expected behavior |
| --- | --- |
| Small defect | A proportionate route, not compulsory full architecture planning |
| Investigation only | An evidence-based answer can finish without a pull request or deployment |
| Significant feature | Traceable specification, decisions, issue scope and executed acceptance evidence |
| Documentation change | Accuracy and fresh-reader checks without fabricated runtime proof |
| Two contributors select the same issue | Ownership conflict is detected/reconciled; an assignee is not claimed to be an atomic lock |
| Stale method or specification | The mismatch is explicit before consequential work; active work is reconciled |
| Missing target-environment access | The check remains a named gap, not a pass |
| Rejected recommendation | The decision record preserves the selected alternative and reasons |
| Failed or disputed review | Findings remain attributable and are resolved or explicitly left open |
| Method update during active work | No silent change of scope, authority or adopted revision |

These scenarios are a validation proposal, not a report that they ran.

## 14. Adoption checklist

This checklist guides adoption and later method updates; it does not start product work or grant additional authority.

1. Identify the target project, existing root authority, documents, tracker and test rules.
2. Map the general method into existing project resources; avoid duplicate rulebooks or replacing authority accidentally.
3. Record the adopted method reference, project deviations and canonical backlog.
4. Establish implementation ownership and the actual common validation/review gates.
5. Give each coordinating assistant a compact, versioned method brief; confirm the real installed capabilities rather than assuming native synchronization.
6. Apply the method to a bounded representative issue and preserve actual evidence/gaps.
7. Run the fresh-reader check on current state, problems, decisions and direction.
8. Review the observations before expanding automation or changing the method.

No build, merge, release, access change, paid service or other external effect is authorized by this manual.

### 14.1 Project documentation acceptance checks

These manual tests cover this documentation adoption. Use the actual checked project revision and retain the reader's result, not merely a statement that the files contain the expected words. No new automated checker is installed.

| Test | Reader action | Expected result and failure detected |
| --- | --- | --- |
| Human entrypoint | Start at the root `README.md`, follow its documentation map, then the development-process link | Reach this single manual; existing architecture, invariants, decisions and history remain findable. A missing or wrong relative link fails the check. |
| Worker entrypoint | Read `AGENTS.md`, follow the process pointer, then select the principles, activation, delivery and review sections for documentation-only work | Return a brief with actual method/project revision, applicable module, specification basis, ownership, gate, evidence and gaps. A path alone or a missing revision is not a completed read. |
| Existing records | Follow the manual's project mapping to architecture, invariants, decisions, `RECORD.md` and GitHub issues | Explain which record owns behavior, intent, reasons, history and live work; do not invent a second backlog, log or an already implemented specification. |
| Authority and adverse case | Explain what to do with a stale method/spec revision, a missing document or target access, and a passing pull-request check | Re-read/reconcile stale guidance, report missing proof as a gap, and retain separate merge/deploy approval. Passing checks do not authorize either effect. |

Run the project's existing documentation, type and build/test gates described in section 3 and the run/verify guide. These deterministic checks do not prove that an assistant followed the manual. After integration, the first mate separately verifies the saved-pointer → bounded reader → versioned brief → authorized planning handoff in sections 4.3–4.4. Retain stale-version reconciliation and any unproven steps; do not claim an automatic watcher or hard cross-instance lock.

## 15. Reusable record outlines

These are field outlines, not installed templates or native application schemas. Reuse existing project records that already serve the purpose.

### Method brief

- Method source/revision.
- Project/design versions and authoritative documents.
- Local deviations and their reasons.
- Canonical backlog and ownership convention.
- Validation configuration and review/evidence requirements.
- Open decisions and unverified capabilities.

### Decision record

- Question and relevant context/constraints.
- Viable alternatives, mechanisms, benefits and drawbacks.
- Agent recommendation, reasons, assumptions and uncertainty.
- Accepted choice and decision authority, or unresolved status.
- Specification version, consequences and conditions for revisiting.

### Review finding

- Stable finding ID, lens and reviewed artifact/version.
- Claim or affected acceptance scenario.
- Evidence, adverse case and expected versus observed behavior.
- Whether it is analysis, written test evidence or an executed result.
- Recommendation, disposition and unresolved disagreement/gap.

### Delivery record

- Canonical issue, owner and adopted method/design references.
- Delivered version and bounded outcome.
- Executed checks, environment, results and retained evidence.
- Review findings and remaining gaps.
- Documentation changes and applicable integration/release/observation references.

### Process-change record

- Observed process problem and evidence.
- Affected module/contract and proposed change.
- Recommendation, trade-offs and expected measurable effect.
- Compatibility/migration impact and validation actually performed.
- Adopted source revision, reasons and remaining uncertainty.

## 16. EGM relationship and references

This is an EGM-inspired adaptation, not an official EGM distribution or proof of native EGM integration.

[VERIFIED-CODE/CONFIG] The source pattern is a context-rich author and fresh document-focused reviewers. It is not a general-purpose automatic memory or compaction system. The overview and architecture below provide the source.

The source below is pinned to `84145300b9e0e3fadd21617da345c19445c74219`:

- [Elephant-Goldfish Model overview](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/README.md): design/review roles and invoked drift checks.
- [EGM architecture](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/docs/designs/architecture.md): author/reviewer context distinction and convention versus enforcement.
- [Brainstorm instructions](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/skills/egm-brainstorm/SKILL.md): clarification and parallel lenses.
- [Draft instructions](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/skills/egm-draft/SKILL.md#L63-L71): the original rule forbids ranking/defaults/picking among defensible architectural options even when asked.
- [Review instructions](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/skills/egm-review/SKILL.md): review stages and comprehension paraphrase.
- [Implementation-readiness standard](https://github.com/google/elephant-goldfish-model/blob/84145300b9e0e3fadd21617da345c19445c74219/resources/document_standards/implementation-readiness-standard.md): concrete planned cases, not execution proof.

This method deliberately replaces the no-recommendation rule with a requirement for a reasoned contextual recommendation. It also adds an explicit separate decision log, a learning objective, canonical issue/ownership coordination, evidence-based delivery and a reusable method-change protocol. Do not copy the contradictory rule unchanged into an adopted project method.

### Pinned application evidence

The application notes above refer only to the inspected immutable Infinitary **0.7.1**, source commit `dc7120023263e1fc446a115ace0a191a5fad915a`. These are paths in that application's source snapshot, not proposed files in an adopting project:

- `src/core/knowledge/directions.ts:83–91,192–203,216–235`: authoritative direction sets, first-mate/project-worker visibility and rendered standing instructions.
- `src/core/orchestrator/firstmateContext.ts:530–537,632`: directions included in first-mate context.
- `src/core/orchestrator/crewTurns.ts:216–241`: project directions carried into worker turns with delivery tracking.
- `src/core/session/projectResources.ts:18–41`: root instruction precedence and project skill directories.
- `src/core/pi/piResourceLoader.ts:78–101` and `src/core/pi/session.ts:1258–1275`: coding-worker project-resource loading.
- `src/core/orchestrator/seat.ts:298–313`: the coordinator's separate home, prompt and tool specification.
- `src/main/shell.ts:35–46,213–223,321–326`: shared-controller view mode rather than independent-controller federation.
- `src/core/connection/connection.ts:220–241`: view requests use captain authority for permitted calls.
- `src/core/devices/joinedHome.ts:9–18` and `docs/view.md:3–15,25–26,100–123`: view-side grant/state and shared-control documentation.

[OPAQUE-HOST] Another contributor's actual build, settings and access have not been inspected. Matching behavior must not be inferred for an unknown installation.

Application-specific hard guarantees must be verified separately. No project document can create runtime input isolation or cross-controller admission enforcement that the application does not implement.

## 17. Current evidence and change history

**Portable basis:** The initial portable edition defines the design/learning, issue/roadmap, delivery, two-contributor, shared-documentation and method-maintenance contracts. Its source checksum is recorded at the start of this manual; EGM references stay pinned in section 16.

**Project adoption:** Keep one manual and its three modules. Reuse `AGENTS.md` for workers, `docs/README.md` for people, the existing architecture/invariants/decision records and `RECORD.md` for history. GitHub issues remain the canonical backlog. Section 14.1 adds project-specific manual acceptance tests; the existing documentation/build/test commands remain the executable gate. Normal version history and the pull request retain the adoption diff and its validation results.

This is documentation, not installed automation. The saved first-mate instruction and actual native bootstrap are post-integration work, not effects of the manual's presence. No cross-instance race trial, comparative quality benchmark or reviewer-isolation experiment is established by this adoption. The representative documentation reader check must report what actually ran and any remaining gaps; broader suggested scenarios remain proposals until exercised.

Future changes replace assumptions with observed project facts, preserve gaps and identify the actual adopted revision. Do not treat a reviewed manual as validated runtime infrastructure.
