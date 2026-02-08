# DevTrends - Data Sources & Setup Plan

## DATA SOURCES YOU NEED (Platform by Platform)

### 1. Technology Trend Data (The Core)

| Platform | What You Get | API Access | Cost | Difficulty |
|----------|-------------|------------|------|------------|
| **Hacker News (Algolia API)** | Tech discussions, what devs are talking about | Free, no key needed | Free | Easy |
| **GitHub Trending / GitHub API** | Trending repos, stars, language popularity | Free with token (5000 req/hr) | Free | Easy |
| **Stack Overflow API** | Tag trends, question volume per technology | Free (300 req/day), key gets 10k/day | Free | Easy |
| **Reddit API** (r/programming, r/webdev, etc.) | Community sentiment, discussions | Free but requires OAuth app registration | Free | Medium |
| **Dev.to API** | Blog post trends, tag popularity | Free, no key needed | Free | Easy |

**Verdict: All free and accessible. These 5 alone give you a solid "technology trending" engine.**

---

### 2. Job Market Insights (Career Intelligence)

| Platform | What You Get | API Access | Cost | Difficulty |
|----------|-------------|------------|------|------------|
| **LinkedIn Jobs** | Job postings, skill demands | **No public API** - need scraping or paid partner access | Expensive/Hard | Hard |
| **Indeed API** | Job listings by tech/skill | **Deprecated** their public API | Dead | N/A |
| **Adzuna API** | Job listings across countries | Free tier (250 req/month) | Free tier exists | Medium |
| **The Muse API** | Tech company job listings | Free, API key needed | Free | Easy |
| **Remotive API** | Remote tech jobs | Free, no key needed | Free | Easy |
| **JSearch (via RapidAPI)** | Aggregated job data from multiple sources | Free tier (500 req/month) | Free tier | Medium |
| **Arbeitnow API** | Tech jobs (GitHub Jobs replacement) | Free | Free | Easy |

**Verdict: Job data is the HARDEST part. LinkedIn/Indeed are locked down. Use Adzuna + JSearch + Remotive as alternatives. Won't be perfect but enough for a solid MVP.**

---

### 3. News & Content Sources

| Platform | What You Get | API Access | Cost | Difficulty |
|----------|-------------|------------|------|------------|
| **NewsAPI** | Tech news articles | Free for dev (100 req/day), paid for prod | Free (dev) / $449/mo (prod) | Easy |
| **RSS Feeds** (TechCrunch, Verge, Ars Technica) | Tech news | Free, no key needed | Free | Easy |
| **Product Hunt API** | New tools/products trending | Free with OAuth | Free | Medium |

**Verdict: NewsAPI free tier is enough for development. RSS feeds are unlimited and free.**

---

### 4. AI/NLP for Technology Extraction

| Service | What It Does | Cost | Difficulty |
|---------|-------------|------|------------|
| **OpenAI API (GPT-4o-mini)** | Extract tech names from articles, classify trends | ~$0.15/1M input tokens | Medium |
| **Claude API** | Same as above, better reasoning | ~$0.25/1M input tokens (Haiku) | Medium |
| **Local regex + keyword matching** | Basic tech name extraction, zero cost | Free | Easy (but less accurate) |

**Verdict: Start with keyword matching (free), upgrade to AI later if needed.**

---

## HONEST ASSESSMENT

### What's Easy (Green Light)
- **Tech trend data** - Hacker News, GitHub, Stack Overflow, Dev.to are all free and well-documented
- **Database** - Supabase free tier is more than enough
- **Deployment** - Vercel free tier handles everything
- **Frontend** - Already have a solid landing page

### What's Medium (Needs Work But Doable)
- **Aggregation logic** - Combining data from 5+ sources into a unified "trend score"
- **Scheduled data collection** - Cron jobs to fetch data every few hours
- **Technology taxonomy** - Building a list of 200+ technologies to track

### What's Hard (The Real Challenges)
- **Job market data** - Good job APIs are dead or expensive. Limited data here
- **"Skill velocity" accuracy** - Making trend predictions that actually make sense
- **Real-time feel** - Making it feel live when data is actually fetched in batches

---

## WHAT YOU NEED TO ARRANGE

### Step 1: Sign Up & Get Keys (~30 min)
- [ ] Create **Supabase** project → get URL + anon key (https://supabase.com)
- [ ] Create **GitHub** personal access token (https://github.com/settings/tokens)
- [ ] Register **Stack Overflow** app → get key (https://stackapps.com/apps/oauth/register)
- [ ] Register **Reddit** app → get client ID + secret (https://www.reddit.com/prefs/apps)
- [ ] Register **NewsAPI** → get key (https://newsapi.org/register)
- [ ] Register **Adzuna** developer account → get app ID + key (https://developer.adzuna.com)
- [ ] Register **RapidAPI** + subscribe to JSearch free tier → get key (https://rapidapi.com)

### Step 2: Nice-to-Have (Not Blocking)
- [ ] OpenAI or Claude API key (for smart tech extraction later)
- [ ] Resend or SendGrid account (for email digests later)
- [ ] Upstash Redis (for caching/rate limiting, free tier)

### Step 3: Accounts You Already Need
- [ ] **Vercel** account for deployment (https://vercel.com)

---

## SCOPE DECISION (Pick for MVP)

Which features to include in the MVP?

- [ ] Technology trend tracking (mentions, velocity, charts)
- [ ] Job market correlation
- [ ] Learning roadmap / "what to learn next"
- [ ] Weekly email digest
- [ ] User accounts & personalization

---

## WHAT GETS BUILT

Once keys and scope are decided:
1. Database schema in Supabase
2. Data collection pipelines (serverless functions)
3. Dashboard pages with real charts
4. Trend algorithm (time-decay scoring across sources)
5. Full app beyond the landing page
