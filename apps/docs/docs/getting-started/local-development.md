---
title: Local Development
description: Install, run, and validate the DevTrends product and docs site locally.
---

# Local Development

Use this page to get the repository running on a local machine and to understand the difference between the main app and the docs app.

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project if you want live data access or write-capable routes
- API credentials for the source integrations you actually plan to exercise

## Repository layout

The repo has two separate web applications:

- `src/` at the repository root powers the main Next.js product app
- `apps/docs/` is the Docusaurus documentation site

That split is intentional. The docs site is for stable documentation content, not interactive product functionality.

## Install dependencies

From the repository root:

```bash
npm install
```

The docs app has its own `package.json`, but the root install is the normal starting point for contributor work in this repo.

## Run the main product app

From the repository root:

```bash
npm run dev
```

The root app is configured to run at `http://127.0.0.1:3000`.

Use this when you need to work on:

- dashboard pages
- API routes
- scoring and data-driven UI behavior
- AI features
- cron flows or route handlers

## Run only the docs app

From the repository root:

```bash
npm run docs:dev
```

That starts the Docusaurus app only. It does not start the main Next.js product app.

Equivalent direct form:

```bash
cd apps/docs
npm start
```

Use this when you are writing or validating published documentation.

## Build commands

From the repository root:

```bash
npm run build
npm run docs:build
npm run docs:serve
npm run test
```

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the main Next.js app |
| `npm run docs:build` | Build the docs site and fail on broken links |
| `npm run docs:serve` | Serve the built docs site locally |
| `npm run test` | Run the Vitest suite |

## Suggested local workflow

1. Copy `.env.example` to `.env.local`
2. Fill only the keys required for the area you are working on
3. Run `npm run dev` for product work or `npm run docs:dev` for docs-only work
4. Run targeted tests while iterating
5. Run `npm run docs:build` before shipping docs changes

## Related pages

- [Environment and Integrations](./environment-and-integrations.md)
- [Database and Migrations](./database-and-migrations.md)
- [Testing and Quality](../contributor/testing-and-quality.md)
