---
title: Jobs and Quiz
description: Jobs intelligence, guided decision flows, and roadmap generation in DevTrends.
---

# Jobs and Quiz

The jobs and quiz subsystems answer a different class of user question than the core ranking pages. They are focused on decision support, market demand, and personalized learning direction.

## Jobs intelligence

The jobs subsystem includes:

- jobs overview pages
- role, company, and location detail pages
- hiring-now summaries
- search-vs-hiring views
- skill adjacency and related intelligence layers
- normalized job listing ingestion and persistence

The implementation spans:

- `src/app/(dashboard)/jobs`
- `src/components/jobs`
- `src/lib/jobs`
- `src/app/api/jobs/*`

`src/lib/jobs/intelligence.ts` shows that this subsystem is not just a thin fetch layer. It manages technology lookups, latest-date selection, normalized listings, and links between jobs data and technology entities.

## Quiz and roadmap flows

The quiz area includes:

- decision quiz
- hype check
- learn next
- stack health
- web3 path
- roadmap generation

The roadmap engine defines structured entities such as roadmap nodes, phases, milestones, user context, and generated roadmap outputs. That makes the quiz subsystem closer to a rule-driven guidance engine than a simple questionnaire.

## Contributor guidance

When changing these flows:

- verify whether the feature depends on persisted jobs data, AI output, or both
- preserve the distinction between general ranking logic and personalized guidance logic
- check tests around quiz engines and route helpers

## Related pages

- [AI Layer and Guardrails](../architecture/ai-layer-and-guardrails.md)
- [API Surface](../architecture/api-surface.md)
