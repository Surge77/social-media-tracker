/**
 * Supabase-powered trending hooks
 * Enhanced version of useTrending that uses real Supabase data
 */

'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FeedParams } from '@/components/feed/types';
import { fetchTrending, handleTrendingError, getTrendingSummary, APIError } from '@/lib/api/supabase-trending';
import { performanceMonitor } from '@/lib/performance';

// Generate query key based on filter parameters
export const generateSupabaseTrendingQueryKey = (params: FeedParams): string[] => {
  const key = ['supabase-trending'];
  
  // Add parameters to query key for proper caching
  if (params.sources) key.push(`sources:${params.sources}`);
  if (params.window) key.push(`window:${params.window}`);
  if (params.sort) key.push(`sort:${params.sort}`);
  if (params.search) key.push(`search:${params.search}`);
  if (params.limit) key.push(`limit:${params.limit}`);
  if (params.page) key.push(`page:${params.page}`);
  
  return key;
};

// Main hook for Supabase trending data fetching
export const useSupabaseTrending = (params: FeedParams) => {
  return useQuery({
    queryKey: generateSupabaseTrendingQueryKey(params),
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

// Hook for trending summary data
export const useSupabaseTrendingSummary = () => {
  return useQuery({
    queryKey: ['supabase-trending-summary'],
    queryFn: async () => {
      performanceMonitor.markDataFetchStart('trending-summary');
      
      try {
        const result = await getTrendingSummary();
        performanceMonitor.markDataFetchComplete('trending-summary', true);
        return result;
      } catch (error) {
        performanceMonitor.markDataFetchComplete('trending-summary', false);
        throw error;
      }
    },
    staleTime: 120000, // 2 minutes - summary changes less frequently
    refetchInterval: 300000, // 5 minutes
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
  });
};

// Hook for real-time trending updates (shorter refresh interval)
export const useSupabaseRealTimeTrending = (params: FeedParams) => {
  return useQuery({
    queryKey: [...generateSupabaseTrendingQueryKey(params), 'realtime'],
    queryFn: () => fetchTrending(params),
    staleTime: 15000, // 15 seconds - more aggressive for real-time
    refetchInterval: 30000, // 30 seconds - faster updates
    retry: (failureCount, error) => {
      const apiError = error as APIError;
      const errorHandling = handleTrendingError(apiError);
      return errorHandling.retry && failureCount < 2; // Fewer retries for real-time
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Faster retry
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });
};

// Hook for prefetching next page
export const usePrefetchSupabaseTrending = (params: FeedParams) => {
  const nextPageParams = { ...params, page: (params.page || 1) + 1 };
  
  return useQuery({
    queryKey: generateSupabaseTrendingQueryKey(nextPageParams),
    queryFn: () => fetchTrending(nextPageParams),
    staleTime: 60000, // 1 minute
    enabled: false, // Only fetch when explicitly enabled
    retry: false, // Don't retry prefetch queries
  });
};

// Export the original hook name for backward compatibility
export const useTrending = useSupabaseTrending;
export const useTrendingInfinite = useSupabaseTrending; // Simplified - can be enhanced later