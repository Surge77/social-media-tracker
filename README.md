# Public Trending

A real-time trending content dashboard that aggregates and displays trending items from multiple sources with automatic refresh capabilities.

## Features

- **Auto-Refresh Dashboard** - Automatically updates every 60 seconds
- **Manual Refresh** - Instant refresh with loading states
- **Multi-Source Aggregation** - Hacker News, RSS feeds, and NewsAPI
- **Trending Algorithm** - Time-decay scoring with popularity metrics
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Error Handling** - Graceful error recovery with retry logic

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- NewsAPI key (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Surge77/social-media-tracker.git
cd social-media-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEWSAPI_KEY=your_newsapi_key
```

4. Run database migrations
```bash
# Apply migrations in supabase/migrations/ to your Supabase project
```

5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Data Collection

Collect trending data from sources:

```bash
# Collect from all sources
npm run collect:all

# Collect from specific sources
npm run collect:hn      # Hacker News
npm run collect:rss     # RSS feeds
npm run collect:newsapi # NewsAPI
```

## Configuration

### Auto-Refresh Settings

Configure in `.env`:

```env
NEXT_PUBLIC_REFRESH_INTERVAL_MS=60000  # Refresh every 60 seconds
NEXT_PUBLIC_STALE_TIME_MS=30000        # Cache for 30 seconds
NEXT_PUBLIC_ENABLE_AUTO_REFRESH=true   # Enable/disable auto-refresh
```

### Data Collection

Edit `config/collector.config.json` and `config/rss_sources.json` to customize data sources and collection settings.

## Project Structure

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed project organization.

## Key Components

- **RefreshControls** - Auto-refresh UI with manual refresh button
- **FeedList** - Animated feed display with smooth transitions
- **TrendingService** - Business logic for trending calculations
- **useTrending** - React Query hook with auto-refresh

## License

MIT
