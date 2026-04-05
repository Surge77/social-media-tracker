---
title: Cron and Operations
description: Public-safe operational guidance for scheduled routes, auth boundaries, and runtime expectations.
---

# Cron and Operations

DevTrends relies on scheduled routes to keep persisted signals and derived analytics fresh. The public docs should explain that shape clearly without turning into a private operations manual.

## Scheduled routes

The current schedule is defined in `vercel.json`:

| Route | Schedule |
| --- | --- |
| `/api/cron/fetch-daily` | `0 2 * * *` |
| `/api/cron/fetch-daily/batch-scoring` | `0 4 * * *` |
| `/api/cron/weekly-tasks` | `0 3 * * 1` |

## Cron authorization model

`src/lib/cron/orchestrator.ts` shows the public-safe structure:

- scheduled requests can be recognized from Vercel cron headers
- bearer-style auth can be built from `CRON_SECRET`
- internal fan-out requests reuse the same secret-derived trust boundary
- production without a cron secret is treated as a configuration error

Contributors should understand that cron chaining is authenticated, even if the public docs do not publish the exact operational runbook.

## Admin route boundary

Protected admin routes use `ADMIN_API_SECRET` and request guards implemented in `src/lib/http/route-guards.ts`. The existence of admin protection is contributor-facing knowledge. The actual secret values and private calling procedures are not.

## Operational contributor checklist

- Keep `CRON_SECRET` configured in production
- Keep `ADMIN_API_SECRET` configured if protected admin routes are in use
- Treat scheduled route changes as both application and operational changes
- Validate that new cron behavior remains internally authenticated

## What belongs in private runbooks instead

- actual production secret values
- internal escalation procedures
- incident-specific operational steps
- any sensitive admin usage instructions

## Related pages

- [Data Ingestion and Scoring](../architecture/data-ingestion-and-scoring.md)
- [Environment and Integrations](../getting-started/environment-and-integrations.md)
