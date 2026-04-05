---
title: Feature Surfaces
description: A route-level map of the major user-facing areas in the DevTrends product.
---

# Feature Surfaces

The main dashboard surface is organized under `src/app/(dashboard)`. This section maps those user-facing routes to the subsystems behind them.

## Dashboard areas

| Surface | Route family | Purpose |
| --- | --- | --- |
| Technologies | `/technologies` and `/technologies/[slug]` | Core rankings, detail pages, and score-driven decision support |
| Compare | `/compare` | Side-by-side comparisons for competing technologies |
| Jobs | `/jobs` plus company, role, and location detail pages | Hiring intelligence and market demand |
| Ask | `/ask` | AI-assisted answers and guided exploration |
| Quiz | `/quiz` and specialized quiz pages | Decision tools, learning paths, and roadmap flows |
| Blockchain | `/blockchain` | Ecosystem health, usage, fees, bridges, and related onchain views |
| Languages | `/languages` | Programming language rankings and momentum |
| Repos | `/repos` | Trending and notable repository discovery |
| Digest | `/digest` | Aggregated summaries and updates |
| Methodology | `/methodology` | Product-facing explanation of how scoring and analysis work |

## How to use this map as a contributor

- Start with the page route under `src/app/(dashboard)`
- Find the page client or major component in `src/components`
- Trace data loading into `src/lib/server`, `src/lib/*`, or `src/app/api/*`
- Verify whether the feature depends on cron-generated persisted data, real-time API work, or AI generation

## Cross-cutting systems behind many surfaces

Several areas rely on shared infrastructure:

- scoring and momentum logic
- AI routing and generation
- Supabase-backed server data loaders
- grouped API route families
- charting and shared design components

Because of that, many product changes are not isolated to a single page.

## Related pages

- [Frontend and Routing](../architecture/frontend-and-routing.md)
- [Technologies and Compare](../subsystems/technologies-and-compare.md)
- [Jobs and Quiz](../subsystems/jobs-and-quiz.md)
- [Blockchain, Languages, Repos, and Digest](../subsystems/blockchain-languages-repos-and-digest.md)
