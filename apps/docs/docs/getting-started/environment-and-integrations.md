---
title: Environment and Integrations
description: Understand the environment variables and third-party integrations that power DevTrends.
---

# Environment and Integrations

The repository ships with a maintained `.env.example` file that matches the variables the app actually reads. Use that file as the source of truth when onboarding or enabling new integrations.

## Core application variables

These variables are the minimum foundation for anything that touches persisted app data:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side privileged access |
| `NEXT_PUBLIC_APP_URL` | Optional base URL override for local cron fan-out |
| `CRON_SECRET` | Internal auth for cron and scheduled route chaining |
| `ADMIN_API_SECRET` | Protection for admin-only endpoints |

## Source integration groups

The app combines multiple signal sources. You do not need every key for every workflow.

### Engineering and community sources

- `GITHUB_TOKEN`
- `STACKOVERFLOW_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `DEVTO_API_KEY`
- `LIBRARIESIO_API_KEY`
- `YOUTUBE_API_KEY`

These feed repository, package, community, and content signals used across ranking, comparison, and digest features.

### Jobs providers

- `ADZUNA_APP_ID`
- `ADZUNA_API_KEY`
- `RAPIDAPI_KEY`
- `HASDATA_API_KEY`
- `SERPAPI_API_KEY`

Related guardrails:

- `JOBS_INTELLIGENCE_MAX_TECHS`
- `JOBS_INTELLIGENCE_MAX_MARKETS`
- `JOBS_INTELLIGENCE_PAGES_PER_TECH`
- `JOBS_TRENDS_MAX_TECHS`

These guardrails exist to cap runtime, spend, and fan-out when jobs collection expands.

### Blockchain and market helpers

- `ETHERSCAN_API_KEY`
- `COINGECKO_API_KEY`

These support parts of the blockchain and market-facing data collection layer, alongside public or keyless sources configured in code.

## AI provider keys

The current key manager supports several providers:

- Gemini
- Groq
- xAI
- Mistral
- Cerebras
- OpenRouter
- Hugging Face

The app routes work to different providers depending on use case. For example, chat is optimized for low-latency providers while batch summary and comparison tasks prefer Gemini-first routing.

See [AI Layer and Guardrails](../architecture/ai-layer-and-guardrails.md) for the behavior-level explanation.

## Safety rules

- Never commit `.env.local`
- Keep published docs public-safe and do not paste actual secret values
- Only configure the keys needed for the feature area you are working on
- Treat `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, and `ADMIN_API_SECRET` as highly sensitive

## Choosing the minimum setup

| Goal | Minimum useful setup |
| --- | --- |
| Work on docs only | No app secrets required |
| Work on UI with mocked or existing data | Supabase public variables |
| Work on server routes or data loaders | Supabase public and service role variables |
| Work on ingestion, jobs, or AI features | Supabase plus the relevant provider keys |

## Related pages

- [Local Development](./local-development.md)
- [Cron and Operations](../contributor/cron-and-operations.md)
- [AI Layer and Guardrails](../architecture/ai-layer-and-guardrails.md)
