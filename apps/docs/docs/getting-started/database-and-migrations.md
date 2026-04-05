---
title: Database and Migrations
description: How DevTrends uses Supabase and how schema changes fit into contributor workflow.
---

# Database and Migrations

DevTrends uses Supabase as the persisted data layer behind scoring, rankings, jobs intelligence, blockchain views, digest generation, and scheduled ingestion.

## What Supabase is responsible for

At a high level, Supabase stores:

- the canonical technologies catalog
- raw or normalized data points collected from external sources
- computed daily scores and momentum history
- jobs intelligence tables and normalized job listings
- generated digest artifacts and related derived data

The frontend and route handlers read from that persisted layer rather than recomputing everything on every request.

## Schema change location

Repository-managed SQL migrations live in:

```text
supabase/migrations/
```

Recent migrations in this repo show that the schema evolves around:

- jobs intelligence
- jobs aggregator sources
- extended data point coverage for trends
- cron and scoring support

## How contributors should work with migrations

1. Inspect the current tables and routes affected by your change
2. Add a new migration in `supabase/migrations/`
3. Apply the migration in your Supabase project or local workflow
4. Validate the impacted pages or route handlers
5. Document any contributor-facing schema impact if it changes setup or workflow

## Code paths that depend heavily on persisted data

- `src/lib/server/technology-data.ts`
- `src/lib/scoring/pipeline.ts`
- `src/lib/jobs/intelligence.ts`
- `src/app/api/cron/*`

Those modules make it clear that the database is not just a cache. It is the backing store for the product's ranking and intelligence model.

## Practical rule of thumb

If a change affects any of the following, expect a migration or schema review:

- new collected metrics
- new scheduled aggregation outputs
- jobs normalization or linking tables
- daily score inputs or derived score storage
- admin or monitoring views backed by database state

## Public-safe boundary

This docs site explains the migration workflow and data responsibilities. It does not document private operational credentials, production-only SQL secrets, or sensitive internal procedures.

## Related pages

- [Data Ingestion and Scoring](../architecture/data-ingestion-and-scoring.md)
- [Cron and Operations](../contributor/cron-and-operations.md)
