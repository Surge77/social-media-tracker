---
title: Testing and Quality
description: Testing expectations and quality checks for contributors working in this repository.
---

# Testing and Quality

The repository already includes meaningful test coverage across route behavior, scoring logic, AI safety and resilience, quiz engines, and docs app shape. Contributors should treat that coverage as part of the implementation surface.

## Main test command

From the repository root:

```bash
npm run test
```

The project uses Vitest for unit and route-level tests.

## What is already covered

There are tests around:

- scoring and normalization logic
- AI routes and safety behavior
- cron orchestration helpers
- jobs pagination and taxonomy
- quiz engines and roadmap logic
- Docusaurus app configuration and docs structure

## Additional quality tools

| Command | Purpose |
| --- | --- |
| `npm run lint` | Lint the main application source |
| `npm run benchmark -- --help` | Inspect the local benchmarking workflow |
| `npm run docs:build` | Validate the docs site and catch broken links |

## Minimum quality bar for contributor changes

- Run the most relevant tests for the changed subsystem
- Run `npm run docs:build` for docs changes
- Re-check routes or UI manually when changing user-facing behavior
- Keep docs aligned when behavior or contributor workflow changes

## Documentation-specific checks

For docs work, verify:

- pages are in the intended sidebar order
- links resolve correctly
- wording matches the current codebase
- no secrets or internal-only runbook details are published

## Related pages

- [Docs Workflow](./docs-workflow.md)
- [Cron and Operations](./cron-and-operations.md)
