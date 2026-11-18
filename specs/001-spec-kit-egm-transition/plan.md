# Implementation plan: Spec Kit and EGM workflow transition

**Specification:** [spec.md](spec.md) (`spec-kit-egm-replacement-v1`)
**Review classification:** Workflow change; all five EGM phases
**Source:** Existing installation with Spec Kit 1.2.5, EGM port 0.9.1 and preset 0.1.1

## Summary

Replace the active custom manual with a versioned constitution and concise integration guide. Use Spec Kit feature artifacts as canonical requirements, technical plan and derived checklist. Adapt the installed preset through its versioned source rather than editing upstream commands or generated skills independently.

## Technical context

This is a documentation and agent-instruction transition, not application code or an external interface. Spec Kit 1.2.5 and EGM 0.9.1 remain pinned. Files are project-local; no runner, service, global plugin, hook or event handler is added. The current project gate is `npm run check` and `npm run build && npm test`.

## Constitution check

The change retains existing product invariants, tracker roles, host authority and separate permissions. The selected review policy requires all five phases because this changes the workflow. Fresh reviewer input boundaries and findings must be retained. Missing reviewers stop completion rather than becoming self-review.

## Project structure

This feature directory contains `spec.md`, `plan.md`, `tasks.md`, `research.md`, `quickstart.md` and `checklists/requirements.md`. The constitution and integration guide point to existing architecture, invariants, decisions and history. No data model or external contract is needed.

## Detailed Implementation Plan

1. Remove `docs/process/development-process.md`; replace its root pointer in `AGENTS.md` and navigation in `docs/README.md`. Preserve framework, server and file-length rules.
2. Fill `.specify/memory/constitution.md` at 1.0.0 and update `docs/process/spec-kit-egm.md` for native artifact ownership, selected review routing, existing tracker roles and host limits.
3. Add `docs/decisions/0010-spec-kit-egm-workflow.md`, index it and append a factual `RECORD.md` entry without rewriting prior history.
4. Update `.specify/local-presets/firstmate-astro-pilot/preset.yml` to 0.2.0; adapt its `commands/speckit.egm.draft.md` to read the canonical spec and refine the same plan. Add `templates/plan-template.md` with the EGM detailed-plan boundary. Preserve the existing review-stage and task-identity command fixes.
5. Set `.specify/extensions.yml` automatic hook execution false. Keep events disabled, hooks empty and the bundled workflow dormant.
6. Regenerate installed preset files and the draft skill using `specify preset update firstmate-astro-pilot --dev .specify/local-presets/firstmate-astro-pilot`. Repeat and compare generated hashes. Verify command and template resolution and inspect all seven EGM definitions and shared instructions against the constitution.
7. Coordinate initial zoom out, comprehension, design critique, intermediate zoom out and implementation readiness on this plan. Supply the spec as context except to standalone comprehension, which receives the plan only. Use explicit packaged persona files and record reviewer input versions, boundaries, findings and dispositions.
8. Demonstrate small-correction and consequential-change classification, stale-spec and missing-reviewer handling. Run the complete project gate. At the new committed version coordinate a bounded documentation skill journey and fresh independent review with retained artifact and source boundary. Obtain independent change review and current hosted checks.
9. After separately authorized integration, the first mate reconciles the standing direction and verifies actual new-artifact reads in a fresh session. That post-integration step is not a merge or deployment authorization.

## Complexity tracking

No new runner, service, data model or external interface is introduced. The native preset is retained because removing it would restore known report-overwrite and task-identity defects and the upstream no-recommendation rule.
