# Supabase Data Access Layer

This directory contains the complete data access layer for the Supabase integration, providing typed database operations, caching, and error handling.

## Architecture Overview

```
src/lib/supabase/
├── client.ts           # Client-side Supabase client
├── server.ts           # Server-side Supabase client  
├── queries.ts          # Core database operations
├── filters.ts          # Advanced filtering and search
├── trending.ts         # Trending data operations
├── error-handling.ts   # Error handling and retry logic
├── index.ts           # Main exports
└── README.md          # This file
```

## Core Features

### 1. Database Operations (`queries.ts`)
- **getItems()** - Fetch items with filtering and pagination
- **getItemById()** - Get single item by ID
- **searchItems()** - Full-text search using database functions
- **getTrendingItems()** - Get trending items using database functions
- **getItemsBySource()** - Filter items by content source
- **getRecentItems()** - Get items from last 24 hours
- **getTopItems()** - Get highest scoring items
- **getItemsCountBySource()** - Get item counts by source

### 2. Advanced Filtering (`filters.ts`)
- **getFilteredItems()** - Complex multi-criteria filtering
- **advancedSearchItems()** - Enhanced search with filters
- **getFilteredTrendingItems()** - Trending items with filters
- **getPopularItemsInTimeframe()** - Popular items in time window
- **getHighEngagementItems()** - Items with high comment ratios

### 3. Trending Analysis (`trending.ts`)
- **getTrendingByWindow()** - Trending items by time window
- **getTrendingBySource()** - Trending items by content source
- **getTrendingAnalysis()** - Statistical analysis of trending data
- **compareTrendingPeriods()** - Compare trending between periods
- **getVelocityLeaders()** - Items with highest velocity
- **getBreakoutItems()** - Items with sudden score increases
- **getTrendingWithHighEngagement()** - Trending items with high engagement

### 4. Error Handling (`error-handling.ts`)
- **CategorizedError** - Enhanced error class with categories
- **withRetry()** - Retry logic with exponential backoff
- **CircuitBreaker** - Prevent cascading failures
- **executeWithResilience()** - Combined retry + circuit breaker

## React Query Integration

### Hooks (`/hooks/useSupabaseQueries.ts`)
All database operations are wrapped in React Query hooks for:
- Automatic caching
- Background refetching
- Error handling
- Loading states
- Optimistic updates

### Key Hooks
- `useItems()` - Basic item fetching
- `useSearchItems()` - Search functionality
- `useTrendingItems()` - Trending data
- `useFilteredItems()` - Advanced filtering
- `useTrendingAnalysis()` - Trending analytics

### Enhanced Trending API (`/lib/api/supabase-trending.ts`)
Replaces mock data with real Supabase operations:
- Converts database results to FeedItem format
- Handles search, filtering, and trending queries
- Provides backward compatibility with existing components

## Usage Examples

### Basic Item Fetching
```typescript
import { useItems } from '@/hooks/useSupabaseQueries';

function ItemList() {
  const { data: items, isLoading, error } = useItems({
    limit: 20,
    source: 'reddit',
    orderBy: 'score',
    orderDirection: 'desc'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {items?.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Advanced Search
```typescript
import { useAdvancedSearch } from '@/hooks/useSupabaseQueries';

function SearchResults({ query }: { query: string }) {
  const { data, isLoading } = useAdvancedSearch(
    query,
    {
      sources: ['reddit', 'hackernews'],
      scoreRange: { min: 10 },
      dateRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      }
    },
    { field: 'score', direction: 'desc' },
    { limit: 20, offset: 0 }
  );

  return (
    <div>
      {data?.items.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

### Trending Analysis
```typescript
import { useTrendingAnalysis } from '@/hooks/useSupabaseQueries';

function TrendingDashboard() {
  const { data: analysis } = useTrendingAnalysis('24h');

  return (
    <div>
      <h2>Trending Analysis (24h)</h2>
      <p>Total Items: {analysis?.totalItems}</p>
      <p>Average Score: {analysis?.averageScore.toFixed(1)}</p>
      
      <h3>Top Sources</h3>
      {analysis?.topSources.map(source => (
        <div key={source.source}>
          {source.source}: {source.count} items (avg: {source.averageScore.toFixed(1)})
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

The system includes comprehensive error handling:

### Error Categories
- **Network** - Connection issues (retryable)
- **Database** - Server errors (retryable)
- **Authentication** - Auth failures (not retryable)
- **Authorization** - Permission errors (not retryable)
- **Validation** - Invalid data (not retryable)
- **Rate Limit** - Too many requests (retryable with delay)

### Retry Logic
- Exponential backoff with jitter
- Different retry configs for read/write/search operations
- Circuit breaker pattern to prevent cascading failures
- Automatic error categorization and logging

### React Query Integration
- Automatic retry based on error type
- Custom retry delays for different error categories
- Proper error boundaries and user messaging

## Performance Considerations

### Caching Strategy
- 30-second stale time for most queries
- 5-minute stale time for expensive operations (analysis, counts)
- Background refetching on window focus and network reconnect
- Placeholder data to prevent loading flickers

### Query Optimization
- Use database functions for complex operations (search, trending)
- Efficient pagination with range queries
- Proper indexing on frequently queried fields
- Circuit breakers to prevent overload

### Memory Management
- Automatic garbage collection of unused queries
- Configurable cache sizes
- Proper cleanup on component unmount

## Database Schema Requirements

This implementation expects the following database structure:

### Tables
- `items` - Main content items
- `trending_metrics` - Trending calculations

### Functions
- `search_items()` - Full-text search
- `get_trending_items()` - Trending calculations
- `upsert_item()` - Item creation/updates
- `calculate_trending_score()` - Score calculations
- `update_trending_metrics()` - Metrics updates

### Security
- Row Level Security (RLS) policies
- Public read access for items and trending_metrics
- Proper authentication for write operations

## Testing

### Unit Tests
- Individual function testing
- Error handling verification
- Type safety validation

### Integration Tests
- End-to-end database operations
- React Query hook testing
- Error boundary testing

### Performance Tests
- Query performance benchmarks
- Cache effectiveness metrics
- Memory usage monitoring

## Migration from Mock Data

To migrate from the existing mock API:

1. **Replace imports**: Change from `@/lib/api/trending` to `@/lib/api/supabase-trending`
2. **Update hooks**: Use `useSupabaseTrending` instead of `useTrending`
3. **Environment setup**: Ensure Supabase credentials are configured
4. **Database setup**: Run migration scripts to create required tables and functions

The new implementation maintains backward compatibility with existing components while providing real data from Supabase.