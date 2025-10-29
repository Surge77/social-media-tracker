import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { CollectorSource } from '@/types/collector.types';

/**
 * Feed API endpoint - Returns unified content feed from all sources
 * 
 * Query Parameters:
 * - limit: Number of items to return (default: 50, max: 100)
 * - source: Filter by source type (hn, rss, newsapi)
 * - since: ISO timestamp for items published after this date
 * 
 * Response Format:
 * {
 *   items: ItemDTO[],
 *   total: number,
 *   hasMore: boolean
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate query parameters
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    );
    
    const source = searchParams.get('source') as CollectorSource | null;
    const since = searchParams.get('since');
    
    // Validate source parameter if provided
    if (source && !['hn', 'rss', 'newsapi'].includes(source)) {
      return NextResponse.json(
        {
          error: 'Invalid source parameter',
          message: 'Source must be one of: hn, rss, newsapi',
        },
        { status: 400 }
      );
    }
    
    // Validate since parameter if provided
    if (since) {
      const sinceDate = new Date(since);
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          {
            error: 'Invalid since parameter',
            message: 'Since must be a valid ISO 8601 timestamp',
          },
          { status: 400 }
        );
      }
    }
    
    // Create Supabase client
    const supabase = createSupabaseServerClient();
    
    // Build query with filters
    let query = supabase
      .from('items')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .limit(limit + 1); // Fetch one extra to determine hasMore
    
    // Apply source filter if provided
    if (source) {
      query = query.eq('source', source);
    }
    
    // Apply since filter if provided
    if (since) {
      query = query.gte('published_at', since);
    }
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        {
          error: 'Database query failed',
          message: error.message,
        },
        { status: 500 }
      );
    }
    
    // Determine if there are more results
    const hasMore = data ? data.length > limit : false;
    const items = hasMore ? data.slice(0, limit) : data || [];
    
    // Transform database rows to ItemDTO format
    const itemDTOs = items.map((item) => ({
      source: item.source,
      title: item.title,
      url: item.url,
      published_at: item.published_at,
      author: item.author || undefined,
      excerpt: item.excerpt || undefined,
      score: item.score || undefined,
      comment_count: item.comment_count || undefined,
    }));
    
    // Return response
    return NextResponse.json({
      items: itemDTOs,
      total: count || 0,
      hasMore,
    });
    
  } catch (error) {
    console.error('Feed API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
