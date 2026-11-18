# Spec Kit and EGM workflow

The [constitution](../../.specify/memory/constitution.md) defines the project workflow. Host authority, assigned scope and consent remain higher. Spec Kit 1.2.5 and the independently maintained EGM port 0.9.1 provide project-local skills; their presence does not authorize implementation, merge or deployment.

## Artifacts and commands

Find the existing canonical issue and owner before work. Product planning and technical issues retain their established tracker roles; one outcome has one canonical issue, not a duplicate in both. Keep private tracker details out of shared files. Roadmaps and host tasks are derived views or assignments.

| Step | Command and artifact |
| --- | --- |
| Explore an unresolved concept | `speckit-egm-brainstorm`; its concepts brief is working input, not another accepted specification. |
| Define intent | `speckit-specify` and `speckit-clarify` produce `specs/<feature>/spec.md`, the canonical requirements for that outcome. |
| Design | `speckit-plan` produces `plan.md`; `speckit-egm-draft` refines that same plan with the feature specification as context. |
| Review | `speckit-egm-review` and `speckit-egm-review-loop` describe EGM phases; use existing host tasks to coordinate fresh reviewers when direct delegation is unavailable. |
| Prepare work | `speckit-tasks` derives `tasks.md`; `speckit-analyze` checks alignment before implementation. Checklists are not a backlog. |
| Implement | With separate authorization, use `speckit-implement`; `speckit-converge` identifies remaining accepted work, not new scope. |
| Investigate drift | `speckit-egm-drift-report` compares an authorized set of documents and sources. `speckit-egm-resolve` assesses attributed findings; changes still need scope and permission. |

The upstream brainstorm skill offers publishing its concepts brief to a separate `docs/designs/` file and handing that file to draft. That conflicts with the constitution's canonical feature specification and plan. Keep the concepts brief as a working input; establish or update the authorized feature `spec.md`, then refine the same feature `plan.md`. Do not follow that separate-design publication handoff as an accepted design master. This disposition does not edit the upstream package or grant permission to publish.

Do not run `speckit-egm-bootstrap` as a mass README rewrite or use task-to-issues conversion by default. The latter remains available only when separately authorized; its feature/task identity repair avoids collisions. Use `SPECIFY_FEATURE_DIRECTORY` or the ignored local feature pointer when branch and feature names differ.

## Review policy and limits

The selected policy matches review to impact. New behavior, shared contracts, saved-data or security boundaries, and workflow changes receive all five phases: initial zoom out, comprehension, design critique, intermediate zoom out and implementation readiness. Bounded corrections without those impacts receive the relevant phase: comprehension for documentation, implementation readiness for an understood repair. The first mate records classification and reasons; ambiguity uses all five. The technical plan is the review target, with the canonical specification as declared context except for standalone comprehension, which receives no author conversation or explanatory sources.

Use explicit files under `.specify/extensions/egm/agents/`: persona names and filenames do not uniformly match. Record each reviewer's actual inputs, version, procedural boundary, findings and disposition. Missing reviewers are not clean reviews. Preserve loop limits and stage-specific reports; unresolved blocking findings stop completion. Host interaction, permissions and task scope override generated chat or automatic-advance instructions. Automatic EGM spawning, registration and nested delegation remain unproven; coordinated fresh reviews are not proof of them.

## Components and verification

The EGM archive is pinned to release commit `31a141167f732aa79d9bd74a88743aaac7b079ce`, SHA-256 `920f2570be2d40f2a5abe359dd7f58658e90aea317b38438bb8444f8a01d4deb`. Its port MIT licence and the original Apache-2.0 licence for the ten marked persona files and bootstrap template are retained in `.specify/extensions/egm/`.

Versioned preset `firstmate-astro-pilot` 0.2.0 lives in `.specify/local-presets/firstmate-astro-pilot/`. It retains reasoned recommendations, distinct review-stage reports and feature/task issue identity, and adapts the plan template and drafting command to the canonical feature artifacts. Regenerate with `specify preset update firstmate-astro-pilot --dev .specify/local-presets/firstmate-astro-pilot`; inspect expected managed-file differences before upgrades. Codex events and automatic hook execution are disabled; the bundled workflow is not a second runner.

Native template resolution requires Python 3 with PyYAML. If the default `python3` lacks it, set `SPECKIT_PYTHON_EXECUTABLE` to a Python executable that has PyYAML, such as the Python environment used by the installed Spec Kit CLI; do not assume the shell default has it.

Run `npm run check`, then `npm run build && npm test`; the latter includes documentation and file-length checks. [Architecture](../architecture.md) owns the run guide, [invariants](../invariants.md) retain product rules including the approved measurement exception, [decisions](../decisions/index.md) retain reasons and [RECORD.md](../../RECORD.md) retains history. Record actual versions, checks, sources, review results and gaps. The earlier bounded skill journey and separately coordinated review did not establish automatic delegation or deployment.
