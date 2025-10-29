/**
 * Content search and filtering utilities
 * Provides advanced filtering and search capabilities for items
 */

import { supabase } from './client';
import type { 
  Item, 
  ContentSource, 
  TrendingWindow 
} from '@/types/database.types';
import { DatabaseError } from './queries';

// Filter interfaces
export interface ContentFilter {
  sources?: ContentSource[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  scoreRange?: {
    min: number;
    max?: number;
  };
  commentRange?: {
    min: number;
    max?: number;
  };
  keywords?: string[];
  excludeKeywords?: string[];
}

export interface SortOptions {
  field: 'published_at' | 'created_at' | 'score' | 'comment_count' | 'title';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface FilteredItemsResult {
  items: Item[];
  total: number;
  hasMore: boolean;
}

/**
 * Advanced item filtering with multiple criteria
 */
export async function getFilteredItems(
  filter: ContentFilter,
  sort: SortOptions = { field: 'published_at', direction: 'desc' },
  pagination: PaginationOptions = { limit: 20, offset: 0 }
): Promise<FilteredItemsResult> {
  try {
    let query = supabase.from('items').select('*', { count: 'exact' });

    // Apply source filter
    if (filter.sources && filter.sources.length > 0) {
      query = query.in('source', filter.sources);
    }

    // Apply date range filter
    if (filter.dateRange) {
      query = query
        .gte('published_at', filter.dateRange.start.toISOString())
        .lte('published_at', filter.dateRange.end.toISOString());
    }

    // Apply score range filter
    if (filter.scoreRange) {
      query = query.gte('score', filter.scoreRange.min);
      if (filter.scoreRange.max !== undefined) {
        query = query.lte('score', filter.scoreRange.max);
      }
    }

    // Apply comment range filter
    if (filter.commentRange) {
      query = query.gte('comment_count', filter.commentRange.min);
      if (filter.commentRange.max !== undefined) {
        query = query.lte('comment_count', filter.commentRange.max);
      }
    }

    // Apply keyword filters using text search
    if (filter.keywords && filter.keywords.length > 0) {
      const keywordQuery = filter.keywords.join(' | '); // OR search
      query = query.textSearch('search_vector', keywordQuery);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new DatabaseError(
        `Failed to filter items: ${error.message}`,
        error.code,
        error.details
      );
    }

    return {
      items: data || [],
      total: count || 0,
      hasMore: (count || 0) > pagination.offset + pagination.limit
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error filtering items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Search items with advanced text search capabilities
 */
export async function advancedSearchItems(
  searchQuery: string,
  filter: Omit<ContentFilter, 'keywords'> = {},
  sort: SortOptions = { field: 'published_at', direction: 'desc' },
  pagination: PaginationOptions = { limit: 20, offset: 0 }
): Promise<FilteredItemsResult> {
  // Use the database search function for better performance
  if (!filter.sources && !filter.dateRange && !filter.scoreRange && !filter.commentRange) {
    try {
      const { data, error } = await supabase.rpc('search_items', {
        p_query: searchQuery,
        p_source: null,
        p_limit: pagination.limit,
        p_offset: pagination.offset
      });

      if (error) {
        throw new DatabaseError(
          `Failed to search items: ${error.message}`,
          error.code,
          error.details
        );
      }

      // Convert search results to items format
      const items: Item[] = (data || []).map(result => ({
        id: result.id,
        source: result.source as ContentSource,
        external_id: null,
        title: result.title,
        url: result.url,
        excerpt: result.excerpt,
        author: result.author,
        score: result.score,
        comment_count: result.comment_count,
        published_at: result.published_at,
        created_at: result.published_at, // Fallback
        updated_at: result.published_at, // Fallback
        raw_data: null,
        search_vector: null
      }));

      return {
        items,
        total: items.length,
        hasMore: items.length === pagination.limit
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        `Unexpected error in advanced search: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Fall back to filtered search for complex queries
  return getFilteredItems(
    { ...filter, keywords: [searchQuery] },
    sort,
    pagination
  );
}

/**
 * Get trending items with additional filtering
 */
export async function getFilteredTrendingItems(
  window: TrendingWindow = '24h',
  filter: Omit<ContentFilter, 'dateRange'> = {},
  pagination: PaginationOptions = { limit: 20, offset: 0 }
): Promise<FilteredItemsResult> {
  try {
    // First get trending items
    const { data: trendingData, error: trendingError } = await supabase.rpc('get_trending_items', {
      p_window: window,
      p_limit: pagination.limit * 2, // Get more to account for filtering
      p_offset: pagination.offset
    });

    if (trendingError) {
      throw new DatabaseError(
        `Failed to fetch trending items: ${trendingError.message}`,
        trendingError.code,
        trendingError.details
      );
    }

    let filteredItems = trendingData || [];

    // Apply source filter
    if (filter.sources && filter.sources.length > 0) {
      filteredItems = filteredItems.filter(item => 
        filter.sources!.includes(item.source as ContentSource)
      );
    }

    // Apply score range filter
    if (filter.scoreRange) {
      filteredItems = filteredItems.filter(item => {
        const score = item.score;
        return score >= filter.scoreRange!.min && 
               (filter.scoreRange!.max === undefined || score <= filter.scoreRange!.max);
      });
    }

    // Apply comment range filter
    if (filter.commentRange) {
      filteredItems = filteredItems.filter(item => {
        const comments = item.comment_count;
        return comments >= filter.commentRange!.min && 
               (filter.commentRange!.max === undefined || comments <= filter.commentRange!.max);
      });
    }

    // Apply keyword filter (simple text search)
    if (filter.keywords && filter.keywords.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const text = `${item.title} ${item.excerpt || ''}`.toLowerCase();
        return filter.keywords!.some(keyword => 
          text.includes(keyword.toLowerCase())
        );
      });
    }

    // Apply exclude keywords filter
    if (filter.excludeKeywords && filter.excludeKeywords.length > 0) {
      filteredItems = filteredItems.filter(item => {
        const text = `${item.title} ${item.excerpt || ''}`.toLowerCase();
        return !filter.excludeKeywords!.some(keyword => 
          text.includes(keyword.toLowerCase())
        );
      });
    }

    // Limit results
    const paginatedItems = filteredItems.slice(0, pagination.limit);

    return {
      items: paginatedItems.map(item => ({
        id: item.id,
        source: item.source as ContentSource,
        external_id: null,
        title: item.title,
        url: item.url,
        excerpt: item.excerpt,
        author: item.author,
        score: item.score,
        comment_count: item.comment_count,
        published_at: item.published_at,
        created_at: item.published_at,
        updated_at: item.published_at,
        raw_data: null,
        search_vector: null
      })),
      total: filteredItems.length,
      hasMore: filteredItems.length > pagination.limit
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error filtering trending items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get popular items from the last N hours
 */
export async function getPopularItemsInTimeframe(
  hours: number = 24,
  limit: number = 20
): Promise<Item[]> {
  try {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - hours);

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .gte('published_at', startTime.toISOString())
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new DatabaseError(
        `Failed to fetch popular items: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching popular items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get items with high engagement (comments relative to score)
 */
export async function getHighEngagementItems(
  minEngagementRatio: number = 0.1,
  limit: number = 20
): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .gt('score', 10) // Minimum score threshold
      .gt('comment_count', 1) // Must have comments
      .order('comment_count', { ascending: false })
      .limit(limit * 2); // Get more to filter

    if (error) {
      throw new DatabaseError(
        `Failed to fetch high engagement items: ${error.message}`,
        error.code,
        error.details
      );
    }

    // Filter by engagement ratio and limit results
    const filteredItems = (data || [])
      .filter(item => {
        const ratio = item.comment_count / Math.max(item.score, 1);
        return ratio >= minEngagementRatio;
      })
      .slice(0, limit);

    return filteredItems;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching high engagement items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}