# Project documentation map

One screen: what lives where, and what to read first.
The architecture, invariants and decision index started with firstmate's private project-docs tool; their checker needs only bash and git.
`bash scripts/check-project-docs.sh .` validates their shape, and this map is kept by hand. The process manual describes guidance, not installed automation.

| Read this | When |
| --- | --- |
| [`process/development-process.md`](process/development-process.md) | How to design, plan, review and deliver work; the canonical process, mapped to this project's existing records. |
| [`architecture.md`](architecture.md) | Before a first change: purpose, how to run and verify, the map, and where to change what. |
| [`invariants.md`](invariants.md) | Before touching behaviour that must never break, and when adding or deleting a rule. |
| [`decisions/index.md`](decisions/index.md) | Before revisiting a settled choice; the index table is the only place a decision is listed. |
| The project's root `README.md` | Product description and setup for users. `architecture.md` points there instead of repeating it. |

Rules for keeping this set true:

- `architecture.md` stays one page.
- `invariants.md` holds at most about ten rules, because every entry costs every session that reads it.
- Each decision record is one page named `NNNN-title.md` with context, decision, and consequence.
- Never hand-edit a block marked `fm:generated`; regenerate it with the tool that wrote it when that tool is available, and otherwise correct only the stale line and re-run the checker.
