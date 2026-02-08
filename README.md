# DevTrends - Developer Career Intelligence Platform

> Track technology trends, job market insights, and career opportunities in real-time

## 🎯 What It Does

DevTrends aggregates data from multiple sources (GitHub, Hacker News, Stack Overflow, Dev.to, NewsAPI, job boards) to provide developers with:

- **Real-time technology trend tracking** with scoring and velocity metrics
- **Job market insights** including salary data and demand trends
- **Personalized learning roadmaps** based on your skills and market trends
- **Technology comparisons** to help you make informed career decisions

## 🛠️ Tech Stack

- **Next.js 16.1.5** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **Framer Motion 12.23.24** - Animations
- **Supabase** - Database and authentication
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
/
├── src/
│   ├── app/              # Next.js pages and layouts
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and helpers
├── PROJECT_FLOW.md       # Complete data flow documentation
├── PIVOT_STRATEGY.md     # Strategic direction
├── TECH_STACK_PLAN.md    # Technical architecture
└── DATA_SOURCES_PLAN.md  # API integration details
```

## 📚 Documentation

- **[PROJECT_FLOW.md](PROJECT_FLOW.md)** - Complete data flow from input to output
- **[PIVOT_STRATEGY.md](PIVOT_STRATEGY.md)** - Strategic direction and implementation plan
- **[TECH_STACK_PLAN.md](TECH_STACK_PLAN.md)** - Technical architecture and decisions
- **[DATA_SOURCES_PLAN.md](DATA_SOURCES_PLAN.md)** - API sources and integration details

## 🔑 Required API Keys

Add these to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Data Sources
GITHUB_TOKEN=
NEWSAPI_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
JSEARCH_API_KEY=
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

## 📝 License

MIT

---

**Track trends. Make informed decisions. Advance your career.** 🚀
