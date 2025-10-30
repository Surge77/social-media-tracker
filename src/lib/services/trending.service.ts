import { DatabaseTrendingItem } from '@/lib/transformers/feed-item.transformer';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

/**
 * Supabase client type for server-side operations
 */
export type SupabaseServerClient = SupabaseClient<Database>;

/**
 * Parameters for TrendingService methods
 */
export interface TrendingServiceParams {
  sources?: string[];
  window: string;
  sort: string;
  search?: string;
  limit: number;
  offset: number;
}

/**
 * Result structure from TrendingService methods
 */
export interface TrendingServiceResult {
  items: DatabaseTrendingItem[];
  total: number;
}

/**
 * Service for fetching trending items from the database
 */
export class TrendingService {
  constructor(private supabase: SupabaseServerClient) {}

  /**
   * Main entry point that routes to appropriate sub-method based on parameters
   */
  async getTrendingItems(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    // Route to search if search query is provided
    if (params.search) {
      return this.searchTrendingItems(params);
    }

    // Route to popular items if sort is 'popular'
    if (params.sort === 'popular') {
      return this.getPopularItems(params);
    }

    // Default to trending by window
    return this.getTrendingByWindow(params);
  }

  /**
   * Get trending items by time window using get_trending_items database function
   */
  private async getTrendingByWindow(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { window, sources, limit, offset, sort } = params;

    // Build RPC parameters - note: database uses 'hackernews' not 'hn'
    const rpcParams = {
      p_window: window as '15m' | '1h' | '6h' | '24h' | '7d' | '30d',
      p_limit: limit,
      p_offset: offset,
      p_source: sources && sources.length > 0 ? this.mapSourceToDatabase(sources[0]) : null,
      p_trend_type: null,
      p_algorithm_version: 'v2',
    };

    // Call database function
    const { data, error, count } = await this.supabase.rpc('get_trending_items', rpcParams);

    if (error) {
      // If function doesn't exist, try fallback query
      if (error.message.includes('Could not find the function')) {
        return this.getTrendingByWindowFallback(params);
      }
      throw new Error(`Database error: ${error.message || 'Failed to fetch trending items'}`);
    }

    // Calculate total count
    const total = count !== null ? count : (data?.length || 0);

    return {
      items: data || [],
      total,
    };
  }

  /**
   * Fallback method to get trending items when database function is not available
   */
  private async getTrendingByWindowFallback(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { window, sources, limit, offset } = params;

    // Calculate time threshold based on window
    const now = new Date();
    let timeThreshold: Date;
    
    switch (window) {
      case '15m':
        timeThreshold = new Date(now.getTime() - 15 * 60 * 1000);
        break;
      case '1h':
        timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        timeThreshold = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
    }

    // Build query
    let query = this.supabase
      .from('items')
      .select('*', { count: 'exact' })
      .gte('published_at', timeThreshold.toISOString())
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply source filter if provided
    if (sources && sources.length > 0) {
      const dbSources = sources.map(s => this.mapSourceToDatabase(s)) as ('hn' | 'rss' | 'newsapi')[];
      query = query.in('source', dbSources);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message || 'Failed to fetch items'}`);
    }

    // Transform items to include calculated trending metrics
    const items = (data || []).map(item => ({
      ...item,
      trending_score: this.calculateSimpleTrendingScore(item, window),
      velocity: undefined,
      trend_type: undefined,
      confidence_score: undefined,
      popularity_score: undefined,
      view_count: undefined,
    })) as DatabaseTrendingItem[];

    return {
      items,
      total: count || 0,
    };
  }

  /**
   * Calculate a simple trending score when database function is not available
   */
  private calculateSimpleTrendingScore(item: any, window: string): number {
    const now = new Date();
    const published = new Date(item.published_at);
    const ageHours = (now.getTime() - published.getTime()) / (1000 * 60 * 60);
    
    // Base score from engagement
    const baseScore = (item.score || 0) * 0.7 + (item.comment_count || 0) * 0.3;
    
    // Time decay based on window
    let decayRate = 24; // hours for half-life
    switch (window) {
      case '15m': decayRate = 0.25; break;
      case '1h': decayRate = 1; break;
      case '6h': decayRate = 6; break;
      case '24h': decayRate = 24; break;
      case '7d': decayRate = 168; break;
      case '30d': decayRate = 720; break;
    }
    
    const agePenalty = Math.pow(0.5, ageHours / decayRate);
    
    return baseScore * agePenalty;
  }

  /**
   * Search trending items using search_items database function
   */
  private async searchTrendingItems(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { search, sources, limit, offset } = params;

    if (!search) {
      // Fallback to regular trending if no search query
      return this.getTrendingByWindow(params);
    }

    // Build RPC parameters for search
    const rpcParams = {
      p_query: search,
      p_source: sources && sources.length > 0 ? this.mapSourceToDatabase(sources[0]) : null,
      p_limit: limit,
      p_offset: offset,
      p_include_popularity: true,
    };

    // Call search database function
    const { data, error, count } = await this.supabase.rpc('search_items', rpcParams);

    if (error) {
      // If function doesn't exist, try fallback query
      if (error.message.includes('Could not find the function')) {
        return this.searchTrendingItemsFallback(params);
      }
      throw new Error(`Database error: ${error.message || 'Failed to search items'}`);
    }

    const total = count !== null ? count : (data?.length || 0);

    return {
      items: data || [],
      total,
    };
  }

  /**
   * Fallback method to search items when database function is not available
   */
  private async searchTrendingItemsFallback(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { search, sources, limit, offset } = params;

    if (!search) {
      return this.getTrendingByWindow(params);
    }

    // Build query with text search
    let query = this.supabase
      .from('items')
      .select('*', { count: 'exact' })
      .or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply source filter if provided
    if (sources && sources.length > 0) {
      const dbSources = sources.map(s => this.mapSourceToDatabase(s)) as ('hn' | 'rss' | 'newsapi')[];
      query = query.in('source', dbSources);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message || 'Failed to search items'}`);
    }

    // Transform items to include null metrics
    const items = (data || []).map(item => ({
      ...item,
      trending_score: undefined,
      velocity: undefined,
      trend_type: undefined,
      confidence_score: undefined,
      popularity_score: undefined,
      view_count: undefined,
      rank: 1.0,
    })) as DatabaseTrendingItem[];

    return {
      items,
      total: count || 0,
    };
  }

  /**
   * Get popular items using get_popular_content database function
   */
  private async getPopularItems(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { sources, limit, offset } = params;

    // Build RPC parameters
    const rpcParams = {
      p_source: sources && sources.length > 0 ? this.mapSourceToDatabase(sources[0]) : null,
      p_limit: limit,
      p_offset: offset,
      p_min_score: 0, // Default minimum score
    };

    // Call database function
    const { data, error, count } = await this.supabase.rpc('get_popular_content', rpcParams);

    if (error) {
      // If function doesn't exist, try fallback query
      if (error.message.includes('Could not find the function')) {
        return this.getPopularItemsFallback(params);
      }
      throw new Error(`Database error: ${error.message || 'Failed to fetch popular items'}`);
    }

    const total = count !== null ? count : (data?.length || 0);

    return {
      items: data || [],
      total,
    };
  }

  /**
   * Fallback method to get popular items when database function is not available
   */
  private async getPopularItemsFallback(params: TrendingServiceParams): Promise<TrendingServiceResult> {
    const { sources, limit, offset } = params;

    // Build query
    let query = this.supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply source filter if provided
    if (sources && sources.length > 0) {
      const dbSources = sources.map(s => this.mapSourceToDatabase(s)) as ('hn' | 'rss' | 'newsapi')[];
      query = query.in('source', dbSources);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message || 'Failed to fetch popular items'}`);
    }

    // Transform items to include null metrics
    const items = (data || []).map(item => ({
      ...item,
      trending_score: undefined,
      velocity: undefined,
      trend_type: undefined,
      confidence_score: undefined,
      popularity_score: item.score,
      view_count: undefined,
    })) as DatabaseTrendingItem[];

    return {
      items,
      total: count || 0,
    };
  }

  /**
   * Map frontend source names to database source names
   * Frontend uses 'hn' but database uses 'hackernews'
   */
  private mapSourceToDatabase(source: string): string {
    switch (source) {
      case 'hn':
        return 'hackernews';
      case 'rss':
        return 'rss';
      case 'newsapi':
        return 'newsapi';
      default:
        return source;
    }
  }
}
