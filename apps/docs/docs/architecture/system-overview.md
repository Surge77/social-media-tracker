---
title: System Overview
description: High-level architecture for the DevTrends product and data platform.
---

# System Overview

DevTrends is a multi-surface Next.js application backed by scheduled ingestion, persisted analytics, and an AI layer that sits on top of stored signals.

## Top-level architecture

```text
Browser
  -> Next.js App Router pages and shared components
  -> grouped API routes in src/app/api
  -> domain libraries in src/lib
  -> Supabase-backed persisted data
  -> scheduled cron orchestration for ingestion and recomputation
  -> AI provider router for summaries, comparisons, chat, and recommendations
```

## Main layers

### Frontend and routing

The frontend lives in the App Router and dashboard route group. It renders ranking tables, charts, quiz flows, jobs views, and AI-assisted surfaces.

### API layer

The API surface is grouped by domain rather than by transport abstraction. Major route families exist for technologies, jobs, AI, cron, blockchain, repos, languages, compare, quiz, and admin monitoring.

### Data and scoring layer

External source signals are normalized, stored, and then recombined into daily scores, momentum, and other derived metrics. The scoring pipeline is implemented in `src/lib/scoring/pipeline.ts`.

### AI layer

The AI system is not a single provider call. It uses a provider router and use-case-specific fallback rules so chat, comparisons, summaries, and digest tasks can optimize for cost, latency, or structured output behavior.

### Persistence and cron

Supabase stores the inputs and outputs that make the product stable across requests. Cron routes drive recurring ingestion and recomputation, with scheduling defined in `vercel.json`.

## Why the architecture matters

This is not a simple content site. Most visible pages depend on stored historical data and derived analytics, which means contributors need to understand:

- route-level behavior
- source integration boundaries
- scheduled jobs
- data freshness expectations
- AI fallback behavior

## Related pages

- [Frontend and Routing](./frontend-and-routing.md)
- [API Surface](./api-surface.md)
- [Data Ingestion and Scoring](./data-ingestion-and-scoring.md)
- [AI Layer and Guardrails](./ai-layer-and-guardrails.md)
