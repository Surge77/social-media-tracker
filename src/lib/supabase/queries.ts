/**
 * Core database operations using Supabase client
 * This module provides typed database operations for items and trending data
 */

import { supabase } from './client';
import type { 
  Item, 
  TrendingResult, 
  SearchResult, 
  ContentSource, 
  TrendingWindow 
} from '@/types/database.types';
import { executeWithResilience, categorizeError, logError } from './error-handling';

// Import DatabaseError from error-handling
import { DatabaseError } from './error-handling';

// Re-export for other modules
export { DatabaseError };

// Query parameters interfaces
export interface ItemsQueryParams {
  limit?: number;
  offset?: number;
  source?: ContentSource;
  orderBy?: 'created_at' | 'published_at' | 'score' | 'comment_count';
  orderDirection?: 'asc' | 'desc';
}

export interface SearchQueryParams {
  query: string;
  source?: ContentSource;
  limit?: number;
  offset?: number;
}

export interface TrendingQueryParams {
  window?: TrendingWindow;
  limit?: number;
  offset?: number;
}

/**
 * Fetch items with optional filtering and pagination
 */
export async function getItems(params: ItemsQueryParams = {}): Promise<Item[]> {
  const {
    limit = 20,
    offset = 0,
    source,
    orderBy = 'published_at',
    orderDirection = 'desc'
  } = params;

  return executeWithResilience(
    async () => {
      let query = supabase
        .from('items')
        .select('*')
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply source filter if provided
      if (source) {
        query = query.eq('source', source);
      }

      const { data, error } = await query;

      if (error) {
        const categorizedError = categorizeError(error);
        logError(categorizedError, { operation: 'getItems', params });
        throw categorizedError;
      }

      return data || [];
    },
    'getItems',
    'database',
    'read'
  );
}

/**
 * Get a single item by ID
 */
export async function getItemById(id: number): Promise<Item | null> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new DatabaseError(
        `Failed to fetch item: ${error.message}`,
        error.code,
        error.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching item: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Search items using full-text search
 */
export async function searchItems(params: SearchQueryParams): Promise<SearchResult[]> {
  const {
    query,
    source,
    limit = 20,
    offset = 0
  } = params;

  try {
    const { data, error } = await supabase.rpc('search_items', {
      p_query: query,
      p_source: source || null,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      throw new DatabaseError(
        `Failed to search items: ${error.message}`,
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
      `Unexpected error searching items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get trending items using the database function
 */
export async function getTrendingItems(params: TrendingQueryParams = {}): Promise<TrendingResult[]> {
  const {
    window = '24h',
    limit = 20,
    offset = 0
  } = params;

  try {
    const { data, error } = await supabase.rpc('get_trending_items', {
      p_window: window,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      throw new DatabaseError(
        `Failed to fetch trending items: ${error.message}`,
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
      `Unexpected error fetching trending items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get items by source with pagination
 */
export async function getItemsBySource(
  source: ContentSource,
  params: Omit<ItemsQueryParams, 'source'> = {}
): Promise<Item[]> {
  return getItems({ ...params, source });
}

/**
 * Get recent items (last 24 hours)
 */
export async function getRecentItems(limit: number = 20): Promise<Item[]> {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .gte('published_at', twentyFourHoursAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new DatabaseError(
        `Failed to fetch recent items: ${error.message}`,
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
      `Unexpected error fetching recent items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get top items by score
 */
export async function getTopItems(limit: number = 20): Promise<Item[]> {
  return getItems({
    limit,
    orderBy: 'score',
    orderDirection: 'desc'
  });
}

/**
 * Get items count by source
 */
export async function getItemsCountBySource(): Promise<Record<ContentSource, number>> {
  return executeWithResilience(
    async () => {
      const { data, error } = await supabase
        .from('items')
        .select('source');

      if (error) {
        const categorizedError = categorizeError(error);
        logError(categorizedError, { operation: 'getItemsCountBySource' });
        throw categorizedError;
      }

      // Count items by source
      const counts = (data || []).reduce((acc, item) => {
        acc[item.source] = (acc[item.source] || 0) + 1;
        return acc;
      }, {} as Record<ContentSource, number>);

      // Ensure all sources are represented
      const result: Record<ContentSource, number> = {
        hackernews: counts.hackernews || 0,
        rss: counts.rss || 0,
        newsapi: counts.newsapi || 0
      };

      return result;
    },
    'getItemsCountBySource',
    'database',
    'read'
  );
}