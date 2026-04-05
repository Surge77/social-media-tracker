---
title: Docs Workflow
description: How to maintain the published docs site and keep it aligned with the repository.
---

# Docs Workflow

This repository has two documentation layers on purpose.

## Published docs

The published site lives in:

```text
apps/docs/
```

Use it for:

- contributor onboarding
- architecture references
- stable product and subsystem explanations
- public-safe operational guidance
- documentation that benefits from stable URLs and navigation

## Working notes

The repository root `docs/` folder remains the place for:

- plans
- drafts
- temporary research notes
- debugging writeups
- internal notes that are not ready for publication

## Promotion workflow

1. Draft or explore in the root `docs/` folder if the content is still changing quickly
2. Move stable, contributor-facing material into `apps/docs/docs`
3. Add or update sidebar entries in `apps/docs/sidebars.ts`
4. Run `npm run docs:build`
5. Make sure the published docs still reflect the current codebase

## Writing standard for published docs

- Prefer subsystem explanations over file dumps
- Reference the real code structure
- Keep the public-safe boundary intact
- Update docs when contributor workflow or architecture changes

## Related pages

- [Testing and Quality](./testing-and-quality.md)
- [Local Development](../getting-started/local-development.md)
