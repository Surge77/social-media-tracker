# Design Document

## Overview

This design transforms the current single-page application into a multi-route architecture where the landing page serves as a marketing experience and the feed functionality moves to a dedicated dashboard route. The solution leverages Next.js App Router for optimal code splitting and performance.

## Architecture

### Current State
- Single route (`/`) contains both marketing (Hero) and application (Feed, Sidebar, InsightsSidebar) components
- All components load together, creating a large initial bundle
- Mixed concerns between marketing and application functionality

### Target State
- **Landing Route (`/`)**: Marketing-focused with Hero component and CTA buttons
- **Dashboard Route (`/dashboard/trending`)**: Application functionality with persistent layout
- **Code Splitting**: Heavy feed components load only when dashboard route is accessed
- **Shared Layout**: Dashboard pages share common header and sidebar layout

### Route Structure
```
/                           # Landing page (marketing)
/dashboard/                 # Dashboard root (optional overview)
/dashboard/trending/        # Main feed functionality
/dashboard/trending/loading # Loading skeleton
/dashboard/trending/error   # Error boundary
```

## Components and Interfaces

### New Components

#### DashboardLayout
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}
```
- Provides persistent header and sidebar for dashboard pages
- Manages active navigation state
- Handles responsive behavior for mobile/desktop

#### FeedContainer
```typescript
interface FeedContainerProps {
  initialFilters?: FeedFilters;
}

interface FeedFilters {
  sources?: string[];
  window?: string;
  sort?: string;
  search?: string;
  limit?: number;
  page?: number;
}
```
- Orchestrates data fetching using React Query
- Manages URL parameter synchronization
- Handles filter state and updates

#### AnimatedCTA
```typescript
interface AnimatedCTAProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
```
- Provides micro-interactions for CTA buttons
- Handles navigation with brief animation delay
- Respects accessibility preferences

### Modified Components

#### Header (Landing)
- Simplified version for marketing page
- Focuses on branding and primary CTA
- Removes application-specific navigation

#### Header (Dashboard)
- Application-focused navigation
- Shows active route state
- Includes user actions and settings

#### Feed
- Becomes client component within FeedContainer
- Receives data and handlers as props
- Maintains existing UI and functionality

## Data Models

### URL Parameters Schema
```typescript
interface FeedParams {
  sources?: string;    // "hn,reddit,rss"
  window?: string;     // "1h", "24h", "7d"
  sort?: string;       // "trending", "velocity", "popular"
  search?: string;     // search query
  limit?: number;      // items per page
  page?: number;       // pagination
}
```

### Feed Data Interface
```typescript
interface FeedItem {
  id: string;
  title: string;
  summary: string;
  score: number;
  comments: number;
  velocity: number;
  source: string;
  timeAgo: string;
  views: number;
  chips: string[];
  chipTypes: string[];
}

interface FeedResponse {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
  nextPage?: number;
}
```

### React Query Integration
```typescript
// Hook for feed data fetching
function useTrending(params: FeedParams) {
  return useQuery({
    queryKey: ['trending', params],
    queryFn: () => fetchTrending(params),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
  });
}
```

## Error Handling

### Route-Level Error Boundaries
- `error.tsx` in dashboard/trending/ catches feed-specific errors
- Provides user-friendly error messages with retry options
- Maintains navigation functionality during errors

### Loading States
- `loading.tsx` provides skeleton UI during data fetching
- Staggered loading animations for perceived performance
- Graceful degradation for slow connections

### API Error Handling
```typescript
interface APIError {
  message: string;
  code: string;
  status: number;
}

// Error handling in data fetching
const handleFeedError = (error: APIError) => {
  if (error.status === 429) {
    // Rate limiting
    return { retry: true, delay: 60000 };
  }
  if (error.status >= 500) {
    // Server errors
    return { retry: true, delay: 5000 };
  }
  // Client errors
  return { retry: false };
};
```

## Testing Strategy

### Unit Tests
- Component rendering and prop handling
- URL parameter parsing and serialization
- Filter state management
- Navigation behavior

### Integration Tests
- Route transitions and navigation
- Data fetching with React Query
- Filter updates and URL synchronization
- Error boundary behavior

### Performance Tests
- Bundle size analysis (landing vs dashboard)
- Loading time measurements
- Animation performance validation
- Accessibility compliance testing

### Test Structure
```
__tests__/
├── components/
│   ├── FeedContainer.test.tsx
│   ├── AnimatedCTA.test.tsx
│   └── DashboardLayout.test.tsx
├── pages/
│   ├── landing.test.tsx
│   └── dashboard-trending.test.tsx
└── integration/
    ├── navigation.test.tsx
    └── feed-filters.test.tsx
```

## Animation and Micro-interactions

### Libraries
- **framer-motion**: Layout animations and page transitions
- **CSS animations**: Lightweight micro-interactions

### Animation Patterns

#### CTA Micro-gesture
```typescript
const ctaVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  loading: { scale: 1.05, opacity: 0.8 }
};
```

#### Page Transitions
```typescript
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};
```

#### Shared Element Morphing
- Hero title morphs to dashboard header using `layoutId`
- Smooth visual continuity between routes

#### Feed Item Staggering
```typescript
const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};
```

### Accessibility Considerations
- `prefers-reduced-motion` media query support
- Focus management during route transitions
- ARIA live regions for dynamic content updates
- Keyboard navigation preservation

## Performance Optimizations

### Code Splitting
- Landing page bundle excludes feed components
- Dashboard components lazy-loaded on route access
- Shared components optimized for reuse

### Caching Strategy
- Landing page: Static generation (SSG)
- Dashboard: Server-side rendering (SSR) with ISR
- API responses: React Query caching with stale-while-revalidate

### Bundle Analysis
```typescript
// Expected bundle sizes
const bundleSizes = {
  landing: "< 100KB gzipped",
  dashboard: "< 300KB gzipped",
  shared: "< 150KB gzipped"
};
```

### Loading Performance
- Critical CSS inlined for landing page
- Preload hints for dashboard route
- Image optimization for hero assets
- Font optimization with variable fonts

## Security Considerations

### URL Parameter Validation
```typescript
const validateFeedParams = (params: URLSearchParams): FeedParams => {
  return {
    sources: validateSources(params.get('sources')),
    window: validateTimeWindow(params.get('window')),
    sort: validateSortOption(params.get('sort')),
    search: sanitizeSearchQuery(params.get('search')),
    limit: validateLimit(params.get('limit')),
    page: validatePage(params.get('page'))
  };
};
```

### XSS Prevention
- All user inputs sanitized
- Content Security Policy headers
- Safe HTML rendering for dynamic content

## Migration Strategy

### Phase 1: Route Structure
1. Create dashboard layout and routing structure
2. Move existing components without modification
3. Implement basic navigation

### Phase 2: Component Refactoring
1. Extract FeedContainer with URL parameter handling
2. Implement loading and error states
3. Add React Query integration

### Phase 3: Animations and Polish
1. Add micro-interactions and transitions
2. Implement shared element morphing
3. Performance optimization and testing

### Rollback Plan
- Feature flag to toggle between old and new routing
- Database migrations are not required
- Component-level rollback possible