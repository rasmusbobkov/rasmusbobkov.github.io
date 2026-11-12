## Naming

`firstmate_astro` is an Estonian-first astrology app built with the Astro web
framework; "astro" in tool names, scripts and the docs below means the framework,
not the product domain.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Code size

No code file may pass 1500 lines. `scripts/check-file-lengths.sh` counts them
and `npm test` fails through `pretest` on one that does. Split the file; the cap
moves only by a deliberate decision.

## Project development process

The canonical process description is [docs/process/development-process.md](docs/process/development-process.md).
Before assigned work, read its principles and activation rules, then the
module and acceptance/review rules relevant to this task. A link is not proof
that the document was read. Identify the method revision and relevant
specification version in the handoff/result. Report missing, unreadable or
conflicting guidance rather than inventing a replacement. Existing authority,
task scope and permissions still apply.

## Documentation

Project map: `docs/architecture.md`, invariants in `docs/invariants.md`, decisions in `docs/decisions/`.

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
