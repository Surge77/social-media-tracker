# DevTrends

DevTrends is a Next.js application for developer career intelligence. It aggregates signals from engineering communities, job sources, package ecosystems, and blockchain data, then turns them into dashboards, comparisons, AI-assisted analysis, and recurring digests.

Production site: `https://devtrends.dev`

Repository: `https://github.com/Surge77/social-media-tracker`

## What the project does

- Tracks technologies across GitHub, Stack Overflow, Reddit, Dev.to, RSS, npm, jobs, and DeFiLlama-backed blockchain data.
- Scores technologies with a daily pipeline instead of static editorial rankings.
- Ships dashboard surfaces for technologies, languages, repos, jobs, blockchain, comparisons, quizzes, monitoring, and weekly digests.
- Adds AI-assisted endpoints for summaries, comparisons, recommendations, digest generation, and chat.
- Includes an `autoresearch/` workspace for guarded evaluation loops around scoring and AI routing.

## Product areas

The app currently includes:

- Landing page
- Technology detail pages
- Language rankings
- Trending repositories
- Jobs intelligence
- Blockchain dashboard
- Comparison flow
- Quiz flows
- Weekly digest
- Ask AI
- Monitoring and methodology pages

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query
- Supabase
- Vitest
- Vercel cron jobs
- Puppeteer for local benchmark tooling

## Quick start

### Prerequisites

- Node.js 20+
- npm
- A Supabase project
- API credentials for the sources you want to enable

### Install

```bash
git clone https://github.com/Surge77/social-media-tracker.git
cd social-media-tracker
npm install
```

### Configure environment variables

Copy the template and fill in the values you need:

```bash
cp .env.example .env.local
```

The repo supports many optional integrations. Start with the essentials:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `STACKOVERFLOW_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`

Jobs, blockchain, and AI features each have their own optional keys. Use [.env.example](C:/Users/tdmne/OneDrive/Desktop/tracker_final/.env.example) as the source of truth.

### Apply database migrations

Run the SQL files in [supabase/migrations](C:/Users/tdmne/OneDrive/Desktop/tracker_final/supabase/migrations) against your Supabase project.

### Start the app

```bash
npm run dev
```

The dev server runs on `http://127.0.0.1:3000`.

## Common commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

Additional project-specific commands:

```bash
npm run benchmark -- --help
npm run autoresearch:eval:scoring
npm run autoresearch:eval:routing
npm run autoresearch:loop:scoring -- --dry-run
npm run autoresearch:loop:routing -- --dry-run
```

## Data pipeline

Scheduled routes are defined in [vercel.json](C:/Users/tdmne/OneDrive/Desktop/tracker_final/vercel.json):

- `/api/cron/fetch-daily`
- `/api/cron/fetch-daily/batch-scoring`
- `/api/cron/weekly-tasks`

For production, set `CRON_SECRET` so internal cron fan-out calls can authenticate.

Useful API groups live under [src/app/api](C:/Users/tdmne/OneDrive/Desktop/tracker_final/src/app/api):

- `ai`
- `blockchain`
- `compare`
- `cron`
- `jobs`
- `languages`
- `quiz`
- `repos`
- `technologies`

## Project layout

```text
src/
  app/            Next.js routes, pages, and API handlers
  components/     UI and page-level components
  hooks/          Client hooks
  lib/            Fetchers, scoring, AI, jobs, blockchain, and utilities
  types/          Shared TypeScript types
scripts/          Benchmarks and autoresearch helpers
supabase/         SQL migrations
autoresearch/     Evaluation fixtures and guarded optimization workflows
docs/             Supporting documentation
```

Dashboard pages live under [src/app/(dashboard)](C:/Users/tdmne/OneDrive/Desktop/tracker_final/src/app/(dashboard)).

## Testing and verification

The project uses Vitest:

```bash
npm run test
```

There is also a lightweight benchmark CLI in [scripts/benchmark.mjs](C:/Users/tdmne/OneDrive/Desktop/tracker_final/scripts/benchmark.mjs) for measuring selected routes locally.

## Autoresearch

The repo includes a guarded autoresearch workflow for scoring and routing experiments. See [autoresearch/README.md](C:/Users/tdmne/OneDrive/Desktop/tracker_final/autoresearch/README.md) for the evaluation commands, branch expectations, and loop behavior.

## Notes for contributors

- Keep environment access centralized through the existing env setup.
- Prefer the established API and scoring modules in `src/lib` over adding parallel implementations.
- Run `npm run test` before shipping changes.
- If you touch scheduled jobs or source integrations, check the corresponding routes under `src/app/api/cron`.

## Current status

This README was refreshed to match the current repository state on March 28, 2026. It intentionally avoids brittle file counts and placeholder links so it stays useful as the project changes.
