/**
 * Supabase-powered trending API
 * Replaces mock data with real Supabase database operations
 */

import { FeedParams, FeedResponse, FeedItem } from '@/components/feed/types';
import {
  getTrendingItems,
  searchItems,
  getFilteredItems,
  type TrendingQueryParams,
  type SearchQueryParams,
  type ContentFilter,
  type SortOptions,
  type PaginationOptions
} from '@/lib/supabase';
import type { TrendingResult, SearchResult, Item, ContentSource, TrendingWindow } from '@/types/database.types';

// API Error interface for proper error handling
export interface APIError extends Error {
  status?: number;
  code?: string;
}

// Convert database items to FeedItem format
function convertToFeedItem(item: Item | TrendingResult | SearchResult): FeedItem {
  const baseItem: FeedItem = {
    id: item.id.toString(),
    title: item.title,
    summary: item.excerpt || '',
    score: item.score,
    comments: item.comment_count,
    source: extractDomain(item.url),
    timeAgo: formatTimeAgo(item.published_at),
    views: Math.floor(item.score * 2.5 + Math.random() * 1000), // Estimated views
    chips: [] as string[],
    chipTypes: [] as string[],
    velocity: 0 // Default velocity
  };

  // Add velocity if available (for trending results)
  if ('velocity' in item && item.velocity !== null) {
    baseItem.velocity = item.velocity;
    
    // Add velocity-based chips
    if (item.velocity > item.score * 0.2) {
      baseItem.chips.push('High 1h velocity');
      baseItem.chipTypes.push('velocity');
    }
    
    if (item.velocity > item.score * 0.5) {
      baseItem.chips.push('Breakout! +500% spike');
      baseItem.chipTypes.push('breakout');
    }
  }

  // Add engagement-based chips
  const commentRatio = item.comment_count / Math.max(item.score, 1);
  if (commentRatio > 0.1) {
    baseItem.chips.push('High comment rate');
    baseItem.chipTypes.push('engagement');
  }

  // Add freshness chips
  const publishedTime = new Date(item.published_at);
  const hoursAgo = (Date.now() - publishedTime.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 2) {
    baseItem.chips.push('Fresh');
    baseItem.chipTypes.push('freshness');
  }

  return baseItem;
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

// Format time ago string
function formatTimeAgo(publishedAt: string): string {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - published.getTime();
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ago`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ago`;
  } else {
    return `${minutes}m ago`;
  }
}

// Convert FeedParams to database query parameters
function convertFeedParamsToFilters(params: FeedParams): {
  filter: ContentFilter;
  sort: SortOptions;
  pagination: PaginationOptions;
  trendingParams?: TrendingQueryParams;
  searchParams?: SearchQueryParams;
} {
  const filter: ContentFilter = {};
  
  // Convert sources
  if (params.sources) {
    const sourceMap: Record<string, ContentSource> = {
      'hackernews': 'hackernews',
      'hn': 'hackernews',
      'rss': 'rss',
      'newsapi': 'newsapi',
      'news': 'newsapi'
    };
    
    filter.sources = params.sources
      .split(',')
      .map(s => sourceMap[s.toLowerCase().trim()])
      .filter(Boolean);
  }

  // Convert time window to date range for non-trending sorts
  if (params.window && params.sort !== 'trending') {
    const now = new Date();
    const start = new Date(now);
    
    switch (params.window) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '6h':
        start.setHours(start.getHours() - 6);
        break;
      case '24h':
        start.setHours(start.getHours() - 24);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      default:
        start.setHours(start.getHours() - 24);
    }
    
    filter.dateRange = { start, end: now };
  }

  // Convert sort
  const sort: SortOptions = {
    field: 'published_at',
    direction: 'desc'
  };
  
  switch (params.sort) {
    case 'popular':
      sort.field = 'score';
      break;
    case 'velocity':
      sort.field = 'score'; // Will use trending for velocity
      break;
    case 'trending':
    default:
      // Will use trending query
      break;
  }

  // Pagination
  const pagination: PaginationOptions = {
    limit: params.limit || 20,
    offset: ((params.page || 1) - 1) * (params.limit || 20)
  };

  // Trending-specific params
  const trendingParams: TrendingQueryParams = {
    window: (params.window as TrendingWindow) || '24h',
    limit: pagination.limit,
    offset: pagination.offset
  };

  // Search-specific params
  const searchParams: SearchQueryParams | undefined = params.search ? {
    query: params.search,
    source: filter.sources?.[0],
    limit: pagination.limit,
    offset: pagination.offset
  } : undefined;

  return { filter, sort, pagination, trendingParams, searchParams };
}

// Main API function using Supabase
export const fetchTrending = async (params: FeedParams): Promise<FeedResponse> => {
  try {
    const { filter, sort, pagination, trendingParams, searchParams } = convertFeedParamsToFilters(params);
    
    let items: (Item | TrendingResult | SearchResult)[] = [];
    let total = 0;

    // Handle search queries
    if (searchParams) {
      const searchResults = await searchItems(searchParams);
      items = searchResults;
      total = searchResults.length;
    }
    // Handle trending queries
    else if (params.sort === 'trending' || params.sort === 'velocity' || !params.sort) {
      const trendingResults = await getTrendingItems(trendingParams);
      items = trendingResults;
      total = trendingResults.length;
    }
    // Handle other filtered queries
    else {
      const filteredResults = await getFilteredItems(filter, sort, pagination);
      items = filteredResults.items;
      total = filteredResults.total;
    }

    // Convert to FeedItem format
    const feedItems = items.map(convertToFeedItem);
    
    return {
      items: feedItems,
      total,
      hasMore: total > pagination.offset + pagination.limit,
      nextPage: total > pagination.offset + pagination.limit ? (params.page || 1) + 1 : undefined,
    };
  } catch (error) {
    // Convert DatabaseError to APIError
    if (error instanceof Error && 'code' in error) {
      const apiError = new Error(error.message) as APIError;
      apiError.status = (error as any).code?.startsWith('4') ? 400 : 500;
      apiError.code = (error as any).code || 'DATABASE_ERROR';
      throw apiError;
    }
    
    // Handle other errors
    const apiError = new Error('Unexpected error fetching trending data') as APIError;
    apiError.status = 500;
    apiError.code = 'INTERNAL_ERROR';
    throw apiError;
  }
};

// Error handling function (same as before)
export const handleTrendingError = (error: APIError) => {
  if (error.status === 429) {
    // Rate limiting - retry after 1 minute
    return { retry: true, delay: 60000 };
  }
  if (error.status && error.status >= 500) {
    // Server errors - retry after 5 seconds
    return { retry: true, delay: 5000 };
  }
  // Client errors - don't retry
  return { retry: false };
};

// Utility function to get trending summary
export const getTrendingSummary = async () => {
  try {
    const [trending1h, trending24h, recent] = await Promise.all([
      getTrendingItems({ window: '1h', limit: 5 }),
      getTrendingItems({ window: '24h', limit: 10 }),
      getFilteredItems(
        { 
          dateRange: { 
            start: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            end: new Date() 
          } 
        },
        { field: 'score', direction: 'desc' },
        { limit: 5, offset: 0 }
      )
    ]);

    return {
      hotNow: trending1h.map(convertToFeedItem),
      trending24h: trending24h.map(convertToFeedItem),
      recentPopular: recent.items.map(convertToFeedItem)
    };
  } catch (error) {
    console.error('Error fetching trending summary:', error);
    return {
      hotNow: [],
      trending24h: [],
      recentPopular: []
    };
  }
};