# DevTrends - Complete Project Flow (Input → Processing → Output)

## THE BIG PICTURE

```
DATA IN (Automated)              PROCESSING (Server)              DATA OUT (Website)
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐
│ GitHub API      │         │                      │         │                     │
│ Hacker News     │         │  1. Fetch raw data   │         │  Dashboard          │
│ Stack Overflow  │──every──│  2. Extract tech     │─────────│  Technology Pages   │
│ Dev.to          │ 4 hrs   │  3. Score & rank     │  real   │  Job Insights       │
│ NewsAPI         │         │  4. Store in DB      │  time   │  Learning Roadmap   │
│ Adzuna          │         │  5. Detect trends    │         │  Search             │
│ JSearch         │         │                      │         │                     │
└─────────────────┘         └──────────────────────┘         └─────────────────────┘
```

---

## PHASE 1: INPUT — What Data Comes In

### Every 4 hours, a cron job runs and collects:

### From GitHub API
```
What we fetch:
- Search repos created in last 7 days, sorted by stars
- Search repos by language (JavaScript, Python, Rust, Go, etc.)
- Star counts, fork counts, language breakdown per repo
- Trending topics/tags

Raw data example:
{
  repo: "vercel/next.js",
  stars: 128000,
  stars_gained_this_week: 1200,
  forks: 54000,
  language: "TypeScript",
  topics: ["react", "nextjs", "framework", "ssr"],
  last_updated: "2026-02-08",
  description: "The React Framework"
}

What we extract from this:
- Technologies mentioned: ["Next.js", "TypeScript", "React"]
- Popularity signal: 1200 stars gained = HIGH activity
- Source: "github"
```

### From Hacker News (Algolia API)
```
What we fetch:
- Top stories from last 24 hours
- Search for technology keywords
- Comment counts, point scores

Raw data example:
{
  title: "Why we migrated from Python to Rust",
  url: "https://blog.example.com/python-to-rust",
  points: 342,
  num_comments: 189,
  created_at: "2026-02-08T10:30:00Z"
}

What we extract from this:
- Technologies mentioned: ["Python", "Rust"]
- Sentiment: Migration AWAY from Python, TOWARD Rust
- Discussion intensity: 189 comments = HIGH engagement
- Source: "hackernews"
```

### From Stack Overflow
```
What we fetch:
- Tag statistics (how many questions per tag this week)
- Trending tags (fastest growing question volume)
- Unanswered ratio per tag (indicates learning demand)

Raw data example:
{
  tag: "rust",
  questions_this_week: 1240,
  questions_last_week: 980,
  growth_rate: "+26.5%",
  unanswered_ratio: 0.34
}

What we extract from this:
- Technology: "Rust"
- Demand signal: 26.5% more questions = people are learning it
- Difficulty signal: 34% unanswered = complex technology
- Source: "stackoverflow"
```

### From Dev.to
```
What we fetch:
- Top articles from last 7 days
- Articles by tag (react, python, ai, etc.)
- Reaction counts, comment counts

Raw data example:
{
  title: "Building a CLI with Go in 2026",
  tags: ["go", "cli", "tutorial"],
  positive_reactions_count: 89,
  comments_count: 23,
  published_at: "2026-02-07"
}

What we extract from this:
- Technologies mentioned: ["Go", "CLI"]
- Content interest: 89 reactions = moderate interest
- Source: "devto"
```

### From NewsAPI
```
What we fetch:
- Technology news articles from last 24 hours
- Filter by tech/programming/AI keywords

Raw data example:
{
  title: "Apple announces Swift 7 with major concurrency improvements",
  source: "TechCrunch",
  publishedAt: "2026-02-08",
  description: "Apple's latest Swift release..."
}

What we extract from this:
- Technologies mentioned: ["Swift", "Apple"]
- News signal: Major release = spike in interest expected
- Source: "newsapi"
```

### From Adzuna (Job Market)
```
What we fetch:
- Job listings mentioning specific technologies
- Count of jobs per technology per location
- Salary ranges per technology

Raw data example:
{
  technology: "React",
  total_jobs: 14500,
  average_salary: "$125,000",
  jobs_last_month: 12800,
  growth: "+13.3%",
  location: "United States"
}

What we extract from this:
- Technology: "React"
- Job demand: 14,500 active listings
- Salary signal: $125k average
- Market growth: 13.3% more jobs than last month
- Source: "adzuna"
```

### From JSearch / RapidAPI
```
What we fetch:
- Supplementary job data
- Remote job listings by technology
- Company names hiring for specific tech

What we extract:
- Additional job count data
- Remote work availability per technology
- Top hiring companies
- Source: "jsearch"
```

---

## PHASE 2: PROCESSING — What Happens to the Raw Data

### Step 1: Technology Extraction
```
Every piece of raw data goes through a technology matcher.

We maintain a TECHNOLOGY TAXONOMY — a list of 200+ technologies:

{
  "React": {
    aliases: ["reactjs", "react.js", "react js"],
    category: "Frontend Framework",
    ecosystem: "JavaScript",
    logo: "/logos/react.svg"
  },
  "Python": {
    aliases: ["python3", "python 3", "py"],
    category: "Programming Language",
    ecosystem: "Python",
    logo: "/logos/python.svg"
  },
  "Rust": {
    aliases: ["rustlang", "rust-lang"],
    category: "Programming Language",
    ecosystem: "Rust",
    logo: "/logos/rust.svg"
  },
  // ... 200+ more
}

Input:  "Why we migrated from Python to Rust"
Output: ["Python", "Rust"]

Input:  "Building React Native apps with TypeScript"
Output: ["React Native", "TypeScript"]
```

### Step 2: Scoring Algorithm
```
Each technology gets a TREND SCORE calculated from all sources.

Formula per technology:

trend_score = (
  github_signal     × 0.25 +    // Stars, forks, new repos
  hackernews_signal × 0.25 +    // Points, comments, front page appearances
  stackoverflow_signal × 0.20 + // Question growth rate
  devto_signal      × 0.10 +    // Article reactions, comments
  news_signal       × 0.10 +    // News article mentions
  job_signal        × 0.10      // Job listing growth
) × time_decay_factor

Time decay: Recent data weighs more than old data.
- Today's data: weight 1.0
- 3 days ago: weight 0.7
- 7 days ago: weight 0.4
- 14 days ago: weight 0.1

Example calculation for "Rust":
- GitHub: 1200 new stars this week → signal = 85/100
- HN: 5 front page stories → signal = 90/100
- SO: +26.5% question growth → signal = 78/100
- Dev.to: 12 articles with 500+ total reactions → signal = 65/100
- News: 3 major articles → signal = 70/100
- Jobs: +8% job growth → signal = 55/100

trend_score = (85×0.25 + 90×0.25 + 78×0.20 + 65×0.10 + 70×0.10 + 55×0.10)
           = (21.25 + 22.5 + 15.6 + 6.5 + 7.0 + 5.5)
           = 78.35
```

### Step 3: Velocity Calculation
```
Velocity = how FAST a technology's score is changing.

velocity = (current_week_score - last_week_score) / last_week_score × 100

Examples:
- Rust: score was 65 last week, now 78 → velocity = +20% (RISING)
- jQuery: score was 30 last week, now 25 → velocity = -16.7% (DECLINING)
- React: score was 90 last week, now 91 → velocity = +1.1% (STABLE)

Classification:
- velocity > +15%  → 🚀 RISING FAST
- velocity > +5%   → 📈 RISING
- velocity -5% to +5% → ➡️ STABLE
- velocity < -5%   → 📉 DECLINING
- velocity < -15%  → ⬇️ DECLINING FAST
```

### Step 4: Category Ranking
```
Technologies are ranked within their categories:

Frontend Frameworks:
1. React      - score: 91 - velocity: +1.1% (STABLE)
2. Next.js    - score: 85 - velocity: +8.2% (RISING)
3. Vue        - score: 72 - velocity: -2.1% (STABLE)
4. Svelte     - score: 68 - velocity: +12.5% (RISING)
5. Angular    - score: 60 - velocity: -4.8% (STABLE)

Programming Languages:
1. Python     - score: 95 - velocity: +2.3% (STABLE)
2. TypeScript - score: 88 - velocity: +5.5% (RISING)
3. Rust       - score: 78 - velocity: +20% (RISING FAST)
4. Go         - score: 74 - velocity: +3.1% (STABLE)
5. Java       - score: 70 - velocity: -1.2% (STABLE)

// ... more categories: Backend, Mobile, DevOps, AI/ML, Databases, etc.
```

### Step 5: Store in Database
```
All processed data goes into Supabase:

Table: technologies
- id, name, slug, category, ecosystem, logo_url, description

Table: trend_snapshots (one row per technology per day)
- id, technology_id, date, trend_score, velocity, rank_in_category
- github_score, hn_score, so_score, devto_score, news_score, job_score

Table: mentions (individual data points)
- id, technology_id, source, title, url, score, created_at

Table: job_market
- id, technology_id, date, total_jobs, avg_salary, remote_percentage, growth_rate

Table: daily_digest
- id, date, top_rising, top_declining, biggest_mover, summary_text
```

---

## PHASE 3: OUTPUT — What the User Sees on the Website

---

### PAGE 1: LANDING PAGE (Already Built)
```
URL: /

What's shown:
- Hero section with value proposition
- 6-feature bento grid
- CTA to "Get Started" → goes to /dashboard
- Already built and working
```

---

### PAGE 2: DASHBOARD (Main Hub)
```
URL: /dashboard

┌──────────────────────────────────────────────────────────────┐
│  Header: Logo | Search (Ctrl+K) | Theme Toggle | Profile    │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  STAT CARDS (4 cards across the top)              │
│          │  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐
│ Dashboard│  │Technologies││ Rising     ││ Declining  ││ Jobs       │
│ Trending │  │ Tracked    ││ This Week  ││ This Week  ││ Tracked    │
│ Jobs     │  │   247      ││    18 📈   ││    7 📉    ││  52,400    │
│ Roadmap  │  └────────────┘└────────────┘└────────────┘└────────────┘
│ Search   │                                                   │
│ Settings │  TREND CHART (Main area chart)                    │
│          │  ┌──────────────────────────────────────────────┐ │
│          │  │  📈 Technology Trends - Last 30 Days         │ │
│          │  │                                              │ │
│          │  │  Lines showing: React, Rust, Python, etc.    │ │
│          │  │  X-axis: dates                               │ │
│          │  │  Y-axis: trend score (0-100)                 │ │
│          │  │  Hover: shows exact score + date             │ │
│          │  └──────────────────────────────────────────────┘ │
│          │                                                   │
│          │  ┌──────────────────────┐┌──────────────────────┐ │
│          │  │ 🚀 TOP RISING       ││ 📰 LATEST MENTIONS  │ │
│          │  │                      ││                      │ │
│          │  │ 1. Rust    +20% 🔥  ││ "Why Rust is the     │ │
│          │  │ 2. Svelte  +12%     ││  future" - HN        │ │
│          │  │ 3. Bun     +11%     ││  342 pts · 2h ago    │ │
│          │  │ 4. Next.js +8%      ││                      │ │
│          │  │ 5. Deno    +7%      ││ "TypeScript 6.0      │ │
│          │  │                      ││  released" - Dev.to  │ │
│          │  │ Each item has:       ││  89 reactions · 5h   │ │
│          │  │ - Name + logo        ││                      │ │
│          │  │ - Velocity %         ││ "Python vs Rust for  │ │
│          │  │ - Mini sparkline     ││  CLI tools" - Reddit │ │
│          │  │ - Click → detail     ││  189 comments · 8h   │ │
│          │  └──────────────────────┘└──────────────────────┘ │
│          │                                                   │
│          │  TECHNOLOGY TAG CLOUD                             │
│          │  ┌──────────────────────────────────────────────┐ │
│          │  │                                              │ │
│          │  │    React    Python        TypeScript         │ │
│          │  │         Rust     Go    Next.js               │ │
│          │  │   Docker    AI    Svelte     Node.js         │ │
│          │  │      Kubernetes   Vue    PostgreSQL          │ │
│          │  │                                              │ │
│          │  │ (bigger text = higher trend score)           │ │
│          │  └──────────────────────────────────────────────┘ │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘

Interactive elements:
- Click any technology → goes to /technologies/[slug]
- Hover stat cards → animated countup numbers
- Chart is interactive → hover shows tooltip with data
- Tag cloud → click any tag → goes to its detail page
- "Latest Mentions" → click → opens source link in new tab
- Time range selector on chart: 7D | 30D | 90D | 1Y
```

---

### PAGE 3: TRENDING TECHNOLOGIES LIST
```
URL: /technologies

┌──────────────────────────────────────────────────────────────┐
│  Filters: [All Categories ▾] [Time: 7 Days ▾] [Sort: Score ▾]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TECHNOLOGY TABLE (sortable, filterable, paginated)          │
│                                                              │
│  ┌──────┬────────┬──────────┬─────────┬────────┬──────────┐ │
│  │ Rank │ Name   │ Category │ Score   │Velocity│ Trend    │ │
│  ├──────┼────────┼──────────┼─────────┼────────┼──────────┤ │
│  │  1   │🐍 Python│ Language │ 95/100  │ +2.3%  │ ~~~~~~~~ │ │
│  │  2   │⚛️ React │ Frontend │ 91/100  │ +1.1%  │ ~~~~~~~~ │ │
│  │  3   │🔷 TS   │ Language │ 88/100  │ +5.5%  │ ~~~~~~~~ │ │
│  │  4   │▲ Next  │ Frontend │ 85/100  │ +8.2%  │ ~~~~~~~~ │ │
│  │  5   │🦀 Rust │ Language │ 78/100  │ +20.0% │ ~~~~~~~~ │ │
│  │  6   │🐹 Go   │ Language │ 74/100  │ +3.1%  │ ~~~~~~~~ │ │
│  │  7   │🟢 Vue  │ Frontend │ 72/100  │ -2.1%  │ ~~~~~~~~ │ │
│  │  8   │☕ Java  │ Language │ 70/100  │ -1.2%  │ ~~~~~~~~ │ │
│  │  9   │🔥 Svelte│ Frontend │ 68/100  │+12.5%  │ ~~~~~~~~ │ │
│  │  10  │🐳Docker│ DevOps   │ 66/100  │ +0.8%  │ ~~~~~~~~ │ │
│  └──────┴────────┴──────────┴─────────┴────────┴──────────┘ │
│                                                              │
│  The "Trend" column shows a mini sparkline chart             │
│  (last 7 days of scores as a tiny line graph)                │
│                                                              │
│  Pagination: ← 1 2 3 4 5 ... 25 →                           │
│                                                              │
│  Each row is clickable → goes to /technologies/[slug]        │
│                                                              │
│  CATEGORY TABS above the table:                              │
│  [All] [Languages] [Frontend] [Backend] [Mobile]             │
│  [DevOps] [Databases] [AI/ML] [Tools]                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 4: TECHNOLOGY DETAIL PAGE
```
URL: /technologies/rust (example)

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  🦀 RUST                                                     │
│  Programming Language · Rust Ecosystem                       │
│  Score: 78/100 · Velocity: +20% 🚀 RISING FAST              │
│  [Add to Watchlist ⭐]                                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TREND CHART (Large)                                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                                                          ││
│  │  Trend Score over time (line chart)                      ││
│  │  Shows: last 90 days of daily scores                     ││
│  │  Overlay: key events (major releases, viral posts)       ││
│  │  Toggle: [Score] [GitHub Stars] [HN Mentions] [SO Qs]   ││
│  │                                                          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  SOURCE BREAKDOWN (How the score is calculated)              │
│  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐   │
│  │ GitHub     ││ Hacker News││ Stack Ovflw ││ Dev.to     │   │
│  │ Score: 85  ││ Score: 90  ││ Score: 78  ││ Score: 65  │   │
│  │            ││            ││            ││            │   │
│  │ 1.2k stars ││ 5 stories  ││ +26% ques. ││ 12 articles│   │
│  │ this week  ││ this week  ││ this week  ││ this week  │   │
│  │            ││            ││            ││            │   │
│  │ [View on   ││ [View on   ││ [View on   ││ [View on   │   │
│  │  GitHub →] ││  HN →]     ││  SO →]     ││  Dev.to →] │   │
│  └────────────┘└────────────┘└────────────┘└────────────┘   │
│                                                              │
│  RADAR CHART (Comparison with similar tech)                  │
│  ┌──────────────────────────┐                                │
│  │     Community             │  Comparing: Rust vs Go vs C++ │
│  │       /    \              │                                │
│  │  Jobs ─────── GitHub     │  Each axis:                    │
│  │       \    /              │  - Community (HN + Dev.to)     │
│  │     Learning              │  - GitHub (stars + forks)      │
│  │                           │  - Learning (SO questions)     │
│  │  Three overlapping        │  - Jobs (job listings)         │
│  │  polygons on radar        │  - News (article mentions)     │
│  └──────────────────────────┘                                │
│                                                              │
│  JOB MARKET                                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Total Jobs: 8,200 · Avg Salary: $145,000 · Remote: 62%  ││
│  │ Growth: +8% vs last month                                ││
│  │                                                          ││
│  │ Top hiring: Google, Amazon, Microsoft, Cloudflare, Meta  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  RECENT MENTIONS (Feed of articles/posts about this tech)    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📰 "Why Rust is replacing C++ at Google" - HN           ││
│  │    342 points · 189 comments · 2 hours ago               ││
│  │                                                          ││
│  │ 📝 "Getting Started with Rust in 2026" - Dev.to         ││
│  │    89 reactions · 23 comments · 5 hours ago              ││
│  │                                                          ││
│  │ 💼 "Rust Developer" - Google (via Adzuna)                ││
│  │    $150k-$200k · Remote · Posted 1 day ago               ││
│  │                                                          ││
│  │ ❓ "How to handle async in Rust?" - Stack Overflow       ││
│  │    45 votes · 12 answers · 3 hours ago                   ││
│  │                                                          ││
│  │ [Load More...]                                           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  RELATED TECHNOLOGIES                                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │  Go  │ │ C++  │ │ Zig  │ │WebAsm│                        │
│  │  74  │ │  55  │ │  42  │ │  38  │                        │
│  └──────┘ └──────┘ └──────┘ └──────┘                        │
│  (Click any → goes to that tech's page)                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 5: JOB MARKET INSIGHTS
```
URL: /jobs

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  JOB MARKET OVERVIEW                                         │
│                                                              │
│  STAT CARDS                                                  │
│  ┌────────────┐┌────────────┐┌────────────┐┌────────────┐   │
│  │Total Jobs  ││ Most In-   ││ Highest    ││ Most Remote│   │
│  │ Tracked    ││ Demand     ││ Paying     ││ Friendly   │   │
│  │  52,400    ││ React      ││ Rust $155k ││ Go (78%)   │   │
│  └────────────┘└────────────┘└────────────┘└────────────┘   │
│                                                              │
│  BAR CHART: Jobs per Technology (Top 15)                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ React        ████████████████████████ 14,500             ││
│  │ Python       ███████████████████████ 13,800              ││
│  │ TypeScript   ████████████████████ 12,200                 ││
│  │ Java         ██████████████████ 11,000                   ││
│  │ AWS          █████████████████ 10,500                    ││
│  │ Node.js      ████████████████ 9,800                     ││
│  │ Go           ████████████ 8,200                          ││
│  │ Rust         ████████████ 8,000                          ││
│  │ Kubernetes   ███████████ 7,500                           ││
│  │ Docker       ██████████ 6,800                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  SALARY COMPARISON TABLE                                     │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────┐ │
│  │Technology│ Avg Salary│ Jobs     │ Remote % │ Growth     │ │
│  ├──────────┼──────────┼──────────┼──────────┼────────────┤ │
│  │ Rust     │ $155,000 │ 8,000    │ 62%      │ +15%       │ │
│  │ Go       │ $150,000 │ 8,200    │ 78%      │ +8%        │ │
│  │ React    │ $125,000 │ 14,500   │ 55%      │ +13%       │ │
│  │ Python   │ $130,000 │ 13,800   │ 48%      │ +5%        │ │
│  │ ...      │          │          │          │            │ │
│  └──────────┴──────────┴──────────┴──────────┴────────────┘ │
│                                                              │
│  HEATMAP: Demand by Technology × Month (Last 12 Months)      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │        Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec   ││
│  │ React  [8] [8] [8] [9] [9] [9] [9] [8] [9] [9] [9] [9]││
│  │ Python [7] [7] [8] [8] [8] [8] [8] [8] [9] [9] [9] [9]││
│  │ Rust   [4] [4] [5] [5] [5] [6] [6] [6] [7] [7] [8] [8]││
│  │ Go     [6] [6] [6] [6] [7] [7] [7] [7] [7] [7] [7] [7]││
│  │                                                          ││
│  │ (Color intensity = demand level, darker = more jobs)     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  RISING JOB DEMAND (Technologies with fastest growing jobs)  │
│  1. Rust +15% · 2. React +13% · 3. AI/ML +12%              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 6: LEARNING ROADMAP
```
URL: /roadmap

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  WHAT SHOULD YOU LEARN NEXT?                                 │
│  Based on current market trends and your interests           │
│                                                              │
│  YOUR TECH STACK (User selects what they already know)       │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ [JavaScript ✓] [React ✓] [Node.js ✓] [+ Add more]      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  RECOMMENDED FOR YOU                                         │
│  (Based on your stack + market trends)                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🥇 PRIORITY 1: TypeScript                                ││
│  │                                                          ││
│  │ Why: You know JavaScript. TypeScript is trending +5.5%   ││
│  │ and appears in 82% of React job listings.                ││
│  │                                                          ││
│  │ Job impact: +$15k avg salary boost over plain JS         ││
│  │ Difficulty: Easy (you already know JS)                   ││
│  │ Time to learn: ~2 weeks                                  ││
│  │ Market demand: ████████████████████ 12,200 jobs          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🥈 PRIORITY 2: Next.js                                   ││
│  │                                                          ││
│  │ Why: You know React. Next.js is the #1 React framework, ││
│  │ trending +8.2% and 67% of new React jobs mention it.    ││
│  │                                                          ││
│  │ Job impact: +$10k avg salary boost                       ││
│  │ Difficulty: Medium                                       ││
│  │ Time to learn: ~3 weeks                                  ││
│  │ Market demand: ████████████████ 9,800 jobs               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🥉 PRIORITY 3: Rust                                      ││
│  │                                                          ││
│  │ Why: Fastest rising language (+20%). High salary premium.││
│  │ Not directly related to your stack but high ROI.         ││
│  │                                                          ││
│  │ Job impact: +$30k avg salary vs JavaScript               ││
│  │ Difficulty: Hard                                         ││
│  │ Time to learn: ~3 months                                 ││
│  │ Market demand: ████████████ 8,000 jobs                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  SKILL RADAR (Your skills vs market demand)                  │
│  ┌──────────────────────────┐                                │
│  │     Frontend              │  Blue polygon = Your skills   │
│  │       /    \              │  Orange polygon = Market demand│
│  │  Backend ─── DevOps      │                                │
│  │       \    /              │  Gaps between blue and orange  │
│  │     Data/ML               │  = learning opportunities     │
│  └──────────────────────────┘                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 7: SEARCH (Ctrl+K Command Palette)
```
Trigger: Press Ctrl+K anywhere on the site

┌──────────────────────────────────────────────────────────────┐
│  🔍 Search technologies, jobs, articles...                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ rust                                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  TECHNOLOGIES                                                │
│  🦀 Rust · Score: 78 · +20% · Programming Language           │
│  ⚙️ Rust Analyzer · Score: 42 · +5% · Developer Tool         │
│                                                              │
│  RECENT MENTIONS                                             │
│  📰 "Why Rust is replacing C++" · Hacker News · 2h ago      │
│  📝 "Rust for beginners" · Dev.to · 5h ago                   │
│                                                              │
│  JOBS                                                        │
│  💼 Rust Developer · Google · $150k-$200k                    │
│  💼 Systems Engineer (Rust) · Cloudflare · $140k-$180k      │
│                                                              │
│  Press Enter to select · ↑↓ to navigate · Esc to close      │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 8: TECHNOLOGY COMPARISON
```
URL: /compare?tech=react,vue,svelte

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  COMPARE TECHNOLOGIES                                        │
│  [React ✕] [Vue ✕] [Svelte ✕] [+ Add technology]           │
│                                                              │
│  LINE CHART: Trend Scores Over Time                          │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Three lines showing React vs Vue vs Svelte              ││
│  │  over the last 90 days                                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  COMPARISON TABLE                                            │
│  ┌──────────────┬──────────┬──────────┬──────────┐          │
│  │ Metric       │ React    │ Vue      │ Svelte   │          │
│  ├──────────────┼──────────┼──────────┼──────────┤          │
│  │ Trend Score  │ 91       │ 72       │ 68       │          │
│  │ Velocity     │ +1.1%    │ -2.1%    │ +12.5%   │          │
│  │ GitHub Stars │ 230k     │ 210k     │ 82k      │          │
│  │ Jobs         │ 14,500   │ 4,200    │ 1,800    │          │
│  │ Avg Salary   │ $125k    │ $118k    │ $122k    │          │
│  │ SO Questions │ 450k     │ 120k     │ 35k      │          │
│  │ HN Mentions  │ 12/week  │ 4/week   │ 6/week   │          │
│  └──────────────┴──────────┴──────────┴──────────┘          │
│                                                              │
│  RADAR CHART: Multi-dimension comparison                     │
│  (Same as technology detail page but with 3 overlays)        │
│                                                              │
│  VERDICT (AI-generated summary)                              │
│  "React dominates in job market and community size.          │
│   Svelte is the fastest growing with +12.5% velocity.        │
│   Vue is stable but showing slight decline."                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### PAGE 9: SETTINGS / PROFILE (If user is logged in)
```
URL: /settings

- Select your current tech stack
- Set notification preferences
- Choose categories to follow
- Email digest preferences (weekly/daily/off)
- Watchlist management
- Theme preferences
- Export data (CSV/PDF)
```

---

## DATA REFRESH CYCLE

```
Every 4 hours (via Vercel Cron):
├── Fetch from GitHub API (trending repos, star counts)
├── Fetch from Hacker News (top stories, search)
├── Fetch from Stack Overflow (tag stats, trending)
├── Fetch from Dev.to (top articles by tag)
├── Fetch from NewsAPI (tech news)
├── Fetch from Adzuna (job listings)
├── Fetch from JSearch (supplementary jobs)
│
├── Run technology extraction on all new data
├── Calculate trend scores for all technologies
├── Calculate velocity (compare with previous scores)
├── Update rankings per category
├── Store everything in Supabase
│
└── Dashboard auto-refreshes via Supabase real-time subscriptions

Daily (once per day):
├── Generate daily digest (top rising, declining, biggest mover)
├── Calculate weekly summaries
├── Update learning roadmap recommendations
└── Send email digests to subscribed users (later feature)
```

---

## SUMMARY: What Makes This Valuable

The user doesn't visit 7 different websites. They visit ONE dashboard and see:

1. **What's trending RIGHT NOW** — across all sources, scored and ranked
2. **How fast things are changing** — velocity shows if something is a flash or a real trend
3. **Why it's trending** — source breakdown shows exactly where the signal comes from
4. **What it means for jobs** — direct correlation between trending tech and job market
5. **What to learn next** — personalized recommendations based on their existing skills
6. **Transparent scoring** — every score is explainable, every source is linked
7. **Historical context** — not just "what's hot today" but "how has this changed over months"

The data is REAL, from REAL sources, updated every 4 hours. Not opinions. Not vibes. Data.
