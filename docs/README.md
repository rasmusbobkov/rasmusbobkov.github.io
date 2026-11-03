# Project documentation map

One screen: what lives where, and what to read first.
These files were created by firstmate's private project-docs tool; nothing here runs or depends on firstmate afterwards.
`bash scripts/check-project-docs.sh .` validates them, and this map is kept by hand.

| Read this | When |
| --- | --- |
| [`architecture.md`](architecture.md) | Before a first change: purpose, how to run and verify, the map, and where to change what. |
| [`invariants.md`](invariants.md) | Before touching behaviour that must never break, and when adding or deleting a rule. |
| [`decisions/index.md`](decisions/index.md) | Before revisiting a settled choice; the index table is the only place a decision is listed. |
| The project's root `README.md` | Product description and setup for users. `architecture.md` points there instead of repeating it. |

Rules for keeping this set true:

- `architecture.md` stays one page.
- `invariants.md` holds at most about ten rules, because every entry costs every session that reads it.
- Each decision record is one page named `NNNN-title.md` with context, decision, and consequence.
- Never hand-edit a block marked `fm:generated`; refresh it with the tool that wrote it instead.
