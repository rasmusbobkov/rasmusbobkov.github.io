# Tähelugu development constitution

**Version:** 1.0.0

## Authority and intent

Spec Kit and the Elephant-Goldfish Model (EGM) are the project development workflow. Host instructions, task scope, consent and applicable permissions take precedence. Reading these documents grants no implementation, merge, deployment or resource-access permission. Engineering documentation is English; the application is Estonian-first.

## Canonical artifacts and ownership

Each bounded outcome has one canonical issue in its established product-planning or technical-issue tracker, one implementation owner and one `specs/<feature>/spec.md` for intended behavior. `plan.md` owns the technical approach; EGM drafting refines that same file. `tasks.md` is a derived execution checklist, not another backlog. Concepts briefs and review reports are working inputs or evidence, not competing specifications. Do not migrate or publish private tracker contents. Branch names and feature directories are independent; use `SPECIFY_FEATURE_DIRECTORY` or an ignored local pointer.

The project architecture and run/verify guide is [docs/architecture.md](../../docs/architecture.md); product rules and their verification owners are [docs/invariants.md](../../docs/invariants.md), including the approved cookieless measurement exception. [Decisions](../../docs/decisions/index.md) retain reasons and [RECORD.md](../../RECORD.md) retains history. Do not weaken or duplicate those records.

## Workflow and review

1. Reconcile the canonical issue, owner, branch, scope and source revisions. Use EGM brainstorm when concepts remain unresolved; establish requirements and acceptance with Spec Kit specify and clarify.
2. Create the technical plan with Spec Kit plan; EGM draft may refine it in place. Generate tasks from accepted intent and run Spec Kit analyze before implementation.
3. New behavior, shared contracts, saved-data or security boundaries, and workflow changes require all five EGM phases: initial zoom out, comprehension, design critique, intermediate zoom out and implementation readiness. A bounded correction without those impacts uses its relevant phase: comprehension for documentation, implementation readiness for an understood repair. The first mate records classification and reasons; ambiguity takes all five.
4. Coordinate fresh reviewers through existing host tasks when author delegation is unavailable. Use explicit packaged persona filenames and declared inputs. Standalone comprehension inherits neither the author's conversation nor explanatory sources. Record target versions, inputs, actual context boundaries, reviewer status, findings and dispositions. A missing reviewer is not a clean review; unresolved blocking findings stop completion. Preserve loop limits and stage-specific reports.
5. After implementation authorization, implement accepted scope, run the existing gate and use converge only for remaining accepted work. Obtain independent change review and separate merge and deployment authority. Reviews and plans are not executed tests or deployment proof.

Automatic EGM spawning, persona registration, nested delegation and a complete automated review loop are unproven. Do not replace them with self-review, a second runner, automatic hooks or event handlers. Host card and authority rules govern interaction when generated instructions conflict. Reconcile stale or missing specifications before work and report gaps rather than inventing success.

## Verification

Run `npm run check` and `npm run build && npm test`; build precedes tests because checks read built output. The test gate includes documentation and file-length checks. Record actual commands, source revision, environment, findings and retained evidence. Follow project test rules and the [integration guide](../../docs/process/spec-kit-egm.md).
