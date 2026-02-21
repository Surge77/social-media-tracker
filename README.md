<div align="center">

# DevTrends

### The Bloomberg Terminal for Developer Career Intelligence

**Track trends · Compare technologies · Make data-driven career decisions**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%20Pro-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## The Problem

> *"Should I learn React or Vue? Is Rust worth my time? Is my stack dying? What gives me the best career ROI?"*

Developers make career-defining technology choices based on blog posts, Twitter hype, and gut feelings. DevTrends replaces opinions with **data from 45+ sources**, scored and analyzed in real time.

---

## What It Does

DevTrends aggregates data from **14 real-time APIs**, **24 RSS feeds**, and **7 industry indices** to track **101 technologies** across 8 categories. It computes composite scores, detects trends, classifies lifecycle stages, and uses **AI (Gemini Pro)** to generate actionable career insights.

**In short:** You ask "Should I learn X?" — DevTrends answers with evidence.

---

## Core Features

### 🔬 Technology Explorer
Browse 101 technologies with **composite scores (0–100)**, momentum indicators, lifecycle classifications, and sparkline trends. Three views: table, cards, and an interactive D3 bubble map. Each technology has a deep-dive detail page with score breakdowns, historical charts, raw signals from every source, anomaly detection banners, and AI-generated summaries.

### ⚖️ Comparison Engine
Side-by-side comparison of 2–4 technologies using **19 visualization components** — trend charts, radar plots, dimension heatmaps, lifecycle timelines, career scorecards, relationship maps, and an embedded AI chat that answers context-aware questions like *"Which is better for a fintech startup?"*

### 🤖 AI Intelligence Layer
Full AI subsystem powered by Gemini Pro/Flash with OpenAI fallback. Includes conversational chat, per-technology insights, comparison analysis, anomaly explanations, and auto-generated weekly digests. Built with enterprise-grade reliability: circuit breaker, rate limiting, retry with backoff, key rotation, token budget optimization, A/B testing, cost tracking, and telemetry.

### 🧪 Career Quizzes (5 Live)
| Quiz | What It Does |
|------|-------------|
| **Build My Career Roadmap** | 6-question assessment → personalized learning path with 8 role templates, milestone timelines, and AI-optimized sequencing |
| **What Should I Learn Next?** | 4-question quiz → ROI-ranked recommendations with time estimates |
| **Is My Stack Still Relevant?** | Stack health audit → Strong / Watch / Risk categories with skill gap analysis |
| **Hype or Real?** | Evaluate any trending tech → data-backed verdict with evidence |
| **Which Framework Should I Pick?** | Context-aware comparison → decision with reasoning |

### 📡 Additional Pages
- **Trending Repos** — GitHub trending with community buzz signals and rising star detection
- **Language Rankings** — Composite language popularity leaderboard
- **Weekly Digest** — AI-generated trend summaries, auto-published every Monday
- **Methodology** — Full transparency on how scores are computed

---

## Scoring System

Every technology gets a **composite score (0–100)** computed from four weighted dimensions:

| Dimension | Weight | Sources |
|-----------|--------|---------|
| **GitHub Activity** | 25% | Stars, forks, issues, contributors, commit velocity |
| **Community Buzz** | 20% | Hacker News, Reddit, Dev.to mentions & sentiment |
| **Job Market** | 25% | Adzuna, JSearch, Remotive, Arbeitnow postings |
| **Ecosystem Health** | 30% | npm/PyPI/crates downloads, SO questions, dependents |

**On top of this:**
- **Momentum score** (−100 to +100) — velocity + acceleration + anomaly detection
- **Lifecycle classification** — Emerging → Growing → Mature → Declining → Legacy
- **Bayesian confidence grades** (A+ to F) — statistical reliability of the score
- **Adaptive weights** — ML-based weight optimization per category
- **Sentiment analysis** — NLP via wink-sentiment on community discussions
- **Data completeness tracking** — percentage of sources that reported successfully

---

## Data Sources

### Real-Time APIs (14)
| Source | Metrics | Frequency |
|--------|---------|-----------|
| GitHub | Stars, forks, issues, contributors, commit velocity | Daily |
| Stack Overflow | Questions, views, answer rates | Daily |
| Hacker News | Mentions, upvotes, sentiment, top stories | Daily |
| Reddit | Posts, upvotes, comments, sentiment | Daily |
| Dev.to | Articles, reactions, comments | Daily |
| npm | Weekly downloads, dependents | Daily |
| PyPI | Downloads, metadata | Daily |
| crates.io | Downloads | Daily |
| Libraries.io | Dependents, SourceRank, release freshness | Daily |
| npms.io | Quality, popularity, maintenance scores | Daily |
| Adzuna | Job postings | Weekly |
| JSearch | Job postings | Weekly |
| Remotive | Remote job postings | Weekly |
| Arbeitnow | Job postings | Weekly |

### Extended Package Registries (4)
Packagist (PHP) · RubyGems (Ruby) · NuGet (.NET) · pub.dev (Dart/Flutter)

### RSS Feeds (24)
Tech news (TechCrunch, Ars Technica, The Verge), developer blogs (Lobste.rs, DEV.to), language newsletters (JS Weekly, Python Weekly, This Week in Rust, Go Weekly), and engineering blogs (Netflix, Uber, Airbnb, Stripe, GitHub, Cloudflare).

### Supplementary Indices (7)
GitHub Trending · TIOBE Index · State of JS · Stack Overflow Survey · RedMonk Rankings · ThoughtWorks Tech Radar · JetBrains Developer Survey

---

## Architecture

**Frontend:** Next.js 16 App Router with React 19 Server Components, TypeScript 5 (strict), Tailwind CSS 3.4, shadcn/ui, Framer Motion 12, Recharts 3, and D3.js. State management via TanStack React Query 5 with 9 custom hooks.

**Backend:** 38+ Next.js API routes handling data serving, AI endpoints, and automated pipelines. Supabase PostgreSQL with 4 core tables. Zod 4 for validation.

**AI Infrastructure:** 22 files implementing multi-provider support (Gemini Pro, Flash, OpenAI), 4 specialized generators, circuit breaker, rate limiter, retry with exponential backoff, key rotation, token budget optimizer, A/B testing engine, cost tracker, quality monitor, safety layer, conversation manager, prompt manager, feedback analyzer, and telemetry.

**Data Pipeline:** Vercel cron jobs run daily at 2 AM UTC (8 sequential batches: data fetching → intelligence enrichment → score computation) and weekly on Mondays at 3 AM UTC (job board aggregation + AI digest generation). Generates ~600 data points and 101 daily scores per run.

**Quiz Engine:** 15 files including decision engines, AI helpers, roadmap optimizer, progress tracking, timeline generation, validation logic, and 66KB of role templates covering 8 career paths.

---

## Database Schema

| Table | Description | Scale |
|-------|-------------|-------|
| `technologies` | Technology taxonomy with identifiers for every data source | 101 rows (seeded) |
| `data_points` | Raw metrics from all sources | ~600 rows/day |
| `daily_scores` | Pre-computed composite and dimension scores | 101 rows/day |
| `fetch_logs` | Pipeline execution tracking with status and timing | Operational |

Each technology row stores: slug, name, category (8 types), ecosystem, GitHub repo, npm/PyPI/crates/Packagist/RubyGems/NuGet/pub.dev package identifiers, Stack Overflow tag, subreddit, Dev.to tag, aliases, color, first appeared year, and maintainer.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | Next.js 16.1.5, React 19.1.0, TypeScript 5 |
| **Styling** | Tailwind CSS 3.4, shadcn/ui (Radix), Framer Motion 12 |
| **Visualization** | Recharts 3, D3.js 7 |
| **Database** | Supabase PostgreSQL |
| **AI** | Google Gemini Pro/Flash, OpenAI (fallback) |
| **NLP** | wink-sentiment, simple-statistics |
| **Data** | TanStack React Query 5, Zod 4, rss-parser |
| **Testing** | Vitest 4, fast-check (property-based) |
| **Typography** | Manrope (headings), JetBrains Mono (code) |
| **Deploy** | Vercel with automated cron jobs |

---

## Quick Start

```bash
git clone https://github.com/Surge77/social-media-tracker.git
cd social-media-tracker
npm install
cp .env.example .env.local
# Add your keys: SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY (minimum)
npm run dev
# → http://localhost:3000
```

<details>
<summary>All environment variables</summary>

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key

# Optional (recommended for full data)
GITHUB_TOKEN=ghp_your_token
STACKOVERFLOW_API_KEY=your-so-key
REDDIT_CLIENT_ID=your-client-id
REDDIT_CLIENT_SECRET=your-secret
ADZUNA_APP_ID=your-app-id
ADZUNA_API_KEY=your-key
RAPIDAPI_KEY=your-key
NEWSAPI_KEY=your-key
DEVTO_API_KEY=your-key
OPENAI_API_KEY=your-key
```

</details>

---

## Project Stats

| Metric | Count |
|--------|-------|
| Source files | 121 |
| React components | 122 |
| API routes | 38+ |
| Custom hooks | 9 |
| AI infrastructure files | 22 |
| Data fetcher modules | 14 |
| Scoring algorithm files | 9 |
| Quiz engine files | 15 |
| Technologies tracked | 101 |
| Categories | 8 |
| Distinct metrics | 28 |
| Data source types | 22 |
| Automated cron jobs | 3 |

---

## Roadmap

- [x] **Phase 1 — MVP:** 101 technologies, 14+ data fetchers, scoring engine, explorer UI, Supabase integration
- [x] **Phase 2 — AI:** Chat interface, AI comparisons, weekly digests, full reliability stack, multi-provider support
- [x] **Phase 3 — Career Tools:** 5 interactive quizzes, roadmap builder, trending repos, language rankings
- [ ] **Phase 4 — Polish:** Technologies page redesign, scoring improvements, AI chatbot UX, monitoring dashboard
- [ ] **Phase 5 — Scale:** User accounts, saved searches, custom alerts, public API, mobile app

---

## License

MIT

---

<div align="center">

**Built for developers who make decisions with data, not hype.**

[⭐ Star on GitHub](https://github.com/Surge77/social-media-tracker)

</div>
