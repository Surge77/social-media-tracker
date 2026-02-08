# DevTrends - Complete Tech Stack & Package Plan

## CURRENTLY INSTALLED

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 16.1.5 | React framework (App Router, SSR, API routes, Cron) |
| **react** | 19.1.0 | UI library |
| **react-dom** | 19.1.0 | React DOM renderer |
| **typescript** | ^5 | Type safety |

### Styling & Animation
| Package | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | ^3.4.17 | Utility-first CSS |
| **tailwindcss-animate** | ^1.0.7 | Animation utilities for Tailwind |
| **tailwind-merge** | ^2.6.1 | Smart Tailwind class merging |
| **framer-motion** | ^12.23.24 | Advanced animations & transitions |
| **autoprefixer** | ^10.4.21 | CSS vendor prefixes |
| **postcss** | ^8.5.6 | CSS processing |

### UI Components
| Package | Version | Purpose |
|---------|---------|---------|
| **shadcn/ui** | (CLI-based) | Component system (Radix + Tailwind + CVA) |
| **@radix-ui/react-slot** | ^1.2.3 | Composable component primitives |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **clsx** | ^2.1.1 | Conditional classnames |
| **lucide-react** | ^0.462.0 | Icon library |
| **next-themes** | ^0.3.0 | Dark/Light mode |

### Data & Backend
| Package | Version | Purpose |
|---------|---------|---------|
| **@supabase/supabase-js** | ^2.95.3 | Database client, auth, real-time |
| **@supabase/ssr** | ^0.8.0 | Supabase helpers for Next.js server components |
| **@tanstack/react-query** | ^5.90.20 | Data fetching, caching, background refetch |
| **zod** | ^4.3.6 | Schema validation for APIs & forms |
| **@t3-oss/env-nextjs** | ^0.13.10 | Type-safe environment variables |

### Notifications & Feedback
| Package | Version | Purpose |
|---------|---------|---------|
| **sonner** | ^2.0.7 | Toast notifications |

### Charts (Basic)
| Package | Version | Purpose |
|---------|---------|---------|
| **recharts** | ^3.7.0 | Line charts, bar charts, area charts, pie charts |

### Dev Tools
| Package | Version | Purpose |
|---------|---------|---------|
| **eslint** | ^9 | Code linting |
| **eslint-config-next** | 16.1.5 | Next.js ESLint rules |

---

## TO INSTALL - UI & Components

### Rich Content Display
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **cmdk** | Command palette (Ctrl+K search) | Quick search across technologies, jump to any page |
| **@radix-ui/react-accordion** | Collapsible sections | FAQ, expandable tech details, nested categories |
| **@radix-ui/react-tabs** | Tab navigation | Switch between "Trending", "Rising", "Declining" views |
| **@floating-ui/react** | Rich hover tooltips & popovers | Hover over tech name → see quick stats popup |
| **react-markdown** | Render markdown content | Display article summaries, tech descriptions from APIs |
| **remark-gfm** | GitHub-flavored markdown support | Tables, strikethrough, task lists in markdown |
| **react-syntax-highlighter** | Code blocks with syntax highlighting | Show trending code snippets, tech usage examples |

### Loading & Skeleton States
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **react-loading-skeleton** | Shimmer placeholder blocks | Skeleton cards, skeleton charts before API data arrives |
| **next-nprogress-bar** | Top-of-page loading bar | Page transitions feel snappy and professional |

---

## TO INSTALL - Charts & Data Visualization

### Advanced Charts (Nivo)
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **@nivo/core** | Core dependency for all nivo charts | Required base for nivo |
| **@nivo/radar** | Radar/spider charts | Skill comparison radars (React vs Vue vs Angular) |
| **@nivo/heatmap** | Heatmap grids | GitHub-style activity heatmaps, tech mentions by day/hour |
| **@nivo/bump** | Bump/ranking charts | Technology ranking changes over time (like F1 position charts) |
| **@nivo/line** | Advanced line charts | Detailed trend lines with multiple series |
| **@nivo/calendar** | Calendar heatmaps | GitHub contribution-style view of tech activity |

### Other Visualization
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **react-tagcloud** | Weighted word/tag clouds | Show trending technologies visually - bigger = more trending |
| **react-circular-progressbar** | Circular progress rings | Skill match percentage, trend strength indicators |
| **react-simple-maps** | SVG world/country maps | Geographic tech adoption ("React trending in US, Python in India") |
| **react-chrono** | Interactive timeline | Technology history, "when did Rust start trending?" |

---

## TO INSTALL - Numbers & Statistics

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **react-countup** | Animated counting numbers (0 → 45,230) | Hero stats: "12,450 technologies tracked", "89% accuracy" |
| **millify** | Large number formatting (1200 → 1.2K) | Compact GitHub stars, mention counts |
| **date-fns** | Human-readable dates ("2 hours ago") | "Last updated 3 hours ago", article timestamps |
| **numeral** | Number formatting (1000 → 1,000, +45.2%) | Percentage changes, formatted statistics |

---

## TO INSTALL - Tables & Data Grids

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **@tanstack/react-table** | Sortable, filterable, paginated tables | Technology leaderboard, job listings table |
| **react-virtuoso** | Virtualized infinite scroll (handles 100k+ items) | Long tech feeds, discussion lists without lag |

---

## TO INSTALL - Forms & Auth (When Needed)

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **react-hook-form** | Performant form library | User preferences, watchlists, tech stack selection |
| **@hookform/resolvers** | Zod integration for form validation | Validate form inputs with same zod schemas |
| **nuqs** | Type-safe URL search params | Filters, sorting, pagination synced to URL |

---

## TO INSTALL - Testing

### Unit & Integration Tests
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **vitest** | Fast unit/integration test runner | Test trend algorithms, data transformers, utility functions |
| **@testing-library/react** | Test components by user interaction | Verify dashboard renders correctly, buttons work, filters apply |
| **@testing-library/jest-dom** | Custom DOM matchers | `toBeVisible()`, `toHaveTextContent()` for cleaner assertions |
| **@vitejs/plugin-react** | React support for Vitest | Required for JSX/TSX in tests |

### End-to-End Tests
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **playwright** | Full browser automation testing | Test complete user flows: login → search tech → view trends → export |
| **@playwright/test** | Test runner for Playwright | Assertions, fixtures, parallel test execution |

### API Mocking
| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **msw** (Mock Service Worker) | Intercept & mock API requests in tests | Mock GitHub API, Hacker News API, Supabase responses without hitting real endpoints |

---

## TO INSTALL - Error Monitoring & Logging

| Package/Service | What It Does | Use Case in DevTrends | Cost |
|----------------|-------------|----------------------|------|
| **@sentry/nextjs** | Catches runtime errors in production | Stack traces, user context, error grouping. Know when your cron jobs or API routes break | Free: 5k errors/month |
| **@axiomhq/nextjs** | Structured production logging | Log API route execution, cron job results, data pipeline status. Debug issues without SSH | Free: 500MB/month |

---

## TO INSTALL - Analytics & Performance

| Package/Service | What It Does | Use Case in DevTrends | Cost |
|----------------|-------------|----------------------|------|
| **@vercel/analytics** | Page views, unique visitors, top pages | Know which technologies/pages users visit most | Free on Vercel |
| **@vercel/speed-insights** | Core Web Vitals, performance scores | Monitor if heavy charts slow down your pages | Free on Vercel |

---

## TO INSTALL - SEO & Social Sharing

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **next-sitemap** | Auto-generates sitemap.xml and robots.txt | Google indexes all your technology pages automatically |
| **@vercel/og** | Dynamic OG images at the edge | Share a tech page on Twitter/LinkedIn → auto-generated preview card with trend data |
| **schema-dts** | TypeScript types for JSON-LD structured data | Help Google understand your content (SoftwareApplication schema, etc.) |

---

## TO INSTALL - Background Jobs & Pipelines

| Package/Service | What It Does | Use Case in DevTrends | Cost |
|----------------|-------------|----------------------|------|
| **inngest** | Event-driven background job system | Multi-step data pipelines: fetch from 5 APIs → process → score → store → notify. Retry on failure, fan-out, scheduling. Way more robust than plain cron | Free: 25k runs/month |

---

## TO INSTALL - Export & Download

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **papaparse** | Parse & generate CSV files | "Export technology rankings as CSV" download button |
| **jspdf** | Generate PDF documents | Export weekly reports / dashboard snapshots as PDF |
| **html2canvas** | Screenshot DOM elements to canvas | Capture chart/dashboard sections for PDF export |

---

## TO INSTALL - Security

| Package/Tool | What It Does | Use Case in DevTrends |
|-------------|-------------|----------------------|
| **@arcjet/next** | Bot protection, rate limiting, email validation | Protect API routes from abuse, validate signup emails, block bots scraping your data | Free tier available |
| **Next.js `headers()` config** | CSP, X-Frame-Options, HSTS, Referrer-Policy | Security headers - no package needed, just next.config.ts |

---

## TO INSTALL - Database Type Safety

| Tool | What It Does | Use Case in DevTrends |
|------|-------------|----------------------|
| **supabase CLI** (`npx supabase gen types`) | Auto-generates TypeScript types from your DB schema | Full type safety on every Supabase query. Change a column → TypeScript catches all broken code instantly |

---

## TO INSTALL - Email (Later Phase)

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **resend** | Email sending API | Weekly digest emails (Free: 3000 emails/month) |
| **react-email** | Build email templates with React | Design digest emails as React components |

---

## TO INSTALL - Performance & Caching (Later Phase)

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **@upstash/redis** | Serverless Redis client | Caching expensive queries, session storage |
| **@upstash/ratelimit** | Rate limiting | Protect API routes from abuse |

---

## TO INSTALL - DX & Code Quality

| Package | What It Does | Use Case in DevTrends |
|---------|-------------|----------------------|
| **prettier** | Code formatter | Consistent code style when vibe coding fast |
| **prettier-plugin-tailwindcss** | Auto-sorts Tailwind classes | Keeps class order consistent |

---

## WHAT NOT TO INSTALL (And Why)

| Package | Why Skip |
|---------|----------|
| **Redux / Zustand** | React Query handles server state, React context handles the rest |
| **Prisma** | Supabase has its own query builder, Prisma is redundant |
| **NextAuth / Clerk** | Supabase Auth handles this for free |
| **Styled Components / Emotion** | Already using Tailwind, don't mix paradigms |
| **D3.js** | Overkill - Recharts + Nivo cover everything with less code |
| **GraphQL / Apollo** | All data sources are REST, GraphQL adds complexity for zero benefit |
| **MUI / Ant Design / Chakra** | shadcn/ui + Radix is cleaner with Next.js + Tailwind |
| **Moment.js** | Dead library, use date-fns instead |
| **Lodash** | Modern JS covers most use cases, import only if truly needed |
| **axios** | Native fetch in Next.js is sufficient |

---

## INSTALL PRIORITY ORDER

### Phase 1 - Install Now (Core Dashboard)
```bash
# Already installed:
# @supabase/supabase-js, @supabase/ssr, @tanstack/react-query, zod, recharts, sonner, @t3-oss/env-nextjs, shadcn/ui

# Charts & visualization
npm install @nivo/core @nivo/radar @nivo/heatmap @nivo/bump @nivo/line @nivo/calendar

# Numbers & stats
npm install react-countup millify date-fns numeral

# Tables & lists
npm install @tanstack/react-table react-virtuoso

# Loading states
npm install react-loading-skeleton next-nprogress-bar

# Search & navigation
npm install cmdk

# Analytics & performance (zero config on Vercel)
npm install @vercel/analytics @vercel/speed-insights

# SEO
npm install next-sitemap
```

### Phase 2 - Install When Building Features
```bash
# Rich content
npm install react-markdown remark-gfm react-syntax-highlighter @floating-ui/react

# More visualizations
npm install react-tagcloud react-circular-progressbar react-simple-maps react-chrono

# Forms & URL state
npm install react-hook-form @hookform/resolvers nuqs

# Export & download
npm install papaparse jspdf html2canvas

# Background jobs
npm install inngest

# Error monitoring
npm install @sentry/nextjs

# Logging
npm install @axiomhq/nextjs

# Security
npm install @arcjet/next

# OG images & structured data
npm install @vercel/og schema-dts

# DX
npm install -D prettier prettier-plugin-tailwindcss
```

### Phase 3 - Install When Testing & Polishing
```bash
# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
npm install -D playwright @playwright/test
npm install -D msw

# Email
npm install resend react-email

# Caching & rate limiting
npm install @upstash/redis @upstash/ratelimit
```

---

## EXTERNAL SERVICES & ACCOUNTS NEEDED

### Data Sources (APIs)
| Service | Purpose | Cost | Sign Up |
|---------|---------|------|---------|
| **Hacker News (Algolia)** | Tech discussions | Free, no key needed | No signup needed |
| **Dev.to API** | Blog post trends | Free, no key needed | No signup needed |
| **Remotive API** | Remote tech jobs | Free, no key needed | No signup needed |
| **GitHub API** | Trending repos, stars, languages | Free (5000 req/hr with token) | https://github.com/settings/tokens |
| **Stack Overflow API** | Tag trends, question volume | Free (10k req/day with key) | https://stackapps.com/apps/oauth/register |
| **Reddit API** | Community discussions | Free (OAuth app) | https://www.reddit.com/prefs/apps |
| **NewsAPI** | Tech news articles | Free dev tier (100 req/day) | https://newsapi.org/register |
| **Adzuna API** | Job listings | Free tier (250 req/month) | https://developer.adzuna.com |
| **RapidAPI (JSearch)** | Aggregated job data | Free tier (500 req/month) | https://rapidapi.com |

### Infrastructure & Services
| Service | Purpose | Cost | Sign Up |
|---------|---------|------|---------|
| **Supabase** | Database + Auth + Real-time + Storage | Free tier | https://supabase.com |
| **Vercel** | Hosting + Cron Jobs + Serverless + Analytics | Free tier | https://vercel.com |
| **Sentry** | Error monitoring & alerting | Free: 5k errors/month | https://sentry.io |
| **Axiom** | Production logging & debugging | Free: 500MB/month | https://axiom.co |
| **Inngest** | Background jobs & data pipelines | Free: 25k runs/month | https://inngest.com |
| **Arcjet** | Bot protection & rate limiting | Free tier | https://arcjet.com |
| **Upstash** | Redis caching (later) | Free tier | https://upstash.com |
| **Resend** | Email sending (later) | Free: 3000/month | https://resend.com |

---

## COMPLETE PACKAGE COUNT SUMMARY

| Category | Package Count | Status |
|----------|:------------:|--------|
| Core Framework | 4 | Installed |
| Styling & Animation | 6 | Installed |
| UI Components | 6 | Installed |
| Data & Backend | 5 | Installed |
| Notifications | 1 | Installed |
| Charts (Basic) | 1 | Installed |
| Dev Tools (Lint) | 2 | Installed |
| **Total Installed** | **25** | **Done** |
| | | |
| Advanced Charts (Nivo) | 6 | Phase 1 |
| Numbers & Statistics | 4 | Phase 1 |
| Tables & Data Grids | 2 | Phase 1 |
| Loading & Skeleton | 2 | Phase 1 |
| Search & Navigation | 1 | Phase 1 |
| Analytics & Performance | 2 | Phase 1 |
| SEO | 1 | Phase 1 |
| Rich Content Display | 7 | Phase 2 |
| More Visualizations | 4 | Phase 2 |
| Forms & URL State | 3 | Phase 2 |
| Export & Download | 3 | Phase 2 |
| Background Jobs | 1 | Phase 2 |
| Error Monitoring | 1 | Phase 2 |
| Logging | 1 | Phase 2 |
| Security | 1 | Phase 2 |
| OG Images & Schema | 2 | Phase 2 |
| DX & Code Quality | 2 | Phase 2 |
| Testing (Unit) | 4 | Phase 3 |
| Testing (E2E) | 2 | Phase 3 |
| Testing (Mocking) | 1 | Phase 3 |
| Email | 2 | Phase 3 |
| Caching & Rate Limiting | 2 | Phase 3 |
| **Total To Install** | **~54** | **Phased** |
| | | |
| **Grand Total** | **~79** | |
