/**
 * React Query hooks for Supabase data operations
 * Provides caching, error handling, and automatic refetching for database operations
 */

'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { 
  ContentSource, 
  TrendingWindow 
} from '@/types/database.types';
import {
  getItems,
  getItemById,
  searchItems,
  getTrendingItems,
  getItemsBySource,
  getRecentItems,
  getTopItems,
  getItemsCountBySource,
  type ItemsQueryParams,
  type SearchQueryParams,
  type TrendingQueryParams
} from '@/lib/supabase/queries';
import {
  getFilteredItems,
  advancedSearchItems,
  getFilteredTrendingItems,
  getPopularItemsInTimeframe,
  getHighEngagementItems,
  type ContentFilter,
  type SortOptions,
  type PaginationOptions
} from '@/lib/supabase/filters';
import {
  getTrendingByWindow,
  getTrendingBySource,
  getTrendingAnalysis,
  compareTrendingPeriods,
  getVelocityLeaders,
  getBreakoutItems,
  getTrendingWithHighEngagement
} from '@/lib/supabase/trending';

// Query key generators for consistent caching
export const queryKeys = {
  items: (params?: ItemsQueryParams) => ['items', params],
  item: (id: number) => ['items', id],
  search: (params: SearchQueryParams) => ['search', params],
  trending: (params?: TrendingQueryParams) => ['trending', params],
  trendingByWindow: (window: TrendingWindow, limit?: number, offset?: number) => 
    ['trending', 'window', window, limit, offset],
  trendingBySource: (source: ContentSource, window?: TrendingWindow, limit?: number) => 
    ['trending', 'source', source, window, limit],
  trendingAnalysis: (window: TrendingWindow) => ['trending', 'analysis', window],
  trendingComparison: (current: TrendingWindow, previous: TrendingWindow, limit?: number) => 
    ['trending', 'comparison', current, previous, limit],
  itemsBySource: (source: ContentSource, params?: Omit<ItemsQueryParams, 'source'>) => 
    ['items', 'source', source, params],
  recentItems: (limit?: number) => ['items', 'recent', limit],
  topItems: (limit?: number) => ['items', 'top', limit],
  itemsCount: () => ['items', 'count'],
  filteredItems: (filter: ContentFilter, sort?: SortOptions, pagination?: PaginationOptions) => 
    ['items', 'filtered', filter, sort, pagination],
  advancedSearch: (query: string, filter?: Omit<ContentFilter, 'keywords'>, sort?: SortOptions, pagination?: PaginationOptions) => 
    ['search', 'advanced', query, filter, sort, pagination],
  filteredTrending: (window?: TrendingWindow, filter?: Omit<ContentFilter, 'dateRange'>, pagination?: PaginationOptions) => 
    ['trending', 'filtered', window, filter, pagination],
  popularInTimeframe: (hours?: number, limit?: number) => ['items', 'popular', hours, limit],
  highEngagement: (minRatio?: number, limit?: number) => ['items', 'engagement', minRatio, limit],
  velocityLeaders: (window?: TrendingWindow, limit?: number) => ['trending', 'velocity', window, limit],
  breakoutItems: (threshold?: number, limit?: number) => ['trending', 'breakout', threshold, limit],
  trendingHighEngagement: (window?: TrendingWindow, minRatio?: number, limit?: number) => 
    ['trending', 'engagement', window, minRatio, limit]
};

// Default query options
const defaultQueryOptions = {
  staleTime: 30000, // 30 seconds
  refetchInterval: 60000, // 1 minute
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof Error && 'code' in error) {
      // Don't retry client errors (4xx)
      if ((error as any).code?.startsWith('4')) {
        return false;
      }
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
};

// Basic item queries
export function useItems(params?: ItemsQueryParams) {
  return useQuery({
    queryKey: queryKeys.items(params),
    queryFn: () => getItems(params),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: queryKeys.item(id),
    queryFn: () => getItemById(id),
    ...defaultQueryOptions,
    enabled: id > 0
  });
}

export function useItemsBySource(source: ContentSource, params?: Omit<ItemsQueryParams, 'source'>) {
  return useQuery({
    queryKey: queryKeys.itemsBySource(source, params),
    queryFn: () => getItemsBySource(source, params),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useRecentItems(limit?: number) {
  return useQuery({
    queryKey: queryKeys.recentItems(limit),
    queryFn: () => getRecentItems(limit),
    ...defaultQueryOptions
  });
}

export function useTopItems(limit?: number) {
  return useQuery({
    queryKey: queryKeys.topItems(limit),
    queryFn: () => getTopItems(limit),
    ...defaultQueryOptions
  });
}

export function useItemsCount() {
  return useQuery({
    queryKey: queryKeys.itemsCount(),
    queryFn: getItemsCountBySource,
    staleTime: 300000, // 5 minutes - counts change less frequently
    refetchInterval: 300000
  });
}

// Search queries
export function useSearchItems(params: SearchQueryParams) {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => searchItems(params),
    ...defaultQueryOptions,
    enabled: params.query.length > 0,
    placeholderData: keepPreviousData
  });
}

export function useAdvancedSearch(
  searchQuery: string,
  filter?: Omit<ContentFilter, 'keywords'>,
  sort?: SortOptions,
  pagination?: PaginationOptions
) {
  return useQuery({
    queryKey: queryKeys.advancedSearch(searchQuery, filter, sort, pagination),
    queryFn: () => advancedSearchItems(searchQuery, filter, sort, pagination),
    ...defaultQueryOptions,
    enabled: searchQuery.length > 0,
    placeholderData: keepPreviousData
  });
}

// Trending queries
export function useTrendingItems(params?: TrendingQueryParams) {
  return useQuery({
    queryKey: queryKeys.trending(params),
    queryFn: () => getTrendingItems(params),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useTrendingByWindow(
  window: TrendingWindow,
  limit?: number,
  offset?: number
) {
  return useQuery({
    queryKey: queryKeys.trendingByWindow(window, limit, offset),
    queryFn: () => getTrendingByWindow(window, limit, offset),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useTrendingBySource(
  source: ContentSource,
  window?: TrendingWindow,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.trendingBySource(source, window, limit),
    queryFn: () => getTrendingBySource(source, window, limit),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useTrendingAnalysis(window: TrendingWindow) {
  return useQuery({
    queryKey: queryKeys.trendingAnalysis(window),
    queryFn: () => getTrendingAnalysis(window),
    staleTime: 300000, // 5 minutes - analysis is more expensive
    refetchInterval: 300000
  });
}

export function useTrendingComparison(
  currentWindow: TrendingWindow,
  previousWindow: TrendingWindow,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.trendingComparison(currentWindow, previousWindow, limit),
    queryFn: () => compareTrendingPeriods(currentWindow, previousWindow, limit),
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000
  });
}

// Filtered queries
export function useFilteredItems(
  filter: ContentFilter,
  sort?: SortOptions,
  pagination?: PaginationOptions
) {
  return useQuery({
    queryKey: queryKeys.filteredItems(filter, sort, pagination),
    queryFn: () => getFilteredItems(filter, sort, pagination),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

export function useFilteredTrending(
  window?: TrendingWindow,
  filter?: Omit<ContentFilter, 'dateRange'>,
  pagination?: PaginationOptions
) {
  return useQuery({
    queryKey: queryKeys.filteredTrending(window, filter, pagination),
    queryFn: () => getFilteredTrendingItems(window, filter, pagination),
    ...defaultQueryOptions,
    placeholderData: keepPreviousData
  });
}

// Specialized queries
export function usePopularItemsInTimeframe(hours?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.popularInTimeframe(hours, limit),
    queryFn: () => getPopularItemsInTimeframe(hours, limit),
    ...defaultQueryOptions
  });
}

export function useHighEngagementItems(minEngagementRatio?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.highEngagement(minEngagementRatio, limit),
    queryFn: () => getHighEngagementItems(minEngagementRatio, limit),
    ...defaultQueryOptions
  });
}

export function useVelocityLeaders(window?: TrendingWindow, limit?: number) {
  return useQuery({
    queryKey: queryKeys.velocityLeaders(window, limit),
    queryFn: () => getVelocityLeaders(window, limit),
    ...defaultQueryOptions
  });
}

export function useBreakoutItems(scoreThreshold?: number, limit?: number) {
  return useQuery({
    queryKey: queryKeys.breakoutItems(scoreThreshold, limit),
    queryFn: () => getBreakoutItems(scoreThreshold, limit),
    staleTime: 60000, // 1 minute - breakout items change quickly
    refetchInterval: 60000
  });
}

export function useTrendingWithHighEngagement(
  window?: TrendingWindow,
  minCommentRatio?: number,
  limit?: number
) {
  return useQuery({
    queryKey: queryKeys.trendingHighEngagement(window, minCommentRatio, limit),
    queryFn: () => getTrendingWithHighEngagement(window, minCommentRatio, limit),
    ...defaultQueryOptions
  });
}