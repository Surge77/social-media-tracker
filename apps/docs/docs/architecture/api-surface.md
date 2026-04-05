---
title: API Surface
description: Grouped overview of the main API route families in the DevTrends repository.
---

# API Surface

The API layer is implemented under `src/app/api`. It is grouped by product domain rather than by one shared service abstraction.

## Route families

| Group | Purpose | Representative routes |
| --- | --- | --- |
| `technologies` | Ranking, stats, charts, pairs, alternatives, and detail data | `/api/technologies`, `/api/technologies/[slug]`, `/api/technologies/stats` |
| `jobs` | Jobs overview, openings, role, company, and location views | `/api/jobs/overview`, `/api/jobs/openings`, `/api/jobs/roles` |
| `ai` | Ask, compare, insight generation, digest, prompts, feedback, monitoring | `/api/ai/ask`, `/api/ai/compare`, `/api/ai/digest/latest` |
| `blockchain` | Onchain overview, fees, gas, bridges, stables, hacks, language views | `/api/blockchain/overview`, `/api/blockchain/gas` |
| `repos` | Trending and curated repository data | `/api/repos/trending`, `/api/repos/legendary` |
| `languages` | Language ranking data | `/api/languages/rankings` |
| `compare` | Comparison-oriented route used by product compare experiences | `/api/compare` |
| `quiz` | Quiz helper routes and project recommendation paths | `/api/quiz/projects` |
| `cron` | Scheduled fetch, scoring, cleanup, and weekly orchestration | `/api/cron/fetch-daily`, `/api/cron/weekly-tasks` |
| `admin` | Protected admin-only monitoring or data health endpoints | `/api/admin/data-health` |

## How to reason about the API layer

- Some routes return precomputed data from Supabase
- Some orchestrate scheduled collection or recomputation
- Some call into the AI layer
- Some act as thin wrappers over library modules in `src/lib`

The important question is not just "which route exists?" but "what kind of work does this route do?"

## Public-safe boundary

This page documents route families and behaviors. It does not publish secrets, internal bearer tokens, or privileged request instructions.

## Testing surface

There are route-oriented tests in the repository, especially around:

- AI routes
- cron routes
- technology detail routes
- quiz route behavior

Use those as a signal when changing request or response behavior.

## Related pages

- [System Overview](./system-overview.md)
- [Cron and Operations](../contributor/cron-and-operations.md)
- [Testing and Quality](../contributor/testing-and-quality.md)
