import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { TrendingService } from '@/lib/services/trending.service';
import { FeedItemTransformer } from '@/lib/transformers/feed-item.transformer';
import { FeedItem } from '@/components/feed/types';

/**
 * Allowed values for source parameter
 */
const ALLOWED_SOURCES = ['hn', 'rss', 'newsapi'];

/**
 * Allowed values for window parameter
 */
const ALLOWED_WINDOWS = ['15m', '1h', '6h', '24h', '7d', '30d'];

/**
 * Allowed values for sort parameter
 */
const ALLOWED_SORTS = ['trending', 'velocity', 'popular'];

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * API response structure
 */
interface TrendingAPIResponse {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
  nextPage?: number;
  metadata: {
    window: string;
    sources: string[];
    sort: string;
    page: number;
    limit: number;
    timestamp: string;
  };
}

/**
 * Create error response with appropriate status code
 */
function createErrorResponse(
  status: number,
  error: string,
  message: string,
  code?: string,
  details?: any
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * GET /api/trending
 * Fetch trending items from the database with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const sourcesParam = searchParams.get('sources');
    const windowParam = searchParams.get('window') || '1h';
    const sortParam = searchParams.get('sort') || 'trending';
    const searchParam = searchParams.get('search');
    const limitParam = searchParams.get('limit') || '20';
    const pageParam = searchParams.get('page') || '1';

    // Validate and parse sources
    let sources: string[] | undefined;
    if (sourcesParam) {
      sources = sourcesParam.split(',').map(s => s.trim());
      const invalidSources = sources.filter(s => !ALLOWED_SOURCES.includes(s));
      if (invalidSources.length > 0) {
        return createErrorResponse(
          400,
          'Invalid Parameter',
          `Invalid source values: ${invalidSources.join(', ')}`,
          'INVALID_SOURCE',
          { allowedSources: ALLOWED_SOURCES, invalidSources }
        );
      }
    }

    // Validate window
    if (!ALLOWED_WINDOWS.includes(windowParam)) {
      return createErrorResponse(
        400,
        'Invalid Parameter',
        `Invalid window value: ${windowParam}`,
        'INVALID_WINDOW',
        { allowedWindows: ALLOWED_WINDOWS }
      );
    }

    // Validate sort
    if (!ALLOWED_SORTS.includes(sortParam)) {
      return createErrorResponse(
        400,
        'Invalid Parameter',
        `Invalid sort value: ${sortParam}`,
        'INVALID_SORT',
        { allowedSorts: ALLOWED_SORTS }
      );
    }

    // Parse and validate limit
    const limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return createErrorResponse(
        400,
        'Invalid Parameter',
        'Limit must be between 1 and 100',
        'INVALID_LIMIT'
      );
    }

    // Parse and validate page
    const page = parseInt(pageParam, 10);
    if (isNaN(page) || page < 1) {
      return createErrorResponse(
        400,
        'Invalid Parameter',
        'Page must be a positive integer',
        'INVALID_PAGE'
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Create Supabase client
    let supabase;
    try {
      supabase = createSupabaseServerClient();
    } catch (error) {
      console.error('[API /trending] Failed to create Supabase client:', error);
      return createErrorResponse(
        503,
        'Service Unavailable',
        'Database connection failed',
        'DB_CONNECTION_ERROR'
      );
    }

    // Create TrendingService instance
    const trendingService = new TrendingService(supabase);

    // Fetch trending items
    let result;
    try {
      result = await trendingService.getTrendingItems({
        sources,
        window: windowParam,
        sort: sortParam,
        search: searchParam || undefined,
        limit,
        offset,
      });
    } catch (error: any) {
      console.error('[API /trending] Database query failed:', {
        error: error.message,
        stack: error.stack,
        params: { sources, window: windowParam, sort: sortParam, search: searchParam, limit, offset },
      });
      
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch trending items',
        'DB_QUERY_ERROR',
        { message: error.message }
      );
    }

    // Transform database results to FeedItems
    const transformer = new FeedItemTransformer(windowParam);
    const items = result.items.map(item => transformer.transform(item));

    // Calculate pagination metadata
    const hasMore = result.total > offset + items.length;
    const nextPage = hasMore ? page + 1 : undefined;

    // Build response
    const response: TrendingAPIResponse = {
      items,
      total: result.total,
      hasMore,
      nextPage,
      metadata: {
        window: windowParam,
        sources: sources || [],
        sort: sortParam,
        page,
        limit,
        timestamp: new Date().toISOString(),
      },
    };

    // Log performance
    const duration = Date.now() - startTime;
    console.log('[API /trending] Request completed:', {
      duration: `${duration}ms`,
      itemCount: items.length,
      total: result.total,
      params: { sources, window: windowParam, sort: sortParam, search: searchParam, page, limit },
    });

    return NextResponse.json(response);

  } catch (error: any) {
    // Catch-all error handler
    console.error('[API /trending] Unexpected error:', {
      error: error.message,
      stack: error.stack,
    });

    return createErrorResponse(
      500,
      'Internal Server Error',
      'An unexpected error occurred',
      'INTERNAL_ERROR'
    );
  }
}
