# Contributing

## Before You Start

Keep changes focused. Small pull requests are easier to review, test, and revert.

Before opening work:

- Check whether the change already exists in an issue, pull request, or local branch.
- If you are changing behavior, write down the user-facing effect first.
- If you are touching scheduled jobs, ingestion, or AI routing, review the related code paths before editing.

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- A Supabase project for features that depend on persisted data
- Any external API credentials required for the area you are testing

### Install and Run

```bash
npm install
cp .env.example .env.local
```

Fill in only the variables you need for the part of the app you are working on. Then apply the SQL in `supabase/migrations` to your Supabase project and start the app:

```bash
npm run dev
```

The local dev server runs on `http://127.0.0.1:3000`.

## Development Guidelines

- Prefer existing modules in `src/lib` over parallel rewrites.
- Keep TypeScript changes explicit and easy to trace.
- Update or add tests when behavior changes.
- Do not commit secrets, populated env files, or local credential files.
- If you touch cron handlers, review the matching routes under `src/app/api/cron`.
- If you touch autoresearch logic, preserve the track boundaries in `autoresearch/manifest.json`.
- For UI changes, include screenshots or a short screen recording in the pull request when possible.

## Validation

Run the checks that match your change before opening a pull request:

```bash
npx tsc --noEmit
npm run test
npm run build
```

`npm run lint` exists, but it is not currently a required CI gate because the repository still has outstanding lint debt. Do not add new lint problems in files you touch.

## Pull Request Expectations

Each pull request should include:

- A clear summary of what changed
- The reason for the change
- Any environment, schema, or cron impacts
- Test notes that explain what you ran
- Screenshots for visible UI changes

If your change is large, split it into smaller reviewable commits or smaller pull requests.

## Review Notes

Reviewers will look for correctness first, then regression risk, test coverage, and maintainability. A change that works locally but increases operational or data risk is not ready to merge.

## Code of Conduct

Be direct, respectful, and precise. Critique the code and the reasoning, not the person.
