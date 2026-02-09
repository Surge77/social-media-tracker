# DevTrends — Build Guide & Testing Strategy

> **Purpose:** Step-by-step build sequence with testing checkpoints.
> **Rule:** Follow this file during development. Don't skip phases. Don't jump layers.

---

## THE GOLDEN RULE

```
LAYER 5:  Frontend Pages        ← build LAST
LAYER 4:  API Routes            ← only after scoring works
LAYER 3:  Scoring Engine        ← only after data exists
LAYER 2:  Data Fetchers         ← only after DB + types exist
LAYER 1:  Foundation            ← build FIRST
```

**Never jump layers.** Don't write UI code while your fetchers are broken. Don't design charts before you have real data. Build bottom-up.

---

## PHASE 1: FOUNDATION (Day 1-2)

### What to build
1. Install packages: `npm install rss-parser wink-sentiment simple-statistics`
2. Run database migrations (all 4 tables + indexes + RLS policies from MVP_SPEC Section 3)
3. Create `src/types/index.ts` (copy from MVP_SPEC Section 12)
4. Create `src/lib/supabase/server.ts` (copy from MVP_SPEC Section 13)
5. Create `src/lib/supabase/client.ts` (copy from MVP_SPEC Section 13)
6. Create `src/lib/supabase/admin.ts` (copy from MVP_SPEC Section 13)
7. Create `vercel.json` with cron config (copy from MVP_SPEC Section 9)
8. Create `src/lib/constants/technologies.ts` — all 100 technology entries as a TypeScript array
9. Seed the `technologies` table in Supabase with all 100 rows

### What NOT to do
- Do NOT touch any frontend/component files
- Do NOT write any data fetching logic
- Do NOT think about UI design

### TESTING CHECKPOINT 1 — Manual verification

**Test A: Database tables exist**
```
Open Supabase Dashboard → Table Editor
Verify these tables exist: technologies, data_points, daily_scores, fetch_logs
Verify technologies has 100 rows
Click a few rows — verify slug, name, category, stackoverflow_tag, color are all populated
```

**Test B: Supabase client works from Next.js**
Create a temporary file `src/app/api/test/route.ts`:
```typescript
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('technologies')
    .select('slug, name, category')
    .limit(5)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ count: data.length, sample: data })
}
```
Run `npm run dev`, open `http://localhost:3000/api/test` in browser.
Expected: JSON with 5 technologies. If you see this, Phase 1 is done.

**Delete the test route after verification.** Don't leave test files around.

### Phase 1 is DONE when:
- [ ] `npm run dev` starts without errors
- [ ] Supabase has 4 tables, technologies has 100 rows
- [ ] API test route returns real data from Supabase
- [ ] All TypeScript types compile without errors
- [ ] Git commit: "Phase 1: Foundation — database, types, Supabase clients"

---

## PHASE 2: DATA PIPELINE (Day 3-6)

### Build order (strictly sequential — finish each before starting next)

#### Step 1: Sentiment helper
Build `src/lib/scoring/sentiment.ts` first because multiple fetchers need it.

**Test:** Quick inline test in a temp route:
```typescript
import { analyzeSentiment } from '@/lib/scoring/sentiment'

export async function GET() {
  const results = {
    positive: analyzeSentiment("React 19 is incredible and fast"),
    negative: analyzeSentiment("This framework is terrible and broken"),
    neutral: analyzeSentiment("Version 2.0 was released today"),
  }
  return Response.json(results)
  // Expected: positive > 0.6, negative < 0.4, neutral ≈ 0.5
}
```

#### Step 2: GitHub fetcher
Build `src/lib/api/github.ts`

**Test:** Temp route:
```typescript
import { fetchGitHubData } from '@/lib/api/github'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createSupabaseAdminClient()
  const { data: techs } = await supabase
    .from('technologies')
    .select('*')
    .not('github_repo', 'is', null)
    .limit(3) // Test with 3 techs only, not all 100

  const result = await fetchGitHubData(techs!)
  return Response.json({
    dataPoints: result.dataPoints.length,
    errors: result.errors,
    sample: result.dataPoints.slice(0, 2)
  })
}
```
**Verify:**
- `dataPoints` count > 0
- Each data point has `technology_id`, `source: "github"`, `metric`, `value`, `measured_at`
- No errors (or only expected ones like 404 for renamed repos)

#### Step 3: npm downloads fetcher
Build the npm portion of `src/lib/api/packages.ts`

**Test:** Same pattern as GitHub — temp route, limit to 3 techs, verify data points come back.
```
Expected: { metric: "downloads", value: 28000000 } for React
```

#### Step 4: HN Algolia fetcher
Build `src/lib/api/hackernews.ts`

**Test:** Same pattern.
```
Expected: { metric: "mentions", value: 47 } type numbers
Also verify sentiment values are between 0 and 1
Also verify metadata.top_stories has titles and URLs
```

#### Step 5: Stack Overflow fetcher
Build `src/lib/api/stackoverflow.ts`

**Test:** Pay special attention to URL-encoded tags (C#, C++).
```
Verify: c%23 and c%2B%2B tags work correctly
```

#### Step 6: Dev.to fetcher
Build `src/lib/api/devto.ts`

**Test:** Check rate limiting (1s delay between requests).

#### Step 7: RSS feed parser
Build `src/lib/api/rss.ts`

**Test:** Parse 2-3 feeds only (HN Best, Lobste.rs, JavaScript Weekly).
```
Verify: Technology mentions are detected in article titles
Verify: Feeds that are down/broken are skipped gracefully, not crashing
```

#### Step 8: Reddit fetcher
Build `src/lib/api/reddit.ts`

**Test:** If Reddit credentials are not set, verify it returns empty results without crashing.
If credentials exist, test with 2-3 subreddits.

#### Step 9: Job fetchers
Build `src/lib/api/jobs.ts` (Adzuna, JSearch, Remotive, Arbeitnow)

**Test:** Use only 1 query per source (not 5) during testing to conserve API limits.
```
Verify: Job counts are attributed to correct technologies
Verify: Technologies mentioned in job titles/descriptions are matched
```

#### Step 10: NewsAPI fetcher
Build `src/lib/api/news.ts`

**Test:** 1 broad query, verify results.

#### Step 11: Wire all fetchers into cron routes
Build `/api/cron/fetch-daily/route.ts` and `/api/cron/fetch-weekly/route.ts`

#### Step 12: Scoring engine
Build all files in `src/lib/scoring/`:
- `normalize.ts` (z-score, min-max)
- `composite.ts` (sub-scores + composite)
- `momentum.ts` (rate of change)
- `bayesian.ts` (smoothing)

Wire scoring into the daily cron (runs after all fetchers).

### TESTING CHECKPOINT 2 — Full pipeline test

**Test A: Run the daily cron manually**
```
Open browser: http://localhost:3000/api/cron/fetch-daily
Wait for it to complete (may take 30-60 seconds)
Check the JSON response for success/failure per source
```

**Test B: Verify data in Supabase**
```
Open Supabase Dashboard → Table Editor → data_points
Expected: 300-800 rows (depending on how many sources succeeded)
Check: Multiple sources present (github, hackernews, npm, stackoverflow, etc.)
Check: Values are reasonable (React stars > 200000, npm downloads in millions)
```

**Test C: Verify scores in Supabase**
```
Open Supabase Dashboard → Table Editor → daily_scores
Expected: 100 rows (one per technology) for today's date
Check: composite_score values are between 0 and 100
Check: React/Python/TypeScript should have high scores (60+)
Check: Niche techs like Zig/Haskell should have lower scores
Check: data_completeness varies (some techs have more sources than others)
```

**Test D: Verify fetch logs**
```
Open Supabase Dashboard → Table Editor → fetch_logs
Expected: One row per source that ran
Check: status is "success" or "partial" (not all "failed")
Check: duration_ms is reasonable (not 0, not 999999)
```

**Test E: Run the weekly cron manually**
```
Open browser: http://localhost:3000/api/cron/fetch-weekly
Verify job data and news data land in data_points
```

### Phase 2 is DONE when:
- [ ] All 9+ fetchers work individually (tested with temp routes)
- [ ] Daily cron runs end-to-end without crashing
- [ ] data_points has 300+ rows with real data
- [ ] daily_scores has 100 rows with reasonable scores
- [ ] fetch_logs shows mostly "success" status
- [ ] Temp test routes are DELETED
- [ ] Git commit: "Phase 2: Data pipeline — all fetchers + scoring engine"

---

## PHASE 3: API ROUTES (Day 7)

### Build order
1. `GET /api/technologies` — list all with latest scores
2. `GET /api/technologies/[slug]` — single tech detail
3. `GET /api/technologies/[slug]/chart` — time-series data
4. `GET /api/compare` — multi-tech comparison

### TESTING CHECKPOINT 3 — API route verification

**Test each route in the browser:**

```
http://localhost:3000/api/technologies
Expected: JSON array of 100 technologies with scores, sparkline arrays

http://localhost:3000/api/technologies/react
Expected: Full detail for React — scores, chart_data, latest_signals, related_technologies

http://localhost:3000/api/technologies/react/chart?period=30d
Expected: Array of {date, composite, github, community, jobs, ecosystem} objects

http://localhost:3000/api/compare?techs=react,vue,svelte
Expected: 3 technologies with scores + chart_data overlay

http://localhost:3000/api/compare?techs=react
Expected: 400 error (need at least 2 techs)

http://localhost:3000/api/technologies/nonexistent-tech
Expected: 404 error with helpful message
```

**What to check in each response:**
- All fields from MVP_SPEC Section 8 are present
- No `null` where a number is expected (except for techs with no data)
- Dates are formatted as "2026-01-15" (ISO date strings)
- Scores are between 0 and 100
- Sparkline arrays have up to 30 numbers

### Phase 3 is DONE when:
- [ ] All 4 API routes return correct JSON
- [ ] Error cases (404, 400) are handled gracefully
- [ ] Response shapes match MVP_SPEC Section 8 exactly
- [ ] Git commit: "Phase 3: API routes — all endpoints serving real data"

---

## PHASE 4: FRONTEND (Day 8-13)

### Build order

#### Step 1: Shared components (Day 8 morning)
These are small, reusable, used on every page:
- `ScoreBadge.tsx` — colored number (0-100)
- `CategoryBadge.tsx` — category label with color
- `MomentumBadge.tsx` — up/down/stable arrow
- `ConfidenceBadge.tsx` — High/Medium/Low
- `DataFreshness.tsx` — "Updated 3 hours ago"
- `Sparkline.tsx` — tiny inline chart

#### Step 2: Technology Explorer page (Day 8-9)
- `TechFilters.tsx` — search input + category dropdown
- `TechTable.tsx` — sortable table (desktop)
- `TechCard.tsx` — card layout (mobile)
- `src/app/technologies/page.tsx` — the page itself

**Test:** Open `http://localhost:3000/technologies`
- [ ] Table shows 100 technologies with real scores
- [ ] Sorting by score/name/momentum works
- [ ] Category filter works
- [ ] Search filter works
- [ ] Clicking a row navigates to `/technologies/[slug]`
- [ ] Mobile view shows cards instead of table
- [ ] Dark mode looks correct
- [ ] Empty state shows message if no scores exist

#### Step 3: Technology Detail page (Day 9-10)
- `ScoreBreakdown.tsx` — progress bars for sub-scores
- `TrendChart.tsx` — Recharts line chart with period toggle
- `SourceSignalCard.tsx` — per-source data display
- `RelatedTechnologies.tsx` — grid of similar techs
- `src/app/technologies/[slug]/page.tsx` — the page itself

**Test:** Open `http://localhost:3000/technologies/react`
- [ ] Score breakdown shows 4 sub-scores as progress bars
- [ ] Trend chart renders with real data
- [ ] Period toggle (30d/90d/1yr) switches chart data
- [ ] Source signal cards show real numbers (GitHub stars, npm downloads, etc.)
- [ ] Related technologies section shows same-category techs
- [ ] "Back to Explorer" link works
- [ ] Mobile layout stacks components vertically
- [ ] Dark mode looks correct

#### Step 4: Compare page (Day 10-11)
- `TechSelector.tsx` — add/remove technologies
- `CompareChart.tsx` — multi-line overlay chart
- `CompareTable.tsx` — side-by-side metrics table
- `src/app/compare/page.tsx` — the page itself

**Test:** Open `http://localhost:3000/compare?techs=react,vue,svelte`
- [ ] Chart shows 3 overlapping lines with different colors
- [ ] Comparison table shows all metrics side by side
- [ ] Adding a 4th technology works
- [ ] Removing a technology works
- [ ] Share button copies URL to clipboard
- [ ] URL updates when technologies change
- [ ] Works with 2, 3, and 4 technologies
- [ ] Empty state (no techs param) shows selector

#### Step 5: Methodology page (Day 11)
- `src/app/methodology/page.tsx` — static content

**Test:** Open `http://localhost:3000/methodology`
- [ ] All 10 content sections render correctly
- [ ] Links work
- [ ] Mobile readable

#### Step 6: Navigation updates (Day 11)
- Update `Header.tsx` nav links
- Update landing page CTA buttons
- Add React Query provider to `providers.tsx`

**Test:**
- [ ] "Get Started" on landing page → `/technologies`
- [ ] "Trending" in nav → `/technologies?sort=momentum`
- [ ] All nav links work on all pages
- [ ] Logo links back to `/`

#### Step 7: Polish (Day 12-13)
- Loading skeletons for all pages
- Error boundaries (`error.tsx` files)
- Responsive testing at 375px, 768px, 1280px
- Dark mode verification on every page
- Page titles and meta descriptions
- `generateMetadata` for dynamic routes

### TESTING CHECKPOINT 4 — Full UI walkthrough

Do this manually in the browser. Go through every page, every interaction:

```
1. Open http://localhost:3000 (landing page)
   → Click "Get Started" → should go to /technologies

2. /technologies page
   → Verify 100 technologies with scores
   → Sort by each column
   → Filter by each category
   → Search for "React"
   → Click React row → should go to /technologies/react

3. /technologies/react page
   → Verify all sections render
   → Toggle chart period (30d → 90d → 1yr)
   → Click a related technology → should navigate
   → Click "Back to Explorer" → should go back

4. /compare?techs=react,vue,svelte
   → Verify chart and table
   → Add Angular → URL updates
   → Remove Vue → URL updates
   → Copy share link → paste in new tab → same comparison

5. /methodology
   → Verify content renders
   → Check links work

6. Repeat steps 1-5 on mobile (375px viewport)
7. Repeat steps 1-5 in light mode (toggle theme)
```

### Phase 4 is DONE when:
- [ ] All 5 pages render correctly with real data
- [ ] All interactive elements work (sort, filter, search, chart toggle, compare)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode and light mode both work
- [ ] Loading states show skeletons (not blank screens)
- [ ] Error states show helpful messages (not crashes)
- [ ] All navigation links work
- [ ] `next build --webpack` completes without errors
- [ ] Git commit: "Phase 4: Frontend — all pages complete"

---

## PHASE 5: DEPLOY (Day 14-15)

### Steps
1. Run `next build --webpack` locally — fix any build errors
2. Set all env vars in Vercel dashboard
3. Deploy to Vercel
4. Verify cron jobs trigger (check Vercel Functions logs)
5. Run one manual cron trigger to populate production data
6. Test all pages in production URL
7. Add MIT LICENSE file
8. Update README.md

### TESTING CHECKPOINT 5 — Production verification

```
1. Open your-app.vercel.app
   → Landing page loads
   → Navigate to /technologies → data shows

2. Check Vercel Dashboard → Functions tab
   → Cron jobs are listed
   → Trigger one manually → verify it succeeds

3. Check Supabase Dashboard (production)
   → data_points has rows
   → daily_scores has 100 rows

4. Mobile test on real phone (not just browser dev tools)
   → Open URL on phone
   → Navigate through all pages
```

---

## UI DESIGN STRATEGY

### Don't worry about UI design right now. Here's why:

You're using **shadcn/ui + Tailwind CSS**. This combination produces professional-looking UI out of the box without any design work. The shadcn components (Button, Card, Badge, Table) are already styled with proper spacing, colors, borders, shadows, and dark mode support.

### What the LLM will produce automatically:
- Clean table layouts (shadcn Table or custom Tailwind grid)
- Proper card components (shadcn Card with header, content, footer)
- Consistent spacing (Tailwind's spacing scale: p-4, gap-6, etc.)
- Responsive layouts (Tailwind's sm:/md:/lg: breakpoints)
- Dark mode (already configured with CSS variables)
- Consistent colors (your design tokens in globals.css)
- Professional typography (Geist Sans/Mono fonts already loaded)

### What you SHOULD specify for each page (add to your prompt when building):
```
"Follow the existing design system:
- Use shadcn/ui components (Card, Badge, Button) where appropriate
- Use the existing color tokens (--primary, --muted, --success, --warning)
- Use the chart colors (--chart-1 through --chart-5) for data visualization
- Match the visual style of the existing landing page (Header, BentoFeatures)
- Use Framer Motion for entrance animations, always check useReducedMotion()
- Container max-width 1400px, centered, 2rem padding (already in Tailwind config)"
```

### What you should NOT do:
- Don't try to design a pixel-perfect mockup before coding
- Don't add custom CSS when Tailwind classes exist
- Don't install new UI libraries (no Material UI, no Chakra, no Ant Design)
- Don't spend hours tweaking colors — the design tokens are already defined
- Don't try to make it look like a Dribbble shot — clean and functional wins

### When to care about UI polish:
- **Phase 4, Step 7 (Day 12-13)** — After all pages work with real data
- At that point, you can: adjust spacing, fix alignment, tweak chart colors, add hover effects
- This is a 2-hour polish pass, not a redesign

### If you want a specific visual reference:
Tell the LLM: "Make it look like [Linear](https://linear.app) — clean, minimal, data-dense, good dark mode." Linear is a perfect reference for data-heavy dashboards built with Tailwind-style design.

---

## ANTI-PATTERNS — THINGS THAT WILL WASTE YOUR TIME

### 1. Building UI before data exists
```
BAD:  "Let me design the explorer table first, I'll add real data later"
      → You'll use dummy data, then refactor everything when real data has different shapes
GOOD: Build pipeline → verify real data in Supabase → then build UI using real data
```

### 2. Building all fetchers in parallel
```
BAD:  "I'll write GitHub, HN, and SO fetchers all at once"
      → You'll have 3 half-broken fetchers and no way to tell which one is the problem
GOOD: Build GitHub → test it → verify data in DB → then build HN → test → verify → etc.
```

### 3. Switching between layers mid-task
```
BAD:  "The GitHub fetcher works, let me quickly build the ScoreBadge component..."
      → Now you're context-switching. When you come back to fetchers, you've lost momentum
GOOD: Build ALL fetchers, then ALL scoring, then ALL API routes, then ALL frontend
```

### 4. Over-designing before you have data
```
BAD:  Spending 3 hours picking chart colors and animation timing
GOOD: Get the chart rendering real data with default colors. Polish in Day 12-13.
```

### 5. Fixing one broken fetcher for hours
```
BAD:  Reddit OAuth is failing → spend 4 hours debugging Reddit API
GOOD: Reddit is optional. Skip it, add a TODO comment, move to the next fetcher.
      Reddit not working doesn't block anything. You still have 8 other sources.
```

### 6. Adding features not in the spec
```
BAD:  "What if I add a dark/light chart theme toggle..."
GOOD: Is it in MVP_SPEC.md? No? Then it doesn't exist. Build what's specified.
```

### 7. Not committing after each phase
```
BAD:  Building for 3 days without a single commit
GOOD: Commit after each phase. If something breaks, you can revert to a known good state.
```

### 8. Not checking Supabase after each fetcher
```
BAD:  "I'll build all 9 fetchers then check if the data is correct"
      → 5 fetchers are silently inserting bad data, you won't know which one
GOOD: After each fetcher, open Supabase Dashboard, check the data_points rows it created.
      Are the values reasonable? Are the technology_ids correct? Is measured_at today?
```

---

## DAILY END-OF-DAY CHECKLIST

Before you stop coding each day, verify:

- [ ] `npm run dev` starts without errors
- [ ] No TypeScript errors in terminal
- [ ] Changes are committed to git
- [ ] No half-finished files (either finish them or delete them)
- [ ] No temp test routes left in the codebase
- [ ] You know exactly what to build tomorrow (check this guide)

---

## GIT COMMIT MESSAGES

Use these exact messages after each milestone:

```
Phase 1: "feat: foundation — database schema, types, Supabase clients, seed data"
Phase 2 partial: "feat: data pipeline — GitHub, HN, SO, npm fetchers"
Phase 2 partial: "feat: data pipeline — Dev.to, Reddit, RSS, jobs, news fetchers"
Phase 2 complete: "feat: scoring engine — normalization, composite scores, momentum"
Phase 3: "feat: API routes — technologies, detail, chart, compare endpoints"
Phase 4 partial: "feat: technology explorer page with sorting and filtering"
Phase 4 partial: "feat: technology detail page with charts and signals"
Phase 4 partial: "feat: compare page and methodology page"
Phase 4 complete: "feat: UI polish — loading states, responsive, dark mode, SEO"
Phase 5: "feat: deployment config, LICENSE, README update"
```

---

## GIVING INSTRUCTIONS TO THE LLM

When you hand a phase to Claude Code, use this template:

```
Build Phase [N] of the DevTrends project.

Follow MVP_SPEC.md sections [X, Y, Z] exactly.
Follow BUILD_GUIDE.md for the build sequence within this phase.
Follow CLAUDE.md for code conventions and project structure.

Specifically build:
- [list the exact files to create/modify]

Do NOT:
- Touch any files outside this phase
- Add features not in the spec
- Skip error handling
- Use dummy/mock data

After building, verify:
- [list the testing checkpoints for this phase]
```

This prevents the LLM from going rogue, adding features, or skipping to a later phase.
