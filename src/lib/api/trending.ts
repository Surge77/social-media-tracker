import { FeedParams, FeedResponse } from '@/components/feed/types';

// API Error interface for proper error handling
export interface APIError extends Error {
  status?: number;
  code?: string;
}

// Fetch trending items from the API
export const fetchTrending = async (params: FeedParams): Promise<FeedResponse> => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params.sources) queryParams.set('sources', params.sources);
  if (params.window) queryParams.set('window', params.window);
  if (params.sort) queryParams.set('sort', params.sort);
  if (params.search) queryParams.set('search', params.search);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.page) queryParams.set('page', params.page.toString());
  
  const url = `/api/trending?${queryParams.toString()}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Failed to fetch trending items') as APIError;
      error.status = response.status;
      error.code = errorData.code || 'FETCH_ERROR';
      throw error;
    }
    
    const data = await response.json();
    
    return {
      items: data.items,
      total: data.total,
      hasMore: data.hasMore,
      nextPage: data.nextPage,
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error') as APIError;
      networkError.status = 0;
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    // Re-throw API errors
    throw error;
  }
};

// Error handling function
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