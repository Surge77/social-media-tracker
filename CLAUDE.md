# CLAUDE.md - DevTrends Project Intelligence

## What Is This Project?

**DevTrends** is a Developer Career Intelligence Platform that tracks technology trends across multiple data sources to help developers make smarter learning and career decisions. Think "Bloomberg Terminal for tech trends."

**Current State:** Production-ready landing page. No backend, no data pipelines, no dashboard pages yet. Everything beyond the landing page needs to be built.

**Target Audience:** Developers who want to know what technologies are rising/falling, what to learn next, and what the job market demands.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.5 (App Router, React 19.1.0) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3.4.17 + CSS variables (HSL) |
| Components | shadcn/ui (new-york style) + Radix UI + CVA |
| Animation | Framer Motion 12.x |
| Icons | Lucide React |
| Theme | next-themes (dark default, system-aware) |
| Database | Supabase (PostgreSQL + Auth + Real-time) |
| Data Fetching | TanStack React Query 5.x |
| Validation | Zod 4.x |
| Charts | Recharts 3.x (basic), Nivo (advanced - to install) |
| Notifications | Sonner |
| Env Safety | @t3-oss/env-nextjs |
| Dev Server | Turbopack (`next dev --turbopack`) |
| Prod Build | Webpack (`next build --webpack`) |
| Deployment | Vercel (planned) |

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens (HSL variables, gradients, shadows, animations)
│   ├── layout.tsx           # Root layout (fonts: Geist Sans + Geist Mono, Providers wrapper)
│   ├── page.tsx             # Landing page (Header → Hero → BentoFeatures → Footer)
│   ├── providers.tsx        # ThemeProvider + ThemeWaveTransition
│   └── favicon.ico
│
├── components/
│   ├── ui/                  # shadcn/ui primitives (badge, button, card)
│   ├── Header.tsx           # Sticky nav: logo + links + theme toggle + CTA
│   ├── Hero.tsx             # Hero section with FloatingIcons + SharedTitle + CTAs
│   ├── BentoFeatures.tsx    # 6-feature bento grid with hover animations
│   ├── Footer.tsx           # Brand + links + copyright
│   ├── FloatingIcons.tsx    # 13 animated floating icon cards (background decoration)
│   ├── SharedTitle.tsx      # Reusable title with "hero" and "header" variants
│   ├── AnimatedCTA.tsx      # Button with spring animations, loading state, a11y
│   ├── ThemeToggle.tsx      # Moon/Sun toggle, dispatches THEME_TOGGLE_EVENT
│   └── ThemeWaveTransition.tsx  # Expanding circle animation on theme switch
│
├── hooks/
│   └── useReducedMotion.ts  # Returns boolean for prefers-reduced-motion
│
└── lib/
    └── utils.ts             # cn() utility (clsx + tailwind-merge)
```

### Future directories (create as needed):
```
src/
├── app/
│   ├── (dashboard)/         # Dashboard layout group
│   │   ├── technologies/    # Technology tracking pages
│   │   ├── jobs/            # Job market insights pages
│   │   └── roadmap/         # Learning roadmap pages
│   ├── api/                 # API routes
│   │   ├── cron/            # Cron job endpoints (Vercel cron)
│   │   └── v1/              # Public API endpoints
│   └── auth/                # Auth pages (login, signup, callback)
│
├── components/
│   ├── ui/                  # shadcn primitives
│   ├── charts/              # Chart wrapper components
│   ├── dashboard/           # Dashboard-specific components
│   └── shared/              # Shared components across pages
│
├── lib/
│   ├── supabase/            # Supabase client (server + browser)
│   ├── api/                 # External API clients (GitHub, HN, SO, etc.)
│   ├── utils.ts             # General utilities
│   └── constants.ts         # App-wide constants, technology taxonomy
│
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
└── config/                  # App configuration files
```

---

## Design System

### Colors (HSL CSS Variables)
All colors are defined in `src/app/globals.css` as HSL values and mapped in `tailwind.config.ts`.

**Usage pattern:** `bg-primary`, `text-muted-foreground`, `border-border`, `hsl(var(--success))`

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | white | near-black | Page background |
| `--foreground` | near-black | near-white | Primary text |
| `--primary` | dark gray | near-white | Buttons, links, emphasis |
| `--secondary` | light gray | dark gray | Secondary elements |
| `--muted` | light gray | dark gray | Disabled, subtle text |
| `--success` | teal 158 64% 52% | same | Positive indicators |
| `--warning` | orange 38 92% 50% | same | Caution indicators |
| `--destructive` | red | muted red | Error, delete actions |
| `--chart-1 to 5` | warm tones | cool tones | Chart data series |

**Gradients:**
- `--gradient-primary`: 135deg orange gradient (hero CTA buttons)
- `--gradient-card`: 135deg subtle white/dark gradient (cards)

**Shadows:**
- `--shadow-glow`: Orange glow for hover effects
- `--shadow-card`: Subtle card elevation

### Typography
- **Sans:** Geist Sans (Google Fonts, variable: `--font-geist-sans`)
- **Mono:** Geist Mono (Google Fonts, variable: `--font-geist-mono`)
- **Fallback:** Inter, system-ui, sans-serif (in Tailwind config)

### Border Radius
- `lg`: 0.5rem, `md`: 0.375rem, `sm`: 0.25rem (via `--radius`)

### Breakpoints
- Mobile first. `sm:` → `md:` → `lg:`
- Container max-width: 1400px, centered, 2rem padding

---

## Code Conventions

### Component Pattern
```tsx
'use client'  // Only if component uses hooks, events, or browser APIs

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// CVA variants for styled components
const variants = cva(baseStyles, { variants: {...}, defaultVariants: {...} })

// forwardRef for all reusable components
const Component = React.forwardRef<HTMLElement, Props>(({ className, ...props }, ref) => (
  <div className={cn(variants({ variant }), className)} ref={ref} {...props} />
))
Component.displayName = 'Component'
```

### Animation Pattern
```tsx
const prefersReducedMotion = useReducedMotion()

<motion.div
  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? {} : { duration: 0.5 }}
/>
```
- ALWAYS check `useReducedMotion()` before applying animations
- Spring physics for interactive elements: `{ stiffness: 400, damping: 17 }`
- Stagger children with `delay: index * 0.1`

### Import Order
```tsx
// 1. React/Next.js
import React from 'react'
import Link from 'next/link'

// 2. External libraries
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

// 3. Internal utilities
import { cn } from '@/lib/utils'

// 4. Internal components
import { Button } from '@/components/ui/button'

// 5. Internal hooks
import { useReducedMotion } from '@/hooks/useReducedMotion'

// 6. Types
import type { SomeType } from '@/types'
```

### Path Aliases
- `@/*` maps to `./src/*`
- Always use `@/components/...`, `@/lib/...`, `@/hooks/...` — never relative paths across directories

### Naming Conventions
- **Components:** PascalCase (`BentoFeatures.tsx`)
- **Hooks:** camelCase with `use` prefix (`useReducedMotion.ts`)
- **Utilities:** camelCase (`utils.ts`)
- **CSS variables:** kebab-case (`--gradient-primary`)
- **Files:** PascalCase for components, camelCase for utilities/hooks

### Client vs Server Components
- Default to **Server Components** (no `'use client'` directive)
- Add `'use client'` ONLY when component needs: hooks, event handlers, browser APIs, Framer Motion
- Keep client boundaries as small as possible

---

## shadcn/ui Usage

**Style:** new-york
**Adding components:** `npx shadcn@latest add <component-name>`
**Existing components:** badge, button, card

When adding shadcn components, they go to `src/components/ui/`. Do not modify the shadcn defaults unless there's a specific design requirement.

---

## Data Sources (External APIs)

These are the APIs DevTrends will collect data from:

| Source | Auth | Base URL | Rate Limit |
|--------|------|----------|------------|
| Hacker News (Algolia) | None needed | `https://hn.algolia.com/api/v1` | Generous, no hard limit |
| GitHub API | Bearer token | `https://api.github.com` | 5,000 req/hr with PAT |
| Stack Overflow | App key | `https://api.stackexchange.com/2.3` | 10,000 req/day with key |
| Reddit | OAuth Bearer | `https://oauth.reddit.com` | 60 req/min |
| Dev.to | None needed | `https://dev.to/api` | 30 req/30s |
| NewsAPI | API key | `https://newsapi.org/v2` | 100 req/day (dev) |
| Adzuna | App ID + Key | `https://api.adzuna.com/v1` | 250 req/month (free) |
| JSearch (RapidAPI) | RapidAPI key | Via RapidAPI | 500 req/month (free) |
| Remotive | None needed | `https://remotive.com/api` | No hard limit |

### API Client Pattern (for new integrations)
```tsx
// src/lib/api/github.ts
const GITHUB_BASE = 'https://api.github.com'

export async function searchTrendingRepos(language: string, period: string) {
  const res = await fetch(`${GITHUB_BASE}/search/repositories?q=...`, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)

  const data = await res.json()
  return TrendingReposSchema.parse(data) // Validate with Zod
}
```

---

## Environment Variables

File: `.env.local` (gitignored, never commit)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Data Sources
GITHUB_TOKEN=
STACKOVERFLOW_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
NEWSAPI_KEY=

# Job Market
ADZUNA_APP_ID=
ADZUNA_API_KEY=
RAPIDAPI_KEY=

# Monitoring (later)
SENTRY_DSN=
AXIOM_TOKEN=

# Email (later)
RESEND_API_KEY=
```

**Rules:**
- `NEXT_PUBLIC_` prefix = exposed to browser (only for Supabase anon key / URL)
- Everything else = server-only
- Validate with `@t3-oss/env-nextjs` + Zod — never use `process.env` directly without validation

---

## Supabase Conventions

### Client Setup
```tsx
// src/lib/supabase/server.ts — for Server Components, API routes, Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// src/lib/supabase/client.ts — for Client Components
import { createBrowserClient } from '@supabase/ssr'
```

### Type Generation
```bash
npx supabase gen types typescript --project-id <ref> > src/types/database.ts
```
Run this after every schema change. All queries should be fully typed.

---

## Key Decisions

1. **No Prisma** — Supabase JS client handles all queries
2. **No Redux/Zustand** — React Query for server state, React context for minimal client state
3. **No axios** — Native fetch with Next.js caching (`next: { revalidate }`)
4. **No NextAuth/Clerk** — Supabase Auth (free, built-in)
5. **No GraphQL** — All sources are REST, keep it simple
6. **No D3** — Recharts + Nivo cover all chart needs
7. **Server Components by default** — Only add 'use client' when necessary

---

## What's Done vs What's Not

### Done (Working)
- [x] Landing page (Header, Hero, BentoFeatures, Footer)
- [x] Dark/Light theme with wave transition animation
- [x] Responsive design (mobile, tablet, desktop)
- [x] Framer Motion animations with reduced-motion support
- [x] shadcn/ui initialized with button, badge, card
- [x] Design system (colors, typography, spacing, shadows)
- [x] Core packages installed (Supabase, React Query, Zod, Recharts, Sonner)

### Not Started (Needs Building)
- [ ] Supabase database schema + tables
- [ ] Data collection pipelines (API integrations)
- [ ] Trending algorithm (time-decay scoring across sources)
- [ ] Technology taxonomy (list of 200+ tracked technologies)
- [ ] Dashboard pages (/technologies, /jobs, /roadmap)
- [ ] Charts and data visualization
- [ ] User authentication (Supabase Auth)
- [ ] User preferences and watchlists
- [ ] Search functionality (cmdk)
- [ ] API routes for data serving
- [ ] Cron jobs for scheduled data fetching
- [ ] Email digest system
- [ ] SEO (sitemap, OG images, structured data)
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Vercel)
- [ ] Testing (Vitest, Playwright)

---

## Common Gotchas

1. **Theme toggle dispatches a custom event** — `ThemeToggle.tsx` fires `THEME_TOGGLE_EVENT` that `ThemeWaveTransition.tsx` listens to. Don't break this coupling.
2. **Default theme is dark** — Set in `providers.tsx`. Users may expect light mode too.
3. **Navigation links are placeholder hashes** — `#trending`, `#popular`, etc. don't go anywhere yet. Replace with real routes when dashboard exists.
4. **"Get Started" links to `/technologies`** — This page doesn't exist yet. First dashboard page to build.
5. **Turbopack for dev, Webpack for prod** — Different bundlers. If something works in dev but breaks in build, check webpack config in `next.config.ts`.
6. **Bundle splitting is pre-configured** — `next.config.ts` has vendor, UI, feed, and common chunk splitting. Keep component directories matching the split config.
7. **All animations must respect `useReducedMotion()`** — This is an accessibility requirement, not optional.

---

## Reference Files in This Repo

| File | What It Contains |
|------|-----------------|
| `DATA_SOURCES_PLAN.md` | All API sources, sign-up links, key checklist |
| `TECH_STACK_PLAN.md` | Every package (installed + planned), install commands by phase, service accounts |
| `PIVOT_STRATEGY.md` | Original strategy doc with 5 pivot options (chose DevTrends) |
| `README.md` | Project readme |
| `CLAUDE.md` | This file — project context for Claude Code sessions |
