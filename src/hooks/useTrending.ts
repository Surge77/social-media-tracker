'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FeedParams } from '@/components/feed/types';
import { fetchTrending, handleTrendingError, APIError } from '@/lib/api/trending';
import { performanceMonitor } from '@/lib/performance';

// Generate query key based on filter parameters
export const generateTrendingQueryKey = (params: FeedParams): string[] => {
  const key = ['trending'];
  
  // Add parameters to query key for proper caching
  if (params.sources) key.push(`sources:${params.sources}`);
  if (params.window) key.push(`window:${params.window}`);
  if (params.sort) key.push(`sort:${params.sort}`);
  if (params.search) key.push(`search:${params.search}`);
  if (params.limit) key.push(`limit:${params.limit}`);
  if (params.page) key.push(`page:${params.page}`);
  
  return key;
};

// Main hook for trending data fetching
export const useTrending = (params: FeedParams) => {
  return useQuery({
    queryKey: generateTrendingQueryKey(params),
    queryFn: async () => {
      const endpoint = `/api/trending?${new URLSearchParams(params as any).toString()}`;
      performanceMonitor.markDataFetchStart(endpoint);
      
      try {
        const result = await fetchTrending(params);
        performanceMonitor.markDataFetchComplete(endpoint, true);
        return result;
      } catch (error) {
        performanceMonitor.markDataFetchComplete(endpoint, false);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds - data is considered fresh for 30 seconds
    refetchInterval: 60000, // 1 minute - automatically refetch every minute
    retry: (failureCount, error) => {
      const apiError = error as APIError;
      const errorHandling = handleTrendingError(apiError);
      
      if (!errorHandling.retry) {
        return false;
      }
      
      // Retry up to 3 times for server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex, error) => {
      const apiError = error as APIError;
      const errorHandling = handleTrendingError(apiError);
      
      if (errorHandling.delay) {
        return errorHandling.delay;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    // Enable background refetching when window regains focus
    refetchOnWindowFocus: true,
    // Enable background refetching when network reconnects
    refetchOnReconnect: true,
    // Keep previous data while fetching new data (for better UX)
    placeholderData: keepPreviousData,
  });
};

// Helper hook for infinite queries (for pagination)
export const useTrendingInfinite = (params: Omit<FeedParams, 'page'>) => {
  return useQuery({
    queryKey: [...generateTrendingQueryKey(params), 'infinite'],
    queryFn: () => fetchTrending({ ...params, page: 1 }),
    staleTime: 30000,
    refetchInterval: 60000,
    retry: (failureCount, error) => {
      const apiError = error as APIError;
      const errorHandling = handleTrendingError(apiError);
      return errorHandling.retry && failureCount < 3;
    },
    retryDelay: (attemptIndex, error) => {
      const apiError = error as APIError;
      const errorHandling = handleTrendingError(apiError);
      return errorHandling.delay || Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
};