# DevTrends - Developer Career Intelligence Platform

> The Bloomberg Terminal for tech trends. Track technology momentum, job market demand, and career signals with AI-powered insights.

## What It Does

DevTrends aggregates real-time data from GitHub, Hacker News, Stack Overflow, Reddit, Dev.to, RSS feeds, npm, PyPI, and job boards to produce intelligent **trend analysis** for each technology. Developers use it to:

- **Track 101+ technologies** across 8 categories with daily AI-enhanced scoring
- **Compare technologies** side-by-side with historical trend data and AI insights
- **Ask AI questions** about technology trends, career decisions, and market analysis
- **Monitor job market demand** from Adzuna, JSearch, Remotive, and Arbeitnow
- **Discover rising/falling trends** using adaptive scoring and anomaly detection
- **Get weekly AI digests** summarizing important tech ecosystem changes

## ✨ Key Features

### AI-Powered Intelligence
- **Ask AI**: Interactive chat interface for technology insights and career advice
- **Weekly Digests**: AI-generated summaries of tech trends and ecosystem changes
- **Anomaly Detection**: Automated alerts for unusual trend patterns
- **Adaptive Scoring**: Machine learning-enhanced momentum calculations

### Advanced Analytics
- **Lifecycle Analysis**: Detect emerging, mature, declining, and legacy technologies
- **Confidence Metrics**: Statistical confidence scores for all trend predictions
- **Technology Relationships**: Understand ecosystem connections and dependencies
- **Sentiment Analysis**: Real-time sentiment tracking from community discussions

### Monitoring & Insights
- **Real-time Monitoring**: Track technology health metrics and trends
- **Comparison Tools**: Deep-dive side-by-side technology comparisons with AI analysis
- **Historical Data**: Comprehensive trend visualization and pattern recognition

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.5 (App Router, React 19, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Database | Supabase (PostgreSQL + RLS) |
| AI | Gemini Pro/Flash (multi-provider support) |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Animation | Framer Motion 12.x |
| Data Fetching | TanStack React Query 5.x |
| Validation | Zod 4.x |
| Charts | Recharts 3.x |
| Sentiment | wink-sentiment |
| Statistics | simple-statistics |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your API keys (see .env.example for required keys)

# Run development server (Turbopack)
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/             # Dashboard routes
│   │   ├── ask/                # AI chat interface
│   │   ├── digest/             # Weekly AI digests
│   │   ├── monitoring/         # Technology monitoring
│   │   └── layout.tsx          # Dashboard layout
│   ├── api/
│   │   ├── ai/                 # AI endpoints (ask, compare, insight, digest)
│   │   ├── cron/               # Data fetching pipelines
│   │   └── technologies/       # Technology data APIs
│   └── globals.css             # Design tokens (HSL variables)
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── ai/                     # AI chat components
│   ├── ask/                    # Ask page components
│   ├── digest/                 # Digest components
│   ├── monitoring/             # Monitoring dashboard
│   ├── compare/                # Technology comparison
│   └── shared/                 # Shared components (badges, etc.)
│
├── lib/
│   ├── ai/                     # AI infrastructure
│   │   ├── providers/          # Multi-provider support (Gemini, OpenAI-compatible)
│   │   ├── generators/         # Specialized AI generators
│   │   ├── middleware.ts       # Rate limiting, circuit breaker, resilience
│   │   └── telemetry.ts        # AI performance monitoring
│   ├── scoring/                # Enhanced scoring algorithms
│   │   ├── adaptive-weights.ts # ML-based weight optimization
│   │   ├── confidence.ts       # Statistical confidence metrics
│   │   └── enhanced-momentum.ts# Advanced momentum calculations
│   ├── analysis/               # Data analysis
│   │   ├── lifecycle.ts        # Technology lifecycle detection
│   │   └── relationships.ts    # Ecosystem relationship mapping
│   ├── detection/              # Anomaly detection
│   └── intelligence/           # Business intelligence layer
│
├── types/
│   └── index.ts                # Core TypeScript interfaces
│
└── hooks/
    ├── useAIChat.ts            # AI chat hook
    ├── useAIComparison.ts      # AI comparison hook
    └── useAIInsight.ts         # AI insight hook
```

## Database Schema

Core tables in Supabase (PostgreSQL) with RLS enabled:

| Table | Purpose |
|-------|---------|
| `technologies` | 101-tech taxonomy with full metadata |
| `data_points` | Raw metrics from all data sources |
| `daily_scores` | Pre-computed composite scores per tech/day |
| `fetch_logs` | Operational tracking for data pipelines |

## Data Sources

- **24 RSS Feeds** - TechCrunch, HN, Lobste.rs, DEV.to, engineering blogs
- **7 Public APIs** - Hacker News, Dev.to, Remotive, Lobste.rs, Product Hunt
- **10 Package Registries** - npm, PyPI, crates.io, NuGet, pub.dev, RubyGems
- **7 Authenticated APIs** - GitHub, Stack Overflow, Reddit, NewsAPI, Adzuna, JSearch
- **7 Supplementary** - GitHub Trending, TIOBE, State of JS, RedMonk

## Environment Variables

See `.env.example` for the full template. Required keys:

```env
# Core
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (at least one required)
GEMINI_API_KEY=
OPENAI_API_KEY=

# Data Sources (optional, adds more data)
GITHUB_TOKEN=
STACKOVERFLOW_API_KEY=
NEWSAPI_KEY=
ADZUNA_APP_ID=
ADZUNA_API_KEY=
RAPIDAPI_KEY=
```

## Deployment

**Vercel (Recommended):**
1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy — cron jobs auto-configured via `vercel.json`

**Environment Variables:**
- Add all required keys in Vercel dashboard
- Ensure AI keys are properly configured
- Verify Supabase connection

## License

MIT

---

**Track trends. Make informed decisions. Advance your career with AI-powered intelligence.**
