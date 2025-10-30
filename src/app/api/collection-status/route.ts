import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * Collection status response structure
 */
interface CollectionStatusResponse {
  lastCollectionTime: string | null;
  itemCount: number;
  itemsBySource: {
    hn: number;
    rss: number;
    newsapi: number;
  };
  oldestItem: string | null;
  newestItem: string | null;
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  timestamp: string;
}

/**
 * Create error response with appropriate status code
 */
function createErrorResponse(
  status: number,
  error: string,
  message: string,
  code?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * GET /api/collection-status
 * Fetch collection statistics from the database
 */
export async function GET() {
  try {
    // Create Supabase client
    let supabase;
    try {
      supabase = createSupabaseServerClient();
    } catch (error) {
      console.error('[API /collection-status] Failed to create Supabase client:', error);
      return createErrorResponse(
        503,
        'Service Unavailable',
        'Database connection failed',
        'DB_CONNECTION_ERROR'
      );
    }

    // Query total item count
    const { count: totalCount, error: countError } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[API /collection-status] Failed to count items:', countError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch collection statistics',
        'DB_QUERY_ERROR'
      );
    }

    // Query items by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('items')
      .select('source');

    if (sourceError) {
      console.error('[API /collection-status] Failed to fetch items by source:', sourceError);
      return createErrorResponse(
        500,
        'Database Error',
        'Failed to fetch collection statistics',
        'DB_QUERY_ERROR'
      );
    }

    // Count items by source
    const itemsBySource = {
      hn: 0,
      rss: 0,
      newsapi: 0,
    };

    if (sourceData) {
      sourceData.forEach((item) => {
        if (item.source in itemsBySource) {
          itemsBySource[item.source as keyof typeof itemsBySource]++;
        }
      });
    }

    // Query oldest and newest items
    const { data: oldestData, error: oldestError } = await supabase
      .from('items')
      .select('created_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (oldestError && oldestError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine for empty database
      console.error('[API /collection-status] Failed to fetch oldest item:', oldestError);
    }

    const { data: newestData, error: newestError } = await supabase
      .from('items')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (newestError && newestError.code !== 'PGRST116') {
      console.error('[API /collection-status] Failed to fetch newest item:', newestError);
    }

    // Build response
    const response: CollectionStatusResponse = {
      lastCollectionTime: newestData?.created_at || null,
      itemCount: totalCount || 0,
      itemsBySource,
      oldestItem: oldestData?.created_at || null,
      newestItem: newestData?.created_at || null,
    };

    console.log('[API /collection-status] Request completed:', {
      itemCount: response.itemCount,
      itemsBySource: response.itemsBySource,
    });

    return NextResponse.json(response);

  } catch (error: any) {
    // Catch-all error handler
    console.error('[API /collection-status] Unexpected error:', {
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
