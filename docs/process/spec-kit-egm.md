# Spec Kit and EGM integration

This integration adds drafting and review aids, not a new development method or dispatcher. The [development process](development-process.md) and root `AGENTS.md` remain authoritative. Its method revision for this adoption is project commit `5aac843dcffa27f53cfc4957ef20fcd5bd0cd2ee`; the adoption specification is `spec-kit-egm-adoption-plan-v1`. The shared firstmate-home project documentation template is a reusable source, not another installed method.

## Components and records

- Spec Kit CLI 1.2.5 generated the managed `.specify/` infrastructure and `.agents/skills/` Codex skills. The Codex integration records `--events false`; do not start the included workflow as a second runner.
- EGM is the independently maintained Spec Kit port, version 0.9.1, release commit `31a141167f732aa79d9bd74a88743aaac7b079ce`. Its release archive SHA-256 is `920f2570be2d40f2a5abe359dd7f58658e90aea317b38438bb8444f8a01d4deb`. Its packaged commands and resources are in `.specify/extensions/egm/`. The port's MIT licence is kept in `LICENSE` there; the ten persona files in `agents/` and `resources/egm-bootstrap/templates.md` identify Apache-2.0, whose original text is in `LICENSE-Apache-2.0` beside it.
- The local preset `firstmate-astro-pilot` 0.1.1 lives in `.specify/local-presets/firstmate-astro-pilot/`. Spec Kit materializes it in `.specify/presets/` and the generated skills. It replaces the upstream draft command's prohibition on recommendations with the method's contextual recommendation rule and carries the review and task-to-issue corrections below. Upstream files remain distinguishable from these overrides.
- The accepted specification for each assignment is its canonical specification. Drafts, generated checklists and review reports are working artifacts, not independent specifications or backlogs. Code-repository issues remain the technical backlog; product planning retains its designated tracker. `docs/architecture.md`, `docs/invariants.md`, `docs/decisions/` and `RECORD.md` retain their existing roles. English remains the engineering-documentation language; the product is Estonian-first.

## Command boundaries

Read the applicable root instructions and process manual before invoking a skill. Project and host authority, user scope and consent take precedence over generated command text. Existing cards and separate implementation, merge and deployment decisions remain in force; a command's suggested next step grants none of them. Do not treat a generated constitution or template as a replacement for existing authority.

| EGM skill | Purpose and boundary |
| --- | --- |
| `speckit-egm-brainstorm` | Explore a bounded concept. Its prescribed files, chat gates and reviewer spawning do not override the assigned artifact, host interaction or available delegation. |
| `speckit-egm-draft` | Draft against the assigned accepted specification, without creating a competing canonical document. The local preset enables reasoned recommendations. |
| `speckit-egm-bootstrap` | Can rewrite existing READMEs and spawn unbounded workers. Do not run it for this adoption; mass bootstrapping is outside its scope. |
| `speckit-egm-drift-report` | Compare selected documents and code; use an authorized target and report location, not an assumed new project record. |
| `speckit-egm-resolve` | Assess attributed findings and apply only authorized fixes; its chat and file instructions do not override host delivery or approval rules. |
| `speckit-egm-review-loop` | Requests fresh reviewers and a staged resolution loop. Stop and report missing delegation rather than substituting self-review. |
| `speckit-egm-review` | Requests fresh reviewers for staged design review. Its generated gates and report paths are subordinate to the assigned scope and host rules. |

The review instructions mix persona names such as `egm-design` with filename-based shortname resolution. The packaged filename for that persona is `agents/design_critic.md`, not `agents/egm-design.md`; other persona names also use hyphens while their filenames use underscores. When the host does not register named personas, use the explicit packaged persona paths rather than assuming the shortname mapping works. Actual delegated execution remains unverified.

The preset's review override preserves separate reports for interactive stages 7 and 9. Its task-to-issues override uses the feature directory and task ID together when matching issues. Refresh the preset from its versioned local source to regenerate these corrections. Integration status may report the preset-overridden core skill as modified relative to the original integration manifest; inspect this expected difference before an upgrade.

The draft command also loads `.specify/extensions/egm/resources/execution_instructions.md`. Its design-only restriction applies within a design workflow, not to a separately authorized implementation. Its blanket step-by-step confirmations, plain-chat-only responses and prohibition on summaries do not displace the existing method or host rules. Resolve real contradictions through the applicable authority and recorded decisions, not an invented universal halt. The preset does not rewrite this shared upstream resource or the other six commands.

## Validation and limits

Run `npm run check`, then `npm run build && npm test`; the latter includes the documentation shape check. A fresh reader should be able to identify the method, accepted specification, record owners, gate and limitations from project documents. The generated instruction files are not proof that a host discovers or follows them.

The disposable pilot verified the release archive, seven generated definitions and static composition of the draft preset. Two independently coordinated readers reviewed a documentation example with procedural input boundaries; that was not automatic EGM delegation. In a fresh project session at commit `dfd7f724a24f7f566c5a7e0319dbe6b8f94d5579`, the supplied skills list included `speckit-egm-drift-report` before its file was opened. The session read and used it for a bounded comparison of the root and documentation READMEs: it found no substantive contradiction, but noted that the documentation map omitted `RECORD.md`. The session did not cross-check code or write the prescribed report because its task was read-only. This was not a complete EGM journey, and automatic delegation was not tested. If a requested fresh reviewer cannot be launched, record it as not run. No second runner, automatic event handler, global plugin or mass README bootstrap is authorized by this integration.
