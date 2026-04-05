---
title: Data Ingestion and Scoring
description: How DevTrends collects signals, stores them, and turns them into daily scores and momentum.
---

# Data Ingestion and Scoring

The ranking system is one of the core differentiators of DevTrends. It combines stored signals from multiple sources into daily composite scores, dimension scores, and momentum analysis.

## Signal sources

The repository integrates several categories of source data:

- GitHub activity and repository metrics
- community sources such as Reddit, Hacker News, Dev.to, RSS, and Stack Overflow
- jobs providers and jobs market aggregators
- package and ecosystem signals
- YouTube and content velocity signals
- blockchain-specific metrics for onchain ecosystems

These signals are stored as data points rather than treated as one-off request-time fetches.

## Scoring pipeline behavior

`src/lib/scoring/pipeline.ts` shows the main flow:

1. Fetch active technologies
2. Fetch the current day's data points
3. Backfill latest jobs data when the current day has no fresh jobs points
4. Group metrics per technology
5. Compute dimension-level scores such as GitHub, community, jobs, and ecosystem
6. Apply composite scoring and adaptive weights
7. Apply Bayesian smoothing for low-data technologies
8. Compute momentum and confidence-oriented outputs
9. Persist daily scores

## Why jobs are handled specially

Jobs data is not always collected on the same cadence as other sources. The scoring pipeline explicitly supplements with the latest jobs data so jobs impact remains available even when the current day has no fresh jobs ingestion.

## Freshness and derived outputs

The product reads derived outputs such as:

- composite score
- sub-scores
- momentum
- confidence
- lifecycle classification
- market pulse summaries

Those values are then used by pages, comparisons, and AI summary generators.

## Scheduled routes

The current Vercel cron configuration schedules:

| Route | Schedule |
| --- | --- |
| `/api/cron/fetch-daily` | `0 2 * * *` |
| `/api/cron/fetch-daily/batch-scoring` | `0 4 * * *` |
| `/api/cron/weekly-tasks` | `0 3 * * 1` |

Treat those as the public scheduling shape, not a private production runbook.

## Related pages

- [System Overview](./system-overview.md)
- [Cron and Operations](../contributor/cron-and-operations.md)
- [Technologies and Compare](../subsystems/technologies-and-compare.md)
