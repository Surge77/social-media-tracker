# DevTrends - Developer Career Intelligence Platform

> The Bloomberg Terminal for tech trends. Track technology momentum, job market demand, and career signals across 68 data sources.

## What It Does

DevTrends aggregates real-time data from GitHub, Hacker News, Stack Overflow, Reddit, Dev.to, RSS feeds, npm, PyPI, and job boards to produce a single **composite trend score** for each technology. Developers use it to:

- **Track 101 technologies** across 8 categories with daily scoring
- **Compare technologies** side-by-side with historical trend data
- **Monitor job market demand** from Adzuna, JSearch, Remotive, and Arbeitnow
- **Discover rising/falling trends** using z-score normalization and momentum signals

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.5 (App Router, React 19) |
| Language | TypeScript 5 (strict mode) |
| Database | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Animation | Framer Motion 12.x |
| Data Fetching | TanStack React Query 5.x |
| Validation | Zod 4.x |
| Charts | Recharts 3.x |
| Sentiment | wink-sentiment |
| Statistics | simple-statistics |
| RSS Parsing | rss-parser |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see .env.example for full list)

# Run development server (Turbopack)
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout (Geist fonts, providers)
│   ├── providers.tsx            # Theme + transitions
│   ├── api/
│   │   └── test/route.ts       # Supabase connection test
│   └── globals.css              # Design tokens (HSL variables)
│
├── components/
│   ├── ui/                      # shadcn/ui primitives (button, badge, card)
│   ├── Header.tsx               # Sticky nav + theme toggle
│   ├── Hero.tsx                 # Hero section with floating icons
│   ├── BentoFeatures.tsx        # Feature grid with hover animations
│   ├── Footer.tsx               # Site footer
│   └── ThemeWaveTransition.tsx  # Theme switch animation
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # Server component client
│   │   ├── client.ts            # Browser client
│   │   └── admin.ts             # Service role client (bypasses RLS)
│   ├── constants/
│   │   ├── technologies.ts      # 101 technology taxonomy entries
│   │   └── data-sources.ts      # 68 data source configurations
│   └── utils.ts                 # cn() utility
│
├── types/
│   └── index.ts                 # Core TypeScript interfaces
│
└── hooks/
    └── useReducedMotion.ts      # Accessibility: reduced motion check
```

## Database Schema

4 tables in Supabase (PostgreSQL) with RLS enabled:

| Table | Purpose | Rows |
|-------|---------|------|
| `technologies` | 101-tech taxonomy with full metadata | 100 |
| `data_points` | Raw metrics from all sources | Growing |
| `daily_scores` | Pre-computed composite scores per tech/day | Growing |
| `fetch_logs` | Operational tracking for data pipelines | Growing |

## Data Sources (68 total)

- **24 RSS Feeds** - TechCrunch, HN, Lobste.rs, DEV.to, engineering blogs
- **7 Public APIs** - Hacker News, Dev.to, Remotive, Lobste.rs, Product Hunt
- **10 Package Registries** - npm, PyPI, crates.io, NuGet, pub.dev, RubyGems
- **7 Authenticated APIs** - GitHub, Stack Overflow, Reddit, NewsAPI, Adzuna, JSearch
- **7 Supplementary** - GitHub Trending, TIOBE, State of JS, RedMonk

## API Keys

See `.env.example` for the full template. Required keys:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Data Sources (add as needed)
GITHUB_TOKEN=
STACKOVERFLOW_API_KEY=
NEWSAPI_KEY=
ADZUNA_APP_ID=
ADZUNA_API_KEY=
RAPIDAPI_KEY=
```

## Documentation

| File | Description |
|------|-------------|
| [MVP_SPEC.md](MVP_SPEC.md) | Master spec — database, APIs, algorithms, build plan |
| [ALGORITHMS_AND_ML.md](ALGORITHMS_AND_ML.md) | Scoring engine, sentiment analysis, trend detection |
| [PRODUCT_STRATEGY.md](PRODUCT_STRATEGY.md) | Business model and monetization strategy |
| [BUILD_GUIDE.md](BUILD_GUIDE.md) | Phase-by-phase implementation guide |
| [CLAUDE.md](CLAUDE.md) | Project conventions and architecture reference |

## Deployment

**Vercel (Recommended):**
1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy — cron jobs auto-configured via `vercel.json`

## License

MIT

---

**Track trends. Make informed decisions. Advance your career.**
