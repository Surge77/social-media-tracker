# TrendWatch - Project Structure

## Core Application Files

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.example` - Environment variables template

### Source Code (`src/`)

#### Application Routes (`src/app/`)
- `layout.tsx` - Root layout with providers
- `page.tsx` - Landing page
- `providers.tsx` - React Query and context providers
- `dashboard/trending/page.tsx` - Main trending dashboard

#### API Routes (`src/app/api/`)
- `trending/route.ts` - Trending items API endpoint
- `collection-status/route.ts` - Collection status endpoint
- `collect/route.ts` - Data collection trigger endpoint (used by scripts)

#### Components (`src/components/`)
- **Feed Components** (`feed/`)
  - `FeedList.tsx` - Main feed list with animations
  - `FeedItem.tsx` - Individual feed item
  - `FeedError.tsx` - Error handling component
  - `FeedSearch.tsx` - Search functionality
  - `RefreshControls.tsx` - Auto-refresh controls
  - `FeedContext.tsx` - Feed state management
  - `types.ts` - TypeScript types

- **UI Components** (`ui/`)
  - Reusable UI components (buttons, alerts, etc.)

- **Layout Components**
  - `Header.tsx` - Application header
  - `Sidebar.tsx` - Navigation sidebar
  - `InsightsSidebar.tsx` - Insights panel
  - `TimeWindowPills.tsx` - Time filter pills

#### Hooks (`src/hooks/`)
- `useTrending.ts` - React Query hook for trending data
- `useAutoRefresh.ts` - Auto-refresh functionality
- `useReducedMotion.ts` - Accessibility hook

#### Library (`src/lib/`)
- **API** (`api/`)
  - `trending.ts` - API client functions
  - `supabase-trending.ts` - Supabase-specific trending queries

- **Collectors** (`collectors/`)
  - `hackernews.ts` - Hacker News data collector
  - `rss.ts` - RSS feed collector
  - `newsapi.ts` - NewsAPI collector
  - `utils/` - Collector utilities

- **Services** (`services/`)
  - `trending.service.ts` - Business logic for trending

- **Transformers** (`transformers/`)
  - `feed-item.transformer.ts` - Data transformation

- **Trending** (`trending/`)
  - `trend-detector.ts` - Trend detection algorithm
  - `popularity-calculator.ts` - Popularity scoring
  - `time-decay.ts` - Time decay calculations
  - `trend-explanations.ts` - Trend explanation generator

- **Utilities** (`utils/`)
  - `time.ts` - Time formatting utilities
  - `rate-limit.ts` - Rate limiting utility
  - `utils.ts` - General utilities

- **Supabase** (`supabase/`)
  - `client.ts` - Client-side Supabase client
  - `server.ts` - Server-side Supabase client
  - `queries.ts` - Reusable queries
  - `filters.ts` - Query filters
  - `trending.ts` - Trending-specific queries
  - `error-handling.ts` - Error handling utilities

- `performance.ts` - Performance monitoring
- `env.ts` - Environment variable validation

#### Types (`src/types/`)
- `database.types.ts` - Database schema types
- `trending.types.ts` - Trending data types
- `collector.types.ts` - Data collector types

### Database (`supabase/`)
- `migrations/` - Database migration files
- `config.toml` - Supabase configuration

### Data Collection Scripts (`scripts/`)
- `collect-all.ts` - Collect from all sources
- `collect-hn.ts` - Hacker News collector
- `collect-rss.ts` - RSS feed collector
- `collect-newsapi.ts` - NewsAPI collector
- `check-db-items.ts` - Database verification
- `validate-config.ts` - Configuration validation
- `verify-schema.ts` - Schema verification

### Configuration Files (`config/`)
- `collector.config.json` - Collector settings
- `rss_sources.json` - RSS feed sources

## Key Features

### Auto-Refresh Dashboard
- Automatic data refresh every 60 seconds (configurable)
- Manual refresh button
- Smooth background updates with keepPreviousData
- Error handling and retry logic with exponential backoff
- Performance monitoring
- Loading states and animations

### Data Collection
- Hacker News integration (top stories, best stories)
- RSS feed aggregation (multiple tech sources)
- NewsAPI integration (news articles)
- Unified data storage in Supabase
- Automated collection via scripts

### Trending Algorithm
- Time-based decay scoring
- Popularity calculation (score + comments)
- Velocity tracking (engagement rate)
- Multiple time windows (15m, 1h, 6h, 24h, 7d, 30d)
- Source filtering

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth animations with Framer Motion
- Accessibility features:
  - ARIA labels and live regions
  - Keyboard navigation
  - Screen reader support
  - Reduced motion support
- Error states with retry functionality
- Loading skeletons

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Animations**: Framer Motion
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEWSAPI_KEY` - NewsAPI key
- `NEXT_PUBLIC_REFRESH_INTERVAL_MS` - Auto-refresh interval (default: 60000)
- `NEXT_PUBLIC_STALE_TIME_MS` - Data stale time (default: 30000)
- `NEXT_PUBLIC_ENABLE_AUTO_REFRESH` - Enable/disable auto-refresh (default: true)
