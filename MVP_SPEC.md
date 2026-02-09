# DevTrends MVP Specification — LOCKED & COMPREHENSIVE

> **Timeline:** 15 days
> **Scope:** Data-only, read-only, no authentication (MVP Scope A)
> **Status:** FINAL — every decision is made. Zero ambiguity. Just build.
>
> **Supabase Project ID:** `bbjltwrgguiogpiqqgze`
> **Supabase URL:** `https://bbjltwrgguiogpiqqgze.supabase.co`

---

## TABLE OF CONTENTS

1. [Hard Rules & Constraints](#1-hard-rules--constraints)
2. [Packages — Exact Install Commands](#2-packages--exact-install-commands)
3. [Database Schema — Complete SQL](#3-database-schema--complete-sql)
4. [Technology Taxonomy — All 100 Entries](#4-technology-taxonomy--all-100-entries)
5. [Data Fetchers — Exact API Calls](#5-data-fetchers--exact-api-calls)
6. [Scoring Engine — Exact Formulas](#6-scoring-engine--exact-formulas)
7. [Sentiment Analysis — Exact Implementation](#7-sentiment-analysis--exact-implementation)
8. [API Routes — Request/Response Shapes](#8-api-routes--requestresponse-shapes)
9. [Cron Jobs — Exact Configuration](#9-cron-jobs--exact-configuration)
10. [Pages — Exact Specifications](#10-pages--exact-specifications)
11. [Components — Props & Behavior](#11-components--props--behavior)
12. [TypeScript Types — Complete Definitions](#12-typescript-types--complete-definitions)
13. [Supabase Client Setup — Exact Code](#13-supabase-client-setup--exact-code)
14. [File Structure — Every File](#14-file-structure--every-file)
15. [Error Handling — Exact Strategy](#15-error-handling--exact-strategy)
16. [15-Day Build Plan — Day by Day](#16-15-day-build-plan--day-by-day)

---

## 1. HARD RULES & CONSTRAINTS

### What This MVP Is
- A **public, read-only** data dashboard. No user accounts, no login, no personalization.
- All data is fetched by **server-side cron jobs**, stored in **Supabase PostgreSQL**, and served to the frontend via **Next.js API routes** or **Server Components reading Supabase directly**.
- The **frontend NEVER calls external APIs** (GitHub, HN, etc.) directly. It only reads from Supabase.

### Technology Constraints
- **Language:** TypeScript only. No Python anywhere. No Python microservices, no Python scripts, no Python Lambda functions.
- **Runtime:** Node.js (via Next.js on Vercel). All algorithms implemented in TypeScript using native math or the 3 npm packages listed below.
- **Why no Python:** Every algorithm needed for MVP (z-score, weighted average, moving average, ROC, Bayesian smoothing, VADER sentiment) has JavaScript implementations or is simple enough to write in <50 lines of TypeScript. Python would add infrastructure complexity (separate service, separate deploy, cross-service communication) for zero benefit at this stage.
- **Database:** Supabase PostgreSQL only. No Redis, no separate caching layer, no Upstash. Supabase IS the cache — cron jobs write to it, frontend reads from it.
- **Charts:** Recharts 3.x only. Do NOT install Nivo, D3, Chart.js, or any other charting library. Recharts covers line charts, area charts, bar charts, sparklines, and radar charts — everything needed.
- **State Management:** React Query only (already installed as `@tanstack/react-query`). No Zustand, no Redux, no React Context for data. React Query handles server state. The only React state is local UI state (filter text, selected tab, etc.) using `useState`.
- **Styling:** Tailwind CSS + shadcn/ui only. No CSS Modules, no styled-components, no Emotion. Follow existing patterns in the codebase.
- **Animations:** Framer Motion only. Always check `useReducedMotion()` before applying animations. Follow the pattern already established in `Hero.tsx` and `BentoFeatures.tsx`.
- **Authentication:** None. Zero auth code. No Supabase Auth, no middleware checking sessions, no protected routes. Every page and API route is public.
- **Testing:** None for MVP. No Vitest, no Playwright, no Jest. Write testable pure functions so tests can be added later, but do not write test files.
- **Deployment:** Vercel free/hobby plan. This means: max 2 cron jobs, max 60s serverless function timeout, 100GB bandwidth/month.

### Code Conventions (carry forward from existing codebase)
- `'use client'` only on components that use hooks, event handlers, browser APIs, or Framer Motion.
- Server Components by default. Keep client boundaries as small as possible.
- All imports use `@/` path alias (maps to `./src/*`). Never use relative paths across directories.
- Component files: PascalCase (`TechTable.tsx`). Utility files: camelCase (`normalize.ts`). Hook files: camelCase with `use` prefix (`useTechnologies.ts`).
- `forwardRef` for all reusable UI components. `displayName` set on all components.
- `cn()` from `@/lib/utils` for all conditional class merging.

---

## 2. PACKAGES — EXACT INSTALL COMMANDS

### New packages to install (3 total):
```bash
npm install rss-parser wink-sentiment simple-statistics
```

| Package | Version | What It Does | Why This One |
|---------|---------|-------------|-------------|
| `rss-parser` | ^3.13.0 | Parses RSS/Atom XML feeds into JS objects | Most popular RSS parser on npm, 1.2M weekly downloads, TypeScript support, works in Node.js |
| `wink-sentiment` | ^6.0.0 | Lexicon-based sentiment analysis, returns score -5 to +5 per text | Better maintained than `vader-sentiment` (last updated 2024 vs 2020). Returns numeric score + array of positive/negative words. Works on short text (titles, headlines). |
| `simple-statistics` | ^7.8.0 | z-score, standard deviation, mean, median, percentiles, linear regression | 3M weekly downloads, zero dependencies, used by Mapbox in production. Covers all statistical functions needed. |

### Why NOT these alternatives:
| Rejected Package | Why Rejected |
|-----------------|-------------|
| `vader-sentiment` | Last updated 4 years ago (2020). Unmaintained. `wink-sentiment` is actively maintained and has comparable accuracy. |
| `natural` | NLP kitchen-sink library (tokenizer, stemmer, classifier, etc.). We only need sentiment. Too heavy for our use case. |
| `@xenova/transformers` | Runs ONNX ML models in JS. Can do inference but adds ~200MB to dependencies. Overkill for MVP where lexicon-based sentiment is sufficient. |
| `ml.js` | ML algorithm collection. We don't need ML algorithms — we need statistics (z-score, std dev). `simple-statistics` is lighter and more focused. |
| `prophet` (npm) | Was a Python wrapper, now dead. No native JS forecasting library exists that matches Python's Prophet. Not needed for MVP anyway — we use simple moving averages and ROC. |
| `nivo` | Heavy charting library with many dependencies. Recharts (already installed) covers all chart types needed. |
| `d3` | Low-level visualization library. Recharts is built on D3 internally. No need to use D3 directly. |

### Already installed (from package.json, do NOT reinstall):
```
@supabase/supabase-js@2.95.3   — Supabase client
@supabase/ssr@0.8.0             — Supabase SSR helpers (server/client)
@tanstack/react-query@5.90.20   — Data fetching & caching hooks
zod@4.3.6                       — Runtime validation
recharts@3.7.0                  — Charts
sonner@2.0.7                    — Toast notifications
framer-motion@12.23.24          — Animations
lucide-react@0.462.0            — Icons
next-themes@0.3.0               — Theme switching
class-variance-authority@0.7.1  — Component variant styling
clsx@2.1.1                      — Class name utility
tailwind-merge@2.6.1            — Tailwind class deduplication
```

---

## 3. DATABASE SCHEMA — COMPLETE SQL

Run this as a single Supabase migration. All 4 tables, all indexes, all constraints.

### Table 1: `technologies`
```sql
-- The core taxonomy. 100 rows, seeded once, rarely updated.
CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'language', 'frontend', 'backend', 'database',
    'devops', 'cloud', 'mobile', 'ai_ml'
  )),
  ecosystem TEXT,          -- "javascript", "python", "rust", "java", "dotnet", "go", "ruby", "php", "dart", "elixir", "multi", NULL
  website_url TEXT,
  github_repo TEXT,        -- "facebook/react" format (owner/repo)
  npm_package TEXT,        -- Primary npm package name, NULL if not JS
  pypi_package TEXT,       -- Primary PyPI package name, NULL if not Python
  crates_package TEXT,     -- Primary crates.io package name, NULL if not Rust
  stackoverflow_tag TEXT NOT NULL,  -- Every technology MUST have an SO tag
  subreddit TEXT,          -- Without "r/" prefix. NULL if no dedicated subreddit
  devto_tag TEXT,          -- Dev.to tag name. NULL if none
  aliases TEXT[] DEFAULT '{}',
  color TEXT NOT NULL,     -- Hex color for charts: "#61DAFB" for React
  first_appeared INT,      -- Year
  maintained_by TEXT,      -- "Meta", "Google", "Community", "Microsoft", etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_technologies_slug ON technologies(slug);
CREATE INDEX idx_technologies_category ON technologies(category);
CREATE INDEX idx_technologies_ecosystem ON technologies(ecosystem);
```

### Table 2: `data_points`
```sql
-- Raw data from all sources. Grows daily. This is the source of truth.
-- Expected volume: ~100 techs × ~6 metrics × 1 day = ~600 rows/day = ~18,000 rows/month.
CREATE TABLE data_points (
  id BIGSERIAL PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN (
    'github', 'hackernews', 'stackoverflow', 'npm', 'pypi', 'crates',
    'reddit', 'devto', 'adzuna', 'jsearch', 'remotive', 'arbeitnow',
    'newsapi', 'rss'
  )),
  metric TEXT NOT NULL CHECK (metric IN (
    'stars', 'forks', 'open_issues', 'contributors', 'watchers',
    'mentions', 'upvotes', 'comments', 'sentiment',
    'questions', 'answer_rate', 'views',
    'downloads', 'dependents',
    'job_postings', 'articles', 'posts'
  )),
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  measured_at DATE NOT NULL,        -- DATE not TIMESTAMPTZ — we aggregate per day
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dp_tech_source ON data_points(technology_id, source, measured_at DESC);
CREATE INDEX idx_dp_tech_metric ON data_points(technology_id, metric, measured_at DESC);
CREATE INDEX idx_dp_measured ON data_points(measured_at DESC);

-- Prevent duplicate data points for same tech+source+metric+date
CREATE UNIQUE INDEX idx_dp_unique ON data_points(technology_id, source, metric, measured_at);
```

### Table 3: `daily_scores`
```sql
-- Pre-computed scores. One row per technology per day.
-- Frontend reads from this table for fast display. Never computes scores client-side.
CREATE TABLE daily_scores (
  id BIGSERIAL PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  score_date DATE NOT NULL,
  composite_score NUMERIC(5,2) NOT NULL DEFAULT 0,  -- 0.00 to 100.00
  github_score NUMERIC(5,2) DEFAULT 0,
  community_score NUMERIC(5,2) DEFAULT 0,
  jobs_score NUMERIC(5,2) DEFAULT 0,
  ecosystem_score NUMERIC(5,2) DEFAULT 0,
  momentum NUMERIC(6,2) DEFAULT 0,             -- -100.00 to +100.00
  data_completeness NUMERIC(3,2) DEFAULT 0,    -- 0.00 to 1.00
  raw_sub_scores JSONB DEFAULT '{}',           -- Full breakdown for detail page
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(technology_id, score_date)
);

CREATE INDEX idx_ds_date ON daily_scores(score_date DESC);
CREATE INDEX idx_ds_tech_date ON daily_scores(technology_id, score_date DESC);
CREATE INDEX idx_ds_composite ON daily_scores(score_date DESC, composite_score DESC);
```

### Table 4: `fetch_logs`
```sql
-- Operational tracking. When did each source last run? Did it succeed?
CREATE TABLE fetch_logs (
  id BIGSERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  technologies_processed INT DEFAULT 0,
  data_points_created INT DEFAULT 0,
  error_message TEXT,
  duration_ms INT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_fl_source_time ON fetch_logs(source, started_at DESC);
```

### Row Level Security
```sql
-- RLS is OFF for MVP (no auth). All tables are publicly readable.
-- Cron jobs use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS anyway.
-- When adding auth later, enable RLS and add policies.
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (anonymous users can read)
CREATE POLICY "Public read access" ON technologies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON data_points FOR SELECT USING (true);
CREATE POLICY "Public read access" ON daily_scores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON fetch_logs FOR SELECT USING (true);

-- Service role can do everything (for cron jobs)
CREATE POLICY "Service role full access" ON technologies FOR ALL USING (true);
CREATE POLICY "Service role full access" ON data_points FOR ALL USING (true);
CREATE POLICY "Service role full access" ON daily_scores FOR ALL USING (true);
CREATE POLICY "Service role full access" ON fetch_logs FOR ALL USING (true);
```

---

## 4. TECHNOLOGY TAXONOMY — ALL 100 ENTRIES

Every technology with its exact slug, SO tag, GitHub repo, package name, subreddit, Dev.to tag, and chart color. This is the seed data for the `technologies` table.

### Languages (20)
| slug | name | stackoverflow_tag | github_repo | npm_package | pypi_package | crates_package | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-------------|-------------|---------------|-----------|-----------|-------|
| javascript | JavaScript | javascript | — | — | — | — | javascript | javascript | #F7DF1E |
| typescript | TypeScript | typescript | microsoft/TypeScript | typescript | — | — | typescript | typescript | #3178C6 |
| python | Python | python | python/cpython | — | — | — | python | python | #3776AB |
| rust | Rust | rust | rust-lang/rust | — | — | — | rust | rust | #DEA584 |
| go | Go | go | golang/go | — | — | — | golang | go | #00ADD8 |
| java | Java | java | openjdk/jdk | — | — | — | java | java | #ED8B00 |
| csharp | C# | c%23 | dotnet/csharplang | — | — | — | csharp | csharp | #512BD4 |
| cpp | C++ | c%2B%2B | — | — | — | — | cpp | cpp | #00599C |
| c | C | c | — | — | — | — | C_Programming | c | #A8B9CC |
| swift | Swift | swift | swiftlang/swift | — | — | — | swift | swift | #F05138 |
| kotlin | Kotlin | kotlin | JetBrains/kotlin | — | — | — | Kotlin | kotlin | #7F52FF |
| ruby | Ruby | ruby | ruby/ruby | — | — | — | ruby | ruby | #CC342D |
| php | PHP | php | php/php-src | — | — | — | PHP | php | #777BB4 |
| dart | Dart | dart | dart-lang/sdk | — | — | — | dartlang | dart | #0175C2 |
| elixir | Elixir | elixir | elixir-lang/elixir | — | — | — | elixir | elixir | #6E4A7E |
| scala | Scala | scala | scala/scala | — | — | — | scala | scala | #DC322F |
| zig | Zig | zig | ziglang/zig | — | — | — | Zig | zig | #F7A41D |
| lua | Lua | lua | lua/lua | — | — | — | lua | lua | #000080 |
| r | R | r | — | — | — | — | rlanguage | r | #276DC3 |
| haskell | Haskell | haskell | ghc/ghc | — | — | — | haskell | haskell | #5D4F85 |

### Frontend Frameworks (15)
| slug | name | stackoverflow_tag | github_repo | npm_package | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-------------|-----------|-----------|-------|
| react | React | reactjs | facebook/react | react | reactjs | react | #61DAFB |
| vue | Vue.js | vue.js | vuejs/core | vue | vuejs | vue | #4FC08D |
| angular | Angular | angular | angular/angular | @angular/core | angular | angular | #DD0031 |
| svelte | Svelte | svelte | sveltejs/svelte | svelte | sveltejs | svelte | #FF3E00 |
| nextjs | Next.js | next.js | vercel/next.js | next | nextjs | nextjs | #000000 |
| nuxt | Nuxt | nuxt.js | nuxt/nuxt | nuxt | nuxt | nuxt | #00DC82 |
| remix | Remix | remix | remix-run/remix | @remix-run/react | remix_run | remix | #121212 |
| astro | Astro | astro | withastro/astro | astro | astro | astro | #FF5D01 |
| solidjs | Solid.js | solidjs | solidjs/solid | solid-js | solidjs | solidjs | #2C4F7C |
| qwik | Qwik | qwik | QwikDev/qwik | @builder.io/qwik | qwik | qwik | #18B6F6 |
| htmx | htmx | htmx | bigskysoftware/htmx | htmx.org | htmx | htmx | #3366CC |
| tailwindcss | Tailwind CSS | tailwind-css | tailwindlabs/tailwindcss | tailwindcss | tailwindcss | tailwindcss | #06B6D4 |
| bootstrap | Bootstrap | bootstrap | twbs/bootstrap | bootstrap | bootstrap | bootstrap | #7952B3 |
| jquery | jQuery | jquery | jquery/jquery | jquery | jquery | jquery | #0769AD |
| lit | Lit | lit | lit/lit | lit | — | lit | #324FFF |

### Backend Frameworks (15)
| slug | name | stackoverflow_tag | github_repo | npm_package | pypi_package | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-------------|-------------|-----------|-----------|-------|
| nodejs | Node.js | node.js | nodejs/node | — | — | node | node | #339933 |
| express | Express | express | expressjs/express | express | — | expressjs | express | #000000 |
| fastify | Fastify | fastify | fastify/fastify | fastify | — | — | fastify | #000000 |
| django | Django | django | django/django | — | django | django | django | #092E20 |
| flask | Flask | flask | pallets/flask | — | flask | flask | flask | #000000 |
| fastapi | FastAPI | fastapi | fastapi/fastapi | — | fastapi | fastapi | fastapi | #009688 |
| spring-boot | Spring Boot | spring-boot | spring-projects/spring-boot | — | — | SpringBoot | springboot | #6DB33F |
| dotnet | ASP.NET Core | asp.net-core | dotnet/aspnetcore | — | — | dotnet | dotnet | #512BD4 |
| rails | Ruby on Rails | ruby-on-rails | rails/rails | — | — | rails | rails | #CC0000 |
| laravel | Laravel | laravel | laravel/laravel | — | — | laravel | laravel | #FF2D20 |
| phoenix | Phoenix | phoenix-framework | phoenixframework/phoenix | — | — | elixir | phoenix | #FD4F00 |
| gin | Gin | go-gin | gin-gonic/gin | — | — | golang | gin | #00ADD8 |
| fiber | Fiber | gofiber | gofiber/fiber | — | — | golang | fiber | #00ACD7 |
| nestjs | NestJS | nestjs | nestjs/nest | @nestjs/core | — | nestjs | nestjs | #E0234E |
| hono | Hono | hono | honojs/hono | hono | — | — | hono | #FF6600 |

### Databases (15)
| slug | name | stackoverflow_tag | github_repo | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-----------|-----------|-------|
| postgresql | PostgreSQL | postgresql | postgres/postgres | postgresql | postgres | #4169E1 |
| mysql | MySQL | mysql | mysql/mysql-server | mysql | mysql | #4479A1 |
| mongodb | MongoDB | mongodb | mongodb/mongo | mongodb | mongodb | #47A248 |
| redis | Redis | redis | redis/redis | redis | redis | #DC382D |
| sqlite | SQLite | sqlite | sqlite/sqlite | sqlite | sqlite | #003B57 |
| cassandra | Cassandra | cassandra | apache/cassandra | cassandra | cassandra | #1287B1 |
| dynamodb | DynamoDB | amazon-dynamodb | — | aws | dynamodb | #4053D6 |
| supabase | Supabase | supabase | supabase/supabase | supabase | supabase | #3FCF8E |
| planetscale | PlanetScale | planetscale | — | planetscale | planetscale | #000000 |
| neon | Neon | neon-database | neondatabase/neon | neon | neon | #00E699 |
| turso | Turso | turso | tursodatabase/libsql | turso | turso | #4FF8D2 |
| elasticsearch | Elasticsearch | elasticsearch | elastic/elasticsearch | elasticsearch | elasticsearch | #005571 |
| clickhouse | ClickHouse | clickhouse | ClickHouse/ClickHouse | clickhouse | clickhouse | #FFCC00 |
| neo4j | Neo4j | neo4j | neo4j/neo4j | neo4j | neo4j | #008CC1 |
| dragonfly | Dragonfly | dragonfly | dragonflydb/dragonfly | dragonfly | dragonfly | #24292E |

### DevOps (10)
| slug | name | stackoverflow_tag | github_repo | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-----------|-----------|-------|
| docker | Docker | docker | moby/moby | docker | docker | #2496ED |
| kubernetes | Kubernetes | kubernetes | kubernetes/kubernetes | kubernetes | kubernetes | #326CE5 |
| terraform | Terraform | terraform | hashicorp/terraform | Terraform | terraform | #7B42BC |
| github-actions | GitHub Actions | github-actions | — | github | githubactions | #2088FF |
| jenkins | Jenkins | jenkins | jenkinsci/jenkins | jenkins | jenkins | #D24939 |
| ansible | Ansible | ansible | ansible/ansible | ansible | ansible | #EE0000 |
| prometheus | Prometheus | prometheus | prometheus/prometheus | PrometheusMonitoring | prometheus | #E6522C |
| grafana | Grafana | grafana | grafana/grafana | grafana | grafana | #F46800 |
| nginx | Nginx | nginx | nginx/nginx | nginx | nginx | #009639 |
| pulumi | Pulumi | pulumi | pulumi/pulumi | pulumi | pulumi | #8A3391 |

### Cloud & Platforms (10)
| slug | name | stackoverflow_tag | github_repo | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-----------|-----------|-------|
| aws | AWS | amazon-web-services | — | aws | aws | #FF9900 |
| gcp | Google Cloud | google-cloud-platform | — | googlecloud | googlecloud | #4285F4 |
| azure | Azure | azure | — | AZURE | azure | #0078D4 |
| vercel | Vercel | vercel | vercel/vercel | vercel | vercel | #000000 |
| netlify | Netlify | netlify | — | netlify | netlify | #00C7B7 |
| cloudflare-workers | Cloudflare Workers | cloudflare-workers | cloudflare/workers-sdk | CloudFlare | cloudflare | #F38020 |
| fly-io | Fly.io | flyio | — | flyio | flyio | #7B3BE2 |
| railway | Railway | railway | — | railway | railway | #0B0D0E |
| render | Render | render | — | render | render | #46E3B7 |
| digitalocean | DigitalOcean | digitalocean | — | digital_ocean | digitalocean | #0080FF |

### Mobile (8)
| slug | name | stackoverflow_tag | github_repo | npm_package | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-------------|-----------|-----------|-------|
| react-native | React Native | react-native | facebook/react-native | react-native | reactnative | reactnative | #61DAFB |
| flutter | Flutter | flutter | flutter/flutter | — | FlutterDev | flutter | #02569B |
| swiftui | SwiftUI | swiftui | — | — | SwiftUI | swiftui | #F05138 |
| jetpack-compose | Jetpack Compose | jetpack-compose | — | — | JetpackCompose | jetpackcompose | #4285F4 |
| expo | Expo | expo | expo/expo | expo | expo | expo | #000020 |
| capacitor | Capacitor | capacitor | ionic-team/capacitor | @capacitor/core | — | capacitor | #53B9FF |
| tauri | Tauri | tauri | tauri-apps/tauri | @tauri-apps/api | tauri | tauri | #FFC131 |
| electron | Electron | electron | electron/electron | electron | electronjs | electron | #47848F |

### AI/ML (7)
| slug | name | stackoverflow_tag | github_repo | npm_package | pypi_package | subreddit | devto_tag | color |
|------|------|-------------------|-------------|-------------|-------------|-----------|-----------|-------|
| tensorflow | TensorFlow | tensorflow | tensorflow/tensorflow | — | tensorflow | tensorflow | tensorflow | #FF6F00 |
| pytorch | PyTorch | pytorch | pytorch/pytorch | — | torch | pytorch | pytorch | #EE4C2C |
| langchain | LangChain | langchain | langchain-ai/langchain | langchain | langchain | LangChain | langchain | #1C3C3C |
| huggingface | Hugging Face | huggingface-transformers | huggingface/transformers | — | transformers | — | huggingface | #FFD21E |
| openai-api | OpenAI API | openai-api | openai/openai-python | openai | openai | OpenAI | openai | #412991 |
| ollama | Ollama | ollama | ollama/ollama | ollama | ollama | ollama | ollama | #000000 |
| scikit-learn | scikit-learn | scikit-learn | scikit-learn/scikit-learn | — | scikit-learn | — | scikitlearn | #F7931E |

---

## 5. DATA FETCHERS — EXACT API CALLS

Each fetcher is a pure function: `(technologies: Technology[]) → DataPoint[]`. It fetches from the external API and returns normalized data points ready for Supabase insertion.

### 5.1 GitHub Fetcher (`src/lib/api/github.ts`)

**What to fetch per technology** (only for technologies where `github_repo` is not NULL):
```
GET https://api.github.com/repos/{owner}/{repo}
Headers: {
  "Authorization": "Bearer {GITHUB_TOKEN}",
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
}
```

**Extract these fields from the response:**
| Response Field | data_points metric | data_points value |
|---------------|-------------------|-------------------|
| `stargazers_count` | `stars` | The number |
| `forks_count` | `forks` | The number |
| `open_issues_count` | `open_issues` | The number |
| `watchers_count` | `watchers` | The number |
| `subscribers_count` | `watchers` | Use this instead if different from watchers_count |

**Rate limiting:** With the GITHUB_TOKEN, you get 5,000 requests/hour. 100 technologies = 100 requests = trivial. Add a 100ms delay between requests to be polite.

**Error handling per request:** If a repo returns 404 (deleted/renamed) or 403 (rate limited), log the error, skip that technology, continue to the next. Do NOT throw — one failed repo should not stop the entire fetch.

### 5.2 Hacker News Fetcher (`src/lib/api/hackernews.ts`)

**What to fetch per technology:**
```
GET https://hn.algolia.com/api/v1/search?query="{technology_name}"&tags=story&numericFilters=created_at_i>{30_days_ago_unix_timestamp}&hitsPerPage=100
```

Use the technology's `name` field for the query (e.g., "React", "Rust"). For ambiguous names (C, R, Go), append context: "Go programming", "R language", "C programming".

**Extract these fields:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| `nbHits` (total matching stories) | `mentions` | The number |
| Average of all hit `points` | `upvotes` | Average |
| Average of all hit `num_comments` | `comments` | Average |
| Run wink-sentiment on each hit `title`, average the scores | `sentiment` | Average score (-5 to +5, normalize to 0-1 by doing `(score + 5) / 10`) |

**Store in metadata JSONB:** `{ "top_stories": [{ "title": "...", "url": "...", "points": N }] }` — keep top 5 stories for display on detail page.

### 5.3 Stack Overflow Fetcher (`src/lib/api/stackoverflow.ts`)

**What to fetch per technology** (every technology has a `stackoverflow_tag`):
```
GET https://api.stackexchange.com/2.3/tags/{tag}/info?site=stackoverflow&key={STACKOVERFLOW_API_KEY}
```

Also fetch recent question count:
```
GET https://api.stackexchange.com/2.3/search/advanced?tagged={tag}&site=stackoverflow&sort=creation&order=desc&fromdate={30_days_ago_unix}&key={STACKOVERFLOW_API_KEY}&filter=total
```

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Tag `count` from /tags/{tag}/info | `questions` | Total question count (all-time, for context) |
| `total` from /search/advanced (last 30 days) | `mentions` | Questions in last 30 days |

**Note on URL encoding:** Some SO tags have special characters: `c%23` for C#, `c%2B%2B` for C++. Use `encodeURIComponent()` on the tag before inserting into the URL.

**Rate limiting:** 10,000/day with key. 100 technologies × 2 calls = 200 requests. Fine.

### 5.4 npm Download Fetcher (`src/lib/api/packages.ts`)

**Only for technologies where `npm_package` is not NULL** (~35 technologies).

```
GET https://api.npmjs.org/downloads/point/last-week/{package_name}
```

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| `downloads` | `downloads` | Weekly download count |

Also fetch last-month for growth calculation:
```
GET https://api.npmjs.org/downloads/point/last-month/{package_name}
```

**No authentication needed. No rate limit.**

### 5.5 PyPI Download Fetcher (in same `packages.ts`)

**Only for technologies where `pypi_package` is not NULL** (~10 technologies).

```
GET https://pypistats.org/api/packages/{package_name}/recent
Headers: { "Accept": "application/json" }
```

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| `data.last_week` | `downloads` | Weekly download count |

### 5.6 crates.io Download Fetcher (in same `packages.ts`)

**Only for technologies where `crates_package` is not NULL** (~1-2 technologies).

```
GET https://crates.io/api/v1/crates/{crate_name}
Headers: { "User-Agent": "DevTrends/1.0 (https://devtrends.dev)" }
```

crates.io REQUIRES a User-Agent header or it returns 403.

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| `crate.downloads` | `downloads` | Total downloads (compute weekly by diffing with previous day) |
| `crate.recent_downloads` | `downloads` | Recent downloads (if available) |

### 5.7 Dev.to Fetcher (`src/lib/api/devto.ts`)

**For technologies that have a `devto_tag`:**
```
GET https://dev.to/api/articles?tag={devto_tag}&top=30&per_page=100
Headers: { "api-key": "{DEVTO_API_KEY}" }   // optional, works without
```

`top=30` means "top articles from last 30 days".

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Number of articles returned | `articles` | Count |
| Sum of `positive_reactions_count` across all articles | `upvotes` | Total reactions |
| Sum of `comments_count` | `comments` | Total comments |

**Rate limiting:** 30 requests per 30 seconds. With ~85 technologies having devto_tags, add a 1-second delay between requests.

### 5.8 Reddit Fetcher (`src/lib/api/reddit.ts`)

**Only if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are set.** If not set, skip Reddit entirely — don't crash.

**Authentication flow:**
```
POST https://www.reddit.com/api/v1/access_token
Headers: {
  "Authorization": "Basic " + base64(REDDIT_CLIENT_ID + ":" + REDDIT_CLIENT_SECRET),
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "{REDDIT_USER_AGENT}"
}
Body: "grant_type=client_credentials"
```
Returns `{ "access_token": "...", "expires_in": 86400 }`. Cache this token for the session.

**For technologies that have a `subreddit`:**
```
GET https://oauth.reddit.com/r/{subreddit}/top?t=month&limit=100
Headers: {
  "Authorization": "Bearer {access_token}",
  "User-Agent": "{REDDIT_USER_AGENT}"
}
```

**Extract:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Number of posts returned | `posts` | Count |
| Average `score` (upvotes) across posts | `upvotes` | Average |
| Average `num_comments` | `comments` | Average |
| Run wink-sentiment on each post `title`, average | `sentiment` | Normalized 0-1 |

**For technologies WITHOUT a dedicated subreddit**, search in r/programming:
```
GET https://oauth.reddit.com/r/programming/search?q={technology_name}&t=month&limit=25&restrict_sr=on
```

### 5.9 Job Market Fetcher (`src/lib/api/jobs.ts`)

**Adzuna** (only on weekly cron):
```
GET https://api.adzuna.com/v1/api/jobs/us/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_API_KEY}&what={technology_name}&content-type=application/json
```

Use **broad category queries** to conserve the 250/month limit:
- Query 1: "react OR vue OR angular OR svelte frontend developer"
- Query 2: "python OR django OR fastapi backend developer"
- Query 3: "rust OR go OR java backend developer"
- Query 4: "devops kubernetes docker terraform"
- Query 5: "machine learning tensorflow pytorch"

Parse results and attribute job counts to individual technologies by checking which technology names appear in each job's `title` + `description`.

**Extract per technology:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Number of jobs mentioning this technology | `job_postings` | Count |

**Remotive** (weekly cron, no auth):
```
GET https://remotive.com/api/remote-jobs?category=software-dev&limit=100
```

Same approach: parse all jobs, count mentions of each technology in title + description.

**JSearch** (weekly cron):
```
GET https://jsearch.p.rapidapi.com/search?query={technology_name}+developer&num_pages=1
Headers: {
  "X-RapidAPI-Key": "{RAPIDAPI_KEY}",
  "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}
```

Use same broad query strategy as Adzuna to conserve 500/month limit.

### 5.10 RSS Feed Parser (`src/lib/api/rss.ts`)

```typescript
import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,       // 10 second timeout per feed
  maxRedirects: 3,
  headers: {
    'User-Agent': 'DevTrends/1.0',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
})
```

**For each RSS feed** (from `src/lib/constants/data-sources.ts`):
1. Parse the feed
2. For each item in the feed (title + description/content):
   - Run each item's text against the technology alias dictionary
   - If a technology is mentioned, create a data point
3. Run wink-sentiment on the title

**Extract per technology per feed:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Number of articles mentioning this technology | `mentions` | Count |
| Average sentiment of mentioning articles | `sentiment` | Normalized 0-1 |

**RSS feeds to parse** (from data-sources.ts, pick the highest-signal ones for MVP):
- Hacker News Best (`hnrss.org/best`)
- Lobste.rs (`lobste.rs/rss`)
- Dev.to (`dev.to/feed`)
- JavaScript Weekly, Node Weekly, React Status, Golang Weekly, This Week in Rust, Python Weekly
- TechCrunch, Ars Technica

That's ~15 feeds. Skip company engineering blogs and lower-signal feeds for MVP.

### 5.11 NewsAPI Fetcher (`src/lib/api/news.ts`)

**Weekly cron only** (100 req/day limit):
```
GET https://newsapi.org/v2/everything?q={technology_name}&language=en&sortBy=relevancy&pageSize=20&apiKey={NEWSAPI_KEY}
```

Use broad category queries (5-6 queries, not 100):
- "react vue angular svelte frontend framework"
- "python django fastapi machine learning"
- "rust go java backend developer"
- "docker kubernetes devops cloud"
- "AI artificial intelligence LLM GPT"

**Extract per technology:**
| What | data_points metric | data_points value |
|------|-------------------|-------------------|
| Articles mentioning technology | `articles` | Count |
| Average sentiment of titles | `sentiment` | Normalized 0-1 |

---

## 6. SCORING ENGINE — EXACT FORMULAS

### Location: `src/lib/scoring/`

All scoring functions are **pure functions** — they take data, return numbers. No side effects, no database calls inside them. The cron job fetches data, passes it to scoring functions, and writes results.

### 6.1 Normalization (`normalize.ts`)

```typescript
import { zScore, mean, standardDeviation } from 'simple-statistics'

/**
 * Z-score normalize an array of values.
 * Returns z-scores where 0 = average, +1 = one std dev above, etc.
 * Clamps output to [-3, +3] to prevent outlier distortion.
 */
export function zScoreNormalize(values: number[]): number[] {
  const m = mean(values)
  const sd = standardDeviation(values)
  if (sd === 0) return values.map(() => 0) // all same value
  return values.map(v => Math.max(-3, Math.min(3, (v - m) / sd)))
}

/**
 * Convert z-scores to 0-100 scale.
 * z = -3 → 0, z = 0 → 50, z = +3 → 100
 */
export function zScoreTo100(z: number): number {
  return Math.max(0, Math.min(100, ((z + 3) / 6) * 100))
}

/**
 * Min-Max normalize to 0-100 scale.
 * Used when z-score is overkill (e.g., sentiment already on 0-1 scale).
 */
export function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}
```

### 6.2 Sub-Scores (`composite.ts`)

**GitHub Score:**
```typescript
function computeGitHubScore(
  starVelocityZ: number,       // z-scored star gain in 30 days
  forkVelocityZ: number,       // z-scored fork count
  issueCloseRate: number,      // closed / (closed + open), 0 to 1
  contributorGrowthZ: number   // z-scored (not available in MVP — use 0)
): number {
  const starComponent = zScoreTo100(starVelocityZ) * 0.40
  const forkComponent = zScoreTo100(forkVelocityZ) * 0.20
  const issueComponent = (issueCloseRate * 100) * 0.20
  const contributorComponent = zScoreTo100(contributorGrowthZ) * 0.20
  return starComponent + forkComponent + issueComponent + contributorComponent
}
```

**For MVP:** We don't have historical star data on day 1. On the first day, use the current star count as a proxy for star velocity (high stars = high score). After 2+ days, compute actual velocity as `today's stars - yesterday's stars`.

**Community Score:**
```typescript
function computeCommunityScore(
  hnMentionsZ: number,         // z-scored HN mention count
  hnSentiment: number,         // 0 to 1 (0 = negative, 1 = positive)
  redditPostsZ: number,        // z-scored Reddit post count
  devtoArticlesZ: number       // z-scored Dev.to article count
): number {
  const hnComponent = zScoreTo100(hnMentionsZ) * 0.35
  const redditComponent = zScoreTo100(redditPostsZ) * 0.25
  const devtoComponent = zScoreTo100(devtoArticlesZ) * 0.25
  const sentimentAdjustment = (hnSentiment - 0.5) * 30 // -15 to +15 adjustment
  return Math.max(0, Math.min(100, hnComponent + redditComponent + devtoComponent + sentimentAdjustment))
}
```

**Jobs Score:**
```typescript
function computeJobsScore(
  adzunaCountZ: number,
  jsearchCountZ: number,
  remotiveCountZ: number
): number {
  return (
    zScoreTo100(adzunaCountZ) * 0.40 +
    zScoreTo100(jsearchCountZ) * 0.40 +
    zScoreTo100(remotiveCountZ) * 0.20
  )
}
```

**Ecosystem Score:**
```typescript
function computeEcosystemScore(
  downloadsZ: number,         // z-scored within same ecosystem (JS vs JS, Py vs Py)
  downloadGrowthRate: number, // percentage: (this_week - last_week) / last_week, e.g., 0.15 for +15%
  soQuestionsZ: number        // z-scored SO question count
): number {
  const downloadComponent = zScoreTo100(downloadsZ) * 0.40
  const growthComponent = minMaxNormalize(downloadGrowthRate, -0.5, 1.0) * 0.25  // -50% to +100% range
  const soComponent = zScoreTo100(soQuestionsZ) * 0.35
  return downloadComponent + growthComponent + soComponent
}
```

### 6.3 Composite Score (`composite.ts`)

```typescript
const WEIGHTS = {
  github: 0.25,
  community: 0.20,
  jobs: 0.25,
  ecosystem: 0.30, // ecosystem includes SO score
}

function computeCompositeScore(subScores: {
  github: number | null,
  community: number | null,
  jobs: number | null,
  ecosystem: number | null,
}): { composite: number, completeness: number } {
  // Collect available scores and their weights
  const available: { score: number, weight: number }[] = []

  if (subScores.github !== null) available.push({ score: subScores.github, weight: WEIGHTS.github })
  if (subScores.community !== null) available.push({ score: subScores.community, weight: WEIGHTS.community })
  if (subScores.jobs !== null) available.push({ score: subScores.jobs, weight: WEIGHTS.jobs })
  if (subScores.ecosystem !== null) available.push({ score: subScores.ecosystem, weight: WEIGHTS.ecosystem })

  if (available.length === 0) return { composite: 0, completeness: 0 }

  // Redistribute missing weights proportionally
  const totalAvailableWeight = available.reduce((sum, a) => sum + a.weight, 0)
  const composite = available.reduce((sum, a) => sum + a.score * (a.weight / totalAvailableWeight), 0)
  const completeness = available.length / 4

  return { composite: Math.round(composite * 100) / 100, completeness }
}
```

**Weight redistribution explained:** If a technology has no `jobs` data (weight 0.25), the remaining weights (0.25 + 0.20 + 0.30 = 0.75) are scaled up proportionally to sum to 1.0. So GitHub becomes 0.25/0.75 = 0.333, Community becomes 0.20/0.75 = 0.267, Ecosystem becomes 0.30/0.75 = 0.400.

### 6.4 Bayesian Smoothing (`bayesian.ts`)

```typescript
const CONFIDENCE_THRESHOLD = 50  // Minimum data points before trusting raw score

function bayesianSmooth(
  rawScore: number,
  dataPointCount: number,
  globalMean: number           // Average composite score across ALL technologies
): number {
  return (CONFIDENCE_THRESHOLD * globalMean + rawScore * dataPointCount)
    / (CONFIDENCE_THRESHOLD + dataPointCount)
}
```

**When to apply:** After computing composite scores for all technologies, compute the `globalMean` (average of all raw composite scores). Then for each technology, if its `dataPointCount` (total data points from all sources) is less than `CONFIDENCE_THRESHOLD`, apply Bayesian smoothing. Otherwise, use the raw score.

### 6.5 Momentum (`momentum.ts`)

```typescript
function computeMomentum(
  todayScore: number,
  score30DaysAgo: number | null
): number {
  if (score30DaysAgo === null) return 0  // Not enough history
  return Math.max(-100, Math.min(100, todayScore - score30DaysAgo))
}
```

**On days 1-29:** Momentum is 0 for all technologies (not enough history). After day 30, real momentum kicks in. This is expected behavior, not a bug.

---

## 7. SENTIMENT ANALYSIS — EXACT IMPLEMENTATION

### Location: `src/lib/scoring/sentiment.ts`

```typescript
import Sentiment from 'wink-sentiment'

const sentiment = Sentiment()

/**
 * Analyze sentiment of a text string.
 *
 * wink-sentiment returns:
 * - score: integer, negative to positive (e.g., -3 to +5)
 * - normalizedScore: float, -1 to +1
 *
 * We normalize to 0-1 scale where 0 = very negative, 0.5 = neutral, 1 = very positive.
 */
export function analyzeSentiment(text: string): number {
  if (!text || text.trim().length === 0) return 0.5 // neutral for empty text
  const result = sentiment.analyze(text)
  // normalizedScore is -1 to +1, convert to 0 to 1
  return (result.normalizedScore + 1) / 2
}

/**
 * Average sentiment across multiple texts.
 * Used for aggregating sentiment across multiple HN titles, Reddit posts, etc.
 */
export function averageSentiment(texts: string[]): number {
  if (texts.length === 0) return 0.5
  const scores = texts.map(t => analyzeSentiment(t))
  return scores.reduce((sum, s) => sum + s, 0) / scores.length
}
```

**Why wink-sentiment over vader-sentiment:**
- `wink-sentiment` last published: 2024. `vader-sentiment` last published: 2020.
- `wink-sentiment` has 30K weekly downloads, actively maintained.
- `vader-sentiment` has 15K weekly downloads, no updates in 4 years.
- Both use lexicon-based approaches. Accuracy is comparable for short text (~72-75%).
- For aggregating sentiment across hundreds of titles per technology, lexicon-based is sufficient. Individual misclassifications average out.

**Where sentiment is used:**
1. HN story titles → averaged per technology → stored as `data_points.metric = 'sentiment'`
2. Reddit post titles → averaged per technology → same
3. RSS article titles → averaged per technology → same
4. Community score computation → sentiment adjustment (+/- 15 points)

**Where sentiment is NOT used:**
- We do NOT analyze full article bodies (too slow, HN only has titles anyway)
- We do NOT analyze comments (too many, too noisy, not worth it for MVP)
- We do NOT do aspect-based sentiment ("React's performance is good but DX is bad") — that requires transformers, not lexicons

---

## 8. API ROUTES — REQUEST/RESPONSE SHAPES

### 8.1 `GET /api/technologies`

**Purpose:** Return all technologies with their latest scores.
**Called by:** `/technologies` page (Server Component, fetched at request time).
**Implementation:** Direct Supabase query, no external API calls.

**Query:**
```sql
SELECT
  t.*,
  ds.composite_score,
  ds.github_score,
  ds.community_score,
  ds.jobs_score,
  ds.ecosystem_score,
  ds.momentum,
  ds.data_completeness
FROM technologies t
LEFT JOIN daily_scores ds ON t.id = ds.technology_id
  AND ds.score_date = (SELECT MAX(score_date) FROM daily_scores)
WHERE t.is_active = true
ORDER BY ds.composite_score DESC NULLS LAST
```

**Response shape:**
```typescript
{
  technologies: Array<{
    id: string
    slug: string
    name: string
    description: string
    category: string
    color: string
    composite_score: number | null
    github_score: number | null
    community_score: number | null
    jobs_score: number | null
    ecosystem_score: number | null
    momentum: number | null
    data_completeness: number | null
    sparkline: number[]          // Last 30 days of composite_score (separate query)
  }>
  last_updated: string          // ISO date of most recent score_date
}
```

**Sparkline data:** Separate query per technology is too expensive for 100 techs. Instead, batch query:
```sql
SELECT technology_id, score_date, composite_score
FROM daily_scores
WHERE score_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY technology_id, score_date ASC
```
Group by technology_id in JS, extract array of composite_scores.

### 8.2 `GET /api/technologies/[slug]`

**Response shape:**
```typescript
{
  technology: {
    // All fields from technologies table
    id: string
    slug: string
    name: string
    description: string
    category: string
    ecosystem: string | null
    color: string
    website_url: string | null
    github_repo: string | null
    npm_package: string | null
    stackoverflow_tag: string
    first_appeared: number | null
    maintained_by: string | null
  }
  current_scores: {
    composite_score: number
    github_score: number
    community_score: number
    jobs_score: number
    ecosystem_score: number
    momentum: number
    data_completeness: number
    raw_sub_scores: object       // Full breakdown
  }
  chart_data: Array<{           // For trend chart
    date: string                // "2026-01-15"
    composite: number
    github: number
    community: number
    jobs: number
    ecosystem: number
  }>                            // Last 90 days by default
  latest_signals: {
    github: { stars: number, forks: number, open_issues: number } | null
    hackernews: { mentions: number, avg_upvotes: number, sentiment: number, top_stories: object[] } | null
    stackoverflow: { questions_30d: number, total_questions: number } | null
    npm: { weekly_downloads: number } | null
    reddit: { posts: number, avg_upvotes: number, sentiment: number } | null
    devto: { articles: number, reactions: number } | null
    jobs: { adzuna: number, jsearch: number, remotive: number, total: number } | null
  }
  related_technologies: Array<{
    slug: string
    name: string
    color: string
    composite_score: number
  }>                            // Same-category techs, top 6 by score
}
```

### 8.3 `GET /api/technologies/[slug]/chart`

**Query params:** `?period=30d|90d|1y`

**Response:**
```typescript
{
  data: Array<{
    date: string
    composite: number
    github: number
    community: number
    jobs: number
    ecosystem: number
  }>
}
```

### 8.4 `GET /api/compare?techs=react,vue,svelte`

**Validation:** 2-4 technology slugs, comma-separated. Return 400 if <2 or >4.

**Response:**
```typescript
{
  technologies: Array<{
    slug: string
    name: string
    color: string
    composite_score: number
    github_score: number
    community_score: number
    jobs_score: number
    ecosystem_score: number
    momentum: number
    // Latest raw signals for comparison table
    github_stars: number | null
    npm_downloads: number | null
    so_questions: number | null
    job_postings: number | null
    hn_mentions: number | null
  }>
  chart_data: Array<{
    date: string
    [slug: string]: number    // composite score per technology
  }>                          // Last 90 days
}
```

### 8.5 Cron Routes (see Section 9)

---

## 9. CRON JOBS — EXACT CONFIGURATION

### vercel.json (create this file in project root)
```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/fetch-weekly",
      "schedule": "0 3 * * 1"
    }
  ]
}
```

- `0 2 * * *` = every day at 2:00 AM UTC
- `0 3 * * 1` = every Monday at 3:00 AM UTC

### Cron Security

Vercel cron jobs call your API routes via HTTP. To prevent random people from triggering your cron jobs, verify the `Authorization` header:

```typescript
// In each cron route handler:
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... run the job
}
```

Add `CRON_SECRET` to `.env.local` (any random string). Vercel automatically sends this header for cron invocations.

**UPDATE:** Actually, Vercel cron does NOT send a Bearer token by default. Instead, check for the `x-vercel-cron` header which Vercel adds automatically to cron requests:

```typescript
export async function GET(request: Request) {
  // In production, verify this is a Vercel cron request
  // In development, allow manual triggering
  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  // ... run the job
}
```

### Daily Cron Execution Order (`/api/cron/fetch-daily`)

```
1. Log start time
2. Fetch all technologies from Supabase (one query, ~100 rows)
3. Run fetchers SEQUENTIALLY (not parallel — respect rate limits):
   a. GitHub fetcher → store data_points
   b. HN Algolia fetcher → store data_points
   c. Stack Overflow fetcher → store data_points
   d. npm download fetcher → store data_points
   e. PyPI download fetcher → store data_points
   f. crates.io download fetcher → store data_points
   g. Dev.to fetcher → store data_points
   h. Reddit fetcher → store data_points (skip if no credentials)
   i. RSS feed parser → store data_points
4. Run scoring engine:
   a. Query today's data_points for all technologies
   b. Z-score normalize each metric across all technologies
   c. Compute sub-scores for each technology
   d. Compute composite score with weight redistribution
   e. Compute Bayesian smoothing for low-data technologies
   f. Compute momentum (today vs 30 days ago)
   g. UPSERT into daily_scores (ON CONFLICT update)
5. Log completion + duration + counts to fetch_logs
6. Return JSON summary
```

**Timeout concern:** Vercel hobby plan = 60 second timeout. This is tight for 100 technologies across 9 sources. Mitigation:
- Batch Supabase inserts (insert 100 rows at once, not one by one)
- Use `Promise.all` for independent Supabase writes (not for API fetches)
- If it times out, split into 2-3 sub-routes called sequentially

**If 60s is not enough:** Use Vercel's `maxDuration` in the route config:
```typescript
export const maxDuration = 60 // seconds (max on hobby plan)
// On Pro plan, this can be up to 300
```

If truly insufficient, split the daily cron into 2 jobs: one for data collection, one for scoring. But try the single job first.

### Weekly Cron (`/api/cron/fetch-weekly`)

```
1. Log start
2. Fetch technologies
3. Run job market fetchers:
   a. Adzuna (5 broad queries)
   b. JSearch (5 broad queries)
   c. Remotive (1 query, parse all results)
   d. Arbeitnow (1 query, parse all results)
4. Run NewsAPI (5 broad queries)
5. Store all data_points
6. Log completion
```

No scoring here — the daily cron handles scoring using whatever data is available (including job data from the weekly fetch).

---

## 10. PAGES — EXACT SPECIFICATIONS

### 10.1 Landing Page `/` (UPDATE EXISTING)

**Changes to existing page:**
- "Get Started" button → links to `/technologies`
- Nav link "Trending" → links to `/technologies?sort=momentum`
- Nav link "Popular" → links to `/technologies?sort=score`
- Nav link "Technologies" → links to `/technologies`
- All other nav links remain as anchor links or get removed

**No other changes to landing page.** Don't redesign it.

### 10.2 Technology Explorer `/technologies`

**Component:** Server Component (no 'use client' on the page itself).
**Data fetching:** Call Supabase directly from the server component, or fetch from `/api/technologies`.
**Client interactivity:** Filter/sort controls are a separate client component.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header (existing, reused)               │
├─────────────────────────────────────────┤
│ Page Title: "Technology Explorer"       │
│ Subtitle: "100 technologies tracked..." │
├─────────────────────────────────────────┤
│ [Search: ______] [Category: All ▾]      │
│ [Sort by: Score ▾] [View: Table|Grid]   │
├─────────────────────────────────────────┤
│ ┌─────┬────────┬───────┬──────┬───────┐ │
│ │ Tech│Category│ Score │Moment│Spark  │ │
│ ├─────┼────────┼───────┼──────┼───────┤ │
│ │React│Frontend│ 87.4  │ ↑+3.2│ ╱─╲─╱ │ │
│ │Rust │Language│ 82.1  │ ↑+8.5│ ╱──── │ │
│ │...  │...     │ ...   │ ...  │ ...   │ │
│ └─────┴────────┴───────┴──────┴───────┘ │
├─────────────────────────────────────────┤
│ Footer (existing, reused)               │
└─────────────────────────────────────────┘
```

**Mobile (< 768px):** Replace table with card grid. Each card shows: name, category badge, score, momentum arrow.

**Empty state:** If no scores exist yet (day 0), show: "Data collection starts soon. Scores will appear within 24 hours."

**URL query params (client-side state, pushed to URL):**
- `?search=react` — filter by name
- `?category=frontend` — filter by category
- `?sort=score|name|momentum` — sort column
- `?view=table|grid` — layout toggle

### 10.3 Technology Detail `/technologies/[slug]`

**Component:** Server Component. Fetch technology + scores from Supabase.
**Charts:** Client component (`'use client'`) wrapping Recharts.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ ← Back to Explorer                      │
├─────────────────────────────────────────┤
│ ● React              [Frontend] 87.4    │
│ A JavaScript library for building UIs   │
│ Maintained by Meta · Since 2013         │
├─────────────────────────────────────────┤
│ Score Breakdown:                        │
│ GitHub    ████████░░ 82                 │
│ Community ███████░░░ 74                 │
│ Jobs      █████████░ 91                 │
│ Ecosystem ████████░░ 85                 │
├─────────────────────────────────────────┤
│ Trend Chart:   [30d] [90d] [1yr]        │
│ ┌─────────────────────────────────┐     │
│ │  📈 Line chart with composite   │     │
│ │     score over time             │     │
│ └─────────────────────────────────┘     │
├─────────────────────────────────────────┤
│ Source Signals:                          │
│ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│ │ GitHub  │ │ HN      │ │ npm      │  │
│ │ ⭐ 232K │ │ 47 posts│ │ 28M/week │  │
│ │ ↑2.1K   │ │ ↑12%    │ │ ↑5%      │  │
│ └─────────┘ └─────────┘ └──────────┘  │
│ ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│ │ SO      │ │ Reddit  │ │ Jobs     │  │
│ │ 1.2K qs │ │ 89 posts│ │ 4,521    │  │
│ └─────────┘ └─────────┘ └──────────┘  │
├─────────────────────────────────────────┤
│ Related Technologies:                   │
│ [Vue 72.3] [Angular 65.1] [Svelte 68.5]│
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

### 10.4 Compare Page `/compare`

**URL:** `/compare?techs=react,vue,svelte`
**If no `techs` param:** Show a selector page where user picks 2-4 technologies.
**If `techs` param exists:** Show comparison.

**Layout:**
```
┌─────────────────────────────────────────┐
│ Header                                  │
├─────────────────────────────────────────┤
│ Compare Technologies                    │
│ [React ×] [Vue ×] [Svelte ×] [+ Add]   │
├─────────────────────────────────────────┤
│ Trend Comparison:                       │
│ ┌─────────────────────────────────┐     │
│ │  📈 Multi-line chart             │     │
│ │     (one line per technology)    │     │
│ └─────────────────────────────────┘     │
├─────────────────────────────────────────┤
│ Metric      │ React │ Vue  │ Svelte    │
│ ────────────┼───────┼──────┼────────── │
│ Score       │ 87.4  │ 72.3 │ 68.5     │
│ Momentum    │ +3.2  │ -1.1 │ +5.8     │
│ GitHub ⭐   │ 232K  │ 48K  │ 82K      │
│ npm DL/wk   │ 28M   │ 5M   │ 1.2M    │
│ SO Qs/mo    │ 1.2K  │ 450  │ 210      │
│ Jobs        │ 4,521 │ 1,203│ 342      │
│ HN mentions │ 47    │ 12   │ 28       │
├─────────────────────────────────────────┤
│ [Share Link 📋]                         │
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

### 10.5 Methodology Page `/methodology`

**Component:** Server Component. Static content, no data fetching needed.
**Content:** Markdown-like structured content explaining:
1. What is DevTrends and why it exists
2. Data sources (list all 9+ sources with links)
3. How the composite score works (formula, weights, diagram)
4. How sub-scores are calculated
5. How momentum is calculated
6. How sentiment analysis works (lexicon-based, wink-sentiment)
7. How often data updates (daily cron, weekly for jobs)
8. Limitations and transparency notes
9. Technology taxonomy (link to GitHub or show category counts)
10. Open source notice (MIT license, link to repo)

---

## 11. COMPONENTS — PROPS & BEHAVIOR

### Client Components (need 'use client')
- `TechFilters.tsx` — text input + dropdowns, `useState` for filter values
- `TechTable.tsx` — sortable table, `useState` for sort column/direction
- `TrendChart.tsx` — Recharts LineChart, `useState` for period toggle (30d/90d/1yr)
- `CompareChart.tsx` — Recharts LineChart with multiple lines
- `TechSelector.tsx` — dropdown/combobox for adding technologies to compare
- `Sparkline.tsx` — tiny Recharts LineChart (no axes, no tooltip)
- `MomentumBadge.tsx` — animated arrow icon (Framer Motion)

### Server Components (no 'use client')
- Page components (`page.tsx` files)
- `ScoreBreakdown.tsx` — progress bars, pure HTML/CSS, no interactivity
- `SourceSignalCard.tsx` — static card displaying numbers
- `RelatedTechnologies.tsx` — static grid of links
- `CategoryBadge.tsx` — colored badge (use shadcn Badge)
- `ScoreBadge.tsx` — colored number display
- `DataFreshness.tsx` — "Updated 3 hours ago" text
- `ConfidenceBadge.tsx` — "High/Medium/Low" badge

### Sparkline Component (detailed spec)
```typescript
// 'use client'
// Props: data: number[] (30 values), color: string, width?: number, height?: number
// Renders a Recharts LineChart with:
//   - No axes, no grid, no tooltip, no legend
//   - Just the line
//   - Responsive within parent container
//   - Line color from props
//   - Area fill with 10% opacity of line color
```

### MomentumBadge Component
```typescript
// Props: momentum: number (-100 to +100)
// If momentum > 2: green up arrow + "+" + number
// If momentum < -2: red down arrow + number
// If -2 <= momentum <= 2: gray horizontal line + "Stable"
// Use Framer Motion for subtle entrance animation
```

---

## 12. TYPESCRIPT TYPES — COMPLETE DEFINITIONS

### `src/types/index.ts`
```typescript
// ---- Database row types ----

export interface Technology {
  id: string
  slug: string
  name: string
  description: string
  category: TechnologyCategory
  ecosystem: string | null
  website_url: string | null
  github_repo: string | null
  npm_package: string | null
  pypi_package: string | null
  crates_package: string | null
  stackoverflow_tag: string
  subreddit: string | null
  devto_tag: string | null
  aliases: string[]
  color: string
  first_appeared: number | null
  maintained_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type TechnologyCategory =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'cloud'
  | 'mobile'
  | 'ai_ml'

export const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  language: 'Language',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  cloud: 'Cloud',
  mobile: 'Mobile',
  ai_ml: 'AI/ML',
}

export interface DataPoint {
  id: number
  technology_id: string
  source: DataSource
  metric: DataMetric
  value: number
  metadata: Record<string, unknown>
  measured_at: string  // DATE string: "2026-01-15"
  created_at: string
}

export type DataSource =
  | 'github' | 'hackernews' | 'stackoverflow' | 'npm' | 'pypi' | 'crates'
  | 'reddit' | 'devto' | 'adzuna' | 'jsearch' | 'remotive' | 'arbeitnow'
  | 'newsapi' | 'rss'

export type DataMetric =
  | 'stars' | 'forks' | 'open_issues' | 'contributors' | 'watchers'
  | 'mentions' | 'upvotes' | 'comments' | 'sentiment'
  | 'questions' | 'answer_rate' | 'views'
  | 'downloads' | 'dependents'
  | 'job_postings' | 'articles' | 'posts'

export interface DailyScore {
  id: number
  technology_id: string
  score_date: string   // DATE string: "2026-01-15"
  composite_score: number
  github_score: number
  community_score: number
  jobs_score: number
  ecosystem_score: number
  momentum: number
  data_completeness: number
  raw_sub_scores: Record<string, unknown>
  computed_at: string
}

export interface FetchLog {
  id: number
  source: string
  status: 'success' | 'partial' | 'failed'
  technologies_processed: number
  data_points_created: number
  error_message: string | null
  duration_ms: number
  started_at: string
  completed_at: string | null
}

// ---- API response types ----

export interface TechnologyWithScore extends Technology {
  composite_score: number | null
  github_score: number | null
  community_score: number | null
  jobs_score: number | null
  ecosystem_score: number | null
  momentum: number | null
  data_completeness: number | null
  sparkline: number[]
}

export interface TechnologyDetail {
  technology: Technology
  current_scores: DailyScore | null
  chart_data: ChartDataPoint[]
  latest_signals: LatestSignals
  related_technologies: TechnologyWithScore[]
}

export interface ChartDataPoint {
  date: string
  composite: number
  github: number
  community: number
  jobs: number
  ecosystem: number
}

export interface LatestSignals {
  github: { stars: number; forks: number; open_issues: number } | null
  hackernews: { mentions: number; avg_upvotes: number; sentiment: number; top_stories: HNStory[] } | null
  stackoverflow: { questions_30d: number; total_questions: number } | null
  npm: { weekly_downloads: number } | null
  reddit: { posts: number; avg_upvotes: number; sentiment: number } | null
  devto: { articles: number; reactions: number } | null
  jobs: { adzuna: number; jsearch: number; remotive: number; total: number } | null
}

export interface HNStory {
  title: string
  url: string
  points: number
}

export interface CompareData {
  technologies: TechnologyWithScore[]
  chart_data: Array<Record<string, string | number>>  // { date: "2026-01-15", react: 87, vue: 72 }
}

// ---- Fetcher types ----

export interface FetcherResult {
  source: DataSource
  dataPoints: Omit<DataPoint, 'id' | 'created_at'>[]
  errors: string[]
}
```

---

## 13. SUPABASE CLIENT SETUP — EXACT CODE

### `src/lib/supabase/server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch { /* ignore in Server Components */ }
        },
      },
    }
  )
}
```

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### `src/lib/supabase/admin.ts` (for cron jobs)
```typescript
import { createClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. ONLY use in server-side cron jobs.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

**Usage rules:**
- Page components (Server Components) → `createSupabaseServerClient()` — reads with anon key, respects RLS
- Client Components → `createSupabaseBrowserClient()` — reads with anon key
- Cron jobs (API routes) → `createSupabaseAdminClient()` — writes with service role key, bypasses RLS

---

## 14. FILE STRUCTURE — EVERY FILE

```
tracker_final/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── globals.css                          # EXISTS — no changes
│   │   ├── layout.tsx                           # EXISTS — no changes
│   │   ├── page.tsx                             # EXISTS — update CTA links only
│   │   ├── providers.tsx                        # EXISTS — no changes
│   │   ├── methodology/
│   │   │   └── page.tsx                         # NEW — static content page
│   │   ├── technologies/
│   │   │   ├── page.tsx                         # NEW — Server Component, tech explorer
│   │   │   └── [slug]/
│   │   │       └── page.tsx                     # NEW — Server Component, tech detail
│   │   ├── compare/
│   │   │   └── page.tsx                         # NEW — Client Component (URL state)
│   │   └── api/
│   │       ├── technologies/
│   │       │   ├── route.ts                     # NEW — GET all techs with scores
│   │       │   └── [slug]/
│   │       │       ├── route.ts                 # NEW — GET single tech detail
│   │       │       └── chart/
│   │       │           └── route.ts             # NEW — GET chart time-series
│   │       ├── compare/
│   │       │   └── route.ts                     # NEW — GET comparison data
│   │       └── cron/
│   │           ├── fetch-daily/
│   │           │   └── route.ts                 # NEW — daily data collection + scoring
│   │           └── fetch-weekly/
│   │               └── route.ts                 # NEW — weekly job market + news
│   │
│   ├── components/
│   │   ├── ui/                                  # EXISTS — shadcn components, no changes
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   ├── Header.tsx                           # EXISTS — update nav links
│   │   ├── Hero.tsx                             # EXISTS — no changes
│   │   ├── BentoFeatures.tsx                    # EXISTS — no changes
│   │   ├── Footer.tsx                           # EXISTS — no changes
│   │   ├── FloatingIcons.tsx                    # EXISTS — no changes
│   │   ├── SharedTitle.tsx                      # EXISTS — no changes
│   │   ├── AnimatedCTA.tsx                      # EXISTS — no changes
│   │   ├── ThemeToggle.tsx                      # EXISTS — no changes
│   │   ├── ThemeWaveTransition.tsx              # EXISTS — no changes
│   │   ├── technologies/
│   │   │   ├── TechTable.tsx                    # NEW — 'use client', sortable table
│   │   │   ├── TechCard.tsx                     # NEW — mobile card layout
│   │   │   ├── TechFilters.tsx                  # NEW — 'use client', search + category filter
│   │   │   ├── ScoreBreakdown.tsx               # NEW — server component, progress bars
│   │   │   ├── TrendChart.tsx                   # NEW — 'use client', Recharts line chart
│   │   │   ├── SourceSignalCard.tsx             # NEW — server component, data card
│   │   │   ├── RelatedTechnologies.tsx          # NEW — server component, tech grid
│   │   │   ├── Sparkline.tsx                    # NEW — 'use client', tiny Recharts chart
│   │   │   └── MomentumBadge.tsx                # NEW — momentum indicator
│   │   ├── compare/
│   │   │   ├── CompareChart.tsx                 # NEW — 'use client', multi-line chart
│   │   │   ├── CompareTable.tsx                 # NEW — comparison table
│   │   │   └── TechSelector.tsx                 # NEW — 'use client', add/remove tech
│   │   └── shared/
│   │       ├── ScoreBadge.tsx                   # NEW — colored score (0-100)
│   │       ├── CategoryBadge.tsx                # NEW — category label with color
│   │       ├── DataFreshness.tsx                # NEW — "Updated X hours ago"
│   │       └── ConfidenceBadge.tsx              # NEW — High/Medium/Low badge
│   │
│   ├── lib/
│   │   ├── utils.ts                             # EXISTS — cn() function, no changes
│   │   ├── constants/
│   │   │   ├── data-sources.ts                  # EXISTS — RSS feeds, API configs
│   │   │   └── technologies.ts                  # NEW — seed data for 100 technologies
│   │   ├── supabase/
│   │   │   ├── server.ts                        # NEW — server-side Supabase client
│   │   │   ├── client.ts                        # NEW — browser-side Supabase client
│   │   │   └── admin.ts                         # NEW — service role client for cron jobs
│   │   ├── api/
│   │   │   ├── github.ts                        # NEW — GitHub API fetcher
│   │   │   ├── hackernews.ts                    # NEW — HN Algolia fetcher
│   │   │   ├── stackoverflow.ts                 # NEW — SO API fetcher
│   │   │   ├── devto.ts                         # NEW — Dev.to API fetcher
│   │   │   ├── reddit.ts                        # NEW — Reddit OAuth + fetcher
│   │   │   ├── packages.ts                      # NEW — npm/PyPI/crates.io fetcher
│   │   │   ├── jobs.ts                          # NEW — Adzuna/JSearch/Remotive/Arbeitnow
│   │   │   ├── rss.ts                           # NEW — RSS feed parser
│   │   │   └── news.ts                          # NEW — NewsAPI fetcher
│   │   └── scoring/
│   │       ├── normalize.ts                     # NEW — z-score, min-max functions
│   │       ├── composite.ts                     # NEW — sub-scores + composite + weights
│   │       ├── momentum.ts                      # NEW — ROC calculation
│   │       ├── bayesian.ts                      # NEW — Bayesian smoothing
│   │       └── sentiment.ts                     # NEW — wink-sentiment wrapper
│   │
│   ├── hooks/
│   │   ├── useReducedMotion.ts                  # EXISTS — no changes
│   │   ├── useTechnologies.ts                   # NEW — React Query for tech list
│   │   ├── useTechnology.ts                     # NEW — React Query for single tech
│   │   └── useCompare.ts                        # NEW — React Query for comparison
│   │
│   └── types/
│       └── index.ts                             # NEW — all TypeScript types
│
├── .env.local                                   # EXISTS — has keys, updated structure
├── .env.example                                 # EXISTS — template, updated
├── vercel.json                                  # NEW — cron job configuration
├── next.config.ts                               # EXISTS — no changes
├── tailwind.config.ts                           # EXISTS — no changes
├── tsconfig.json                                # EXISTS — no changes
├── package.json                                 # EXISTS — add 3 new dependencies
├── CLAUDE.md                                    # EXISTS — project context
├── MVP_SPEC.md                                  # THIS FILE
├── LICENSE                                      # NEW — MIT license text
└── README.md                                    # EXISTS — update with project description
```

**Total new files: ~40. Total modified files: ~4. Total unchanged: ~15.**

---

## 15. ERROR HANDLING — EXACT STRATEGY

### In Fetchers (API calls to external services)
```typescript
// PATTERN: Try/catch per technology, log error, continue to next.
// One failed technology should NEVER stop the entire fetch.

async function fetchGitHubData(technologies: Technology[]): Promise<FetcherResult> {
  const dataPoints: DataPoint[] = []
  const errors: string[] = []

  for (const tech of technologies) {
    if (!tech.github_repo) continue
    try {
      const response = await fetch(`https://api.github.com/repos/${tech.github_repo}`, { ... })
      if (!response.ok) {
        errors.push(`GitHub ${tech.slug}: HTTP ${response.status}`)
        continue  // Skip this tech, try next
      }
      const data = await response.json()
      dataPoints.push({ ... })
    } catch (error) {
      errors.push(`GitHub ${tech.slug}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      continue  // Skip this tech, try next
    }
    await delay(100) // Rate limit politeness
  }

  return { source: 'github', dataPoints, errors }
}
```

### In Cron Jobs (orchestrator)
```typescript
// PATTERN: Try/catch per fetcher, log result, continue to next fetcher.
// One failed source should NEVER stop other sources.

const results: FetcherResult[] = []

try { results.push(await fetchGitHubData(technologies)) }
catch (e) { results.push({ source: 'github', dataPoints: [], errors: [String(e)] }) }

try { results.push(await fetchHNData(technologies)) }
catch (e) { results.push({ source: 'hackernews', dataPoints: [], errors: [String(e)] }) }

// ... etc for all fetchers
```

### In Scoring Engine
- If a technology has zero data points for a sub-score → that sub-score is `null` → weight redistributed.
- If ALL sub-scores are null → composite is 0, data_completeness is 0.
- Never throw from scoring functions. Return 0 or null for missing data.

### In Frontend
- If API route returns error → show toast via Sonner: "Failed to load data. Try refreshing."
- If technology not found (404) → show "Technology not found" page with link back to explorer.
- If scores are null (no data yet) → show "Awaiting data" placeholder, not an error.

### Data Staleness
- `daily_scores` has a `computed_at` timestamp. Frontend shows "Last updated: {relative time}".
- If `computed_at` is older than 48 hours, show a yellow banner: "Data may be outdated."
- If no `daily_scores` rows exist at all (fresh install), show "Data collection in progress."

---

## 16. 15-DAY BUILD PLAN — DAY BY DAY

### Day 1: Database + Types + Supabase Client
- [ ] Run all 4 CREATE TABLE migrations in Supabase (Section 3)
- [ ] Create `src/types/index.ts` (Section 12 — copy the types exactly)
- [ ] Create `src/lib/supabase/server.ts`, `client.ts`, `admin.ts` (Section 13)
- [ ] Install 3 new packages: `npm install rss-parser wink-sentiment simple-statistics`
- [ ] Create `vercel.json` with cron configuration (Section 9)
- [ ] Verify Supabase connection works: write a test API route that reads from technologies table

### Day 2: Technology Taxonomy Seed
- [ ] Create `src/lib/constants/technologies.ts` with all 100 technology entries (Section 4)
- [ ] Write a seed script (or Supabase SQL INSERT) to populate the `technologies` table
- [ ] Verify all 100 rows inserted correctly
- [ ] Run `npx supabase gen types typescript --project-id bbjltwrgguiogpiqqgze > src/types/database.ts` if using Supabase CLI, otherwise manually verify types match

### Day 3: Fetchers Part 1 (GitHub + HN + SO)
- [ ] Build `src/lib/api/github.ts` (Section 5.1)
- [ ] Build `src/lib/api/hackernews.ts` (Section 5.2)
- [ ] Build `src/lib/api/stackoverflow.ts` (Section 5.3)
- [ ] Build `src/lib/scoring/sentiment.ts` (Section 7)
- [ ] Test each fetcher manually by calling from a temporary API route
- [ ] Verify data_points are inserted correctly into Supabase

### Day 4: Fetchers Part 2 (npm + Dev.to + Reddit + RSS)
- [ ] Build `src/lib/api/packages.ts` — npm, PyPI, crates.io (Sections 5.4, 5.5, 5.6)
- [ ] Build `src/lib/api/devto.ts` (Section 5.7)
- [ ] Build `src/lib/api/reddit.ts` (Section 5.8)
- [ ] Build `src/lib/api/rss.ts` (Section 5.10)
- [ ] Test each fetcher manually

### Day 5: Fetchers Part 3 (Jobs + News + Cron Wiring)
- [ ] Build `src/lib/api/jobs.ts` — Adzuna, JSearch, Remotive, Arbeitnow (Section 5.9)
- [ ] Build `src/lib/api/news.ts` (Section 5.11)
- [ ] Wire all fetchers into `/api/cron/fetch-daily/route.ts` (Section 9)
- [ ] Wire job/news fetchers into `/api/cron/fetch-weekly/route.ts` (Section 9)
- [ ] Run the daily cron manually, verify data_points table fills up

### Day 6: Scoring Engine
- [ ] Build `src/lib/scoring/normalize.ts` (Section 6.1)
- [ ] Build `src/lib/scoring/composite.ts` (Section 6.2, 6.3)
- [ ] Build `src/lib/scoring/momentum.ts` (Section 6.5)
- [ ] Build `src/lib/scoring/bayesian.ts` (Section 6.4)
- [ ] Wire scoring into the daily cron (step 4 in Section 9)
- [ ] Run the full cron pipeline: fetch → store → score → verify daily_scores table

### Day 7: API Routes
- [ ] Build `GET /api/technologies/route.ts` (Section 8.1)
- [ ] Build `GET /api/technologies/[slug]/route.ts` (Section 8.2)
- [ ] Build `GET /api/technologies/[slug]/chart/route.ts` (Section 8.3)
- [ ] Build `GET /api/compare/route.ts` (Section 8.4)
- [ ] Test all routes with browser/curl, verify response shapes match Section 8

### Day 8: Technology Explorer Page
- [ ] Build `src/components/shared/ScoreBadge.tsx`
- [ ] Build `src/components/shared/CategoryBadge.tsx`
- [ ] Build `src/components/shared/ConfidenceBadge.tsx`
- [ ] Build `src/components/technologies/MomentumBadge.tsx`
- [ ] Build `src/components/technologies/Sparkline.tsx`
- [ ] Build `src/components/technologies/TechFilters.tsx`
- [ ] Build `src/components/technologies/TechTable.tsx`
- [ ] Build `src/components/technologies/TechCard.tsx` (mobile)
- [ ] Build `src/app/technologies/page.tsx`
- [ ] Verify page renders with real data from Supabase

### Day 9: Technology Detail Page
- [ ] Build `src/components/technologies/ScoreBreakdown.tsx`
- [ ] Build `src/components/technologies/TrendChart.tsx`
- [ ] Build `src/components/technologies/SourceSignalCard.tsx`
- [ ] Build `src/components/technologies/RelatedTechnologies.tsx`
- [ ] Build `src/components/shared/DataFreshness.tsx`
- [ ] Build `src/app/technologies/[slug]/page.tsx`
- [ ] Verify page renders with real data, chart works

### Day 10: Compare Page
- [ ] Build `src/components/compare/TechSelector.tsx`
- [ ] Build `src/components/compare/CompareChart.tsx`
- [ ] Build `src/components/compare/CompareTable.tsx`
- [ ] Build `src/app/compare/page.tsx`
- [ ] Verify comparison works with 2-4 technologies

### Day 11: Methodology Page + Navigation Updates
- [ ] Build `src/app/methodology/page.tsx` (Section 10.5)
- [ ] Update `Header.tsx` nav links to point to real routes
- [ ] Update `page.tsx` (landing) CTA buttons to link to `/technologies`
- [ ] Build React Query hooks: `useTechnologies.ts`, `useTechnology.ts`, `useCompare.ts`
- [ ] Add React Query provider to `providers.tsx` if not already there

### Day 12: Polish & Responsive
- [ ] Add loading skeletons for all pages (use shadcn Skeleton if available, or simple CSS)
- [ ] Add error boundaries / error.tsx files for each route segment
- [ ] Test responsive design: mobile (375px), tablet (768px), desktop (1280px)
- [ ] Fix any visual bugs or layout issues
- [ ] Ensure dark mode works correctly on all new pages

### Day 13: Data Quality + Edge Cases
- [ ] Run full cron cycle end-to-end
- [ ] Verify scores are reasonable (React should score higher than Zig, Python should have high ecosystem score)
- [ ] Handle edge cases: technology with no GitHub repo, technology with no npm package
- [ ] Verify "no data yet" states display correctly
- [ ] Verify compare page handles invalid slugs gracefully

### Day 14: Performance + SEO
- [ ] Add page titles and meta descriptions for all pages
- [ ] Add `generateMetadata` for dynamic pages (`/technologies/[slug]`)
- [ ] Run `next build --webpack` and fix any build errors
- [ ] Check bundle size (aim for <200KB first load JS)
- [ ] Add `robots.txt` and basic `sitemap.xml` (static for MVP)
- [ ] Test Lighthouse scores (aim for 90+ performance, 90+ accessibility)

### Day 15: Deploy
- [ ] Set all environment variables in Vercel dashboard
- [ ] Deploy to Vercel
- [ ] Verify cron jobs trigger (check Vercel logs)
- [ ] Verify all pages work in production
- [ ] Run one manual cron trigger to populate initial data
- [ ] Add MIT LICENSE file
- [ ] Update README.md with live URL, description, screenshot

---

This spec has zero ambiguity. Every function, every type, every API call, every database column, every file path, every npm package, every formula, every edge case is defined. Build it.
