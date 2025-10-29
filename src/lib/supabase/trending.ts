/**
 * Trending data fetching functions
 * Provides specialized functions for trending content analysis
 */

import { supabase } from './client';
import type { 
  TrendingResult, 
  TrendingMetric,
  TrendingWindow,
  ContentSource 
} from '@/types/database.types';
import { DatabaseError } from './queries';

// Trending analysis interfaces
export interface TrendingAnalysis {
  window: TrendingWindow;
  totalItems: number;
  averageScore: number;
  topSources: Array<{
    source: ContentSource;
    count: number;
    averageScore: number;
  }>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
}

export interface TrendingComparison {
  current: TrendingResult[];
  previous: TrendingResult[];
  newEntries: TrendingResult[];
  droppedEntries: TrendingResult[];
  positionChanges: Array<{
    item: TrendingResult;
    previousPosition: number;
    currentPosition: number;
    change: number;
  }>;
}

/**
 * Get trending items for a specific time window
 */
export async function getTrendingByWindow(
  window: TrendingWindow,
  limit: number = 20,
  offset: number = 0
): Promise<TrendingResult[]> {
  try {
    const { data, error } = await supabase.rpc('get_trending_items', {
      p_window: window,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      throw new DatabaseError(
        `Failed to fetch trending items for window ${window}: ${error.message}`,
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
 * Get trending items by source
 */
export async function getTrendingBySource(
  source: ContentSource,
  window: TrendingWindow = '24h',
  limit: number = 20
): Promise<TrendingResult[]> {
  try {
    // Get all trending items and filter by source
    const allTrending = await getTrendingByWindow(window, limit * 2);
    
    return allTrending
      .filter(item => item.source === source)
      .slice(0, limit);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching trending by source: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get trending analysis for a time window
 */
export async function getTrendingAnalysis(window: TrendingWindow): Promise<TrendingAnalysis> {
  try {
    const trendingItems = await getTrendingByWindow(window, 100); // Get more for analysis
    
    if (trendingItems.length === 0) {
      return {
        window,
        totalItems: 0,
        averageScore: 0,
        topSources: [],
        peakHours: []
      };
    }

    // Calculate average score
    const averageScore = trendingItems.reduce((sum, item) => sum + item.score, 0) / trendingItems.length;

    // Analyze by source
    const sourceStats = trendingItems.reduce((acc, item) => {
      const source = item.source as ContentSource;
      if (!acc[source]) {
        acc[source] = { count: 0, totalScore: 0 };
      }
      acc[source].count++;
      acc[source].totalScore += item.score;
      return acc;
    }, {} as Record<ContentSource, { count: number; totalScore: number }>);

    const topSources = Object.entries(sourceStats)
      .map(([source, stats]) => ({
        source: source as ContentSource,
        count: stats.count,
        averageScore: stats.totalScore / stats.count
      }))
      .sort((a, b) => b.count - a.count);

    // Analyze peak hours (simplified - would need more data in real implementation)
    const hourStats = trendingItems.reduce((acc, item) => {
      const hour = new Date(item.published_at).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const peakHours = Object.entries(hourStats)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 hours

    return {
      window,
      totalItems: trendingItems.length,
      averageScore,
      topSources,
      peakHours
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error analyzing trending data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Compare trending items between two time periods
 */
export async function compareTrendingPeriods(
  currentWindow: TrendingWindow,
  previousWindow: TrendingWindow,
  limit: number = 50
): Promise<TrendingComparison> {
  try {
    const [current, previous] = await Promise.all([
      getTrendingByWindow(currentWindow, limit),
      getTrendingByWindow(previousWindow, limit)
    ]);

    // Find new entries (in current but not in previous)
    const previousIds = new Set(previous.map(item => item.id));
    const newEntries = current.filter(item => !previousIds.has(item.id));

    // Find dropped entries (in previous but not in current)
    const currentIds = new Set(current.map(item => item.id));
    const droppedEntries = previous.filter(item => !currentIds.has(item.id));

    // Calculate position changes
    const previousPositions = new Map(previous.map((item, index) => [item.id, index]));
    const positionChanges = current
      .map((item, currentIndex) => {
        const previousIndex = previousPositions.get(item.id);
        if (previousIndex !== undefined) {
          return {
            item,
            previousPosition: previousIndex,
            currentPosition: currentIndex,
            change: previousIndex - currentIndex // Positive = moved up
          };
        }
        return null;
      })
      .filter(Boolean)
      .filter(change => change!.change !== 0) // Only items that changed position
      .sort((a, b) => Math.abs(b!.change) - Math.abs(a!.change)) // Sort by magnitude of change
      .slice(0, 20) as Array<{
        item: TrendingResult;
        previousPosition: number;
        currentPosition: number;
        change: number;
      }>;

    return {
      current,
      previous,
      newEntries,
      droppedEntries,
      positionChanges
    };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error comparing trending periods: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get trending metrics for specific items
 */
export async function getTrendingMetrics(
  itemIds: number[],
  window?: TrendingWindow
): Promise<TrendingMetric[]> {
  try {
    let query = supabase
      .from('trending_metrics')
      .select('*')
      .in('item_id', itemIds)
      .order('created_at', { ascending: false });

    if (window) {
      query = query.eq('window', window);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(
        `Failed to fetch trending metrics: ${error.message}`,
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
      `Unexpected error fetching trending metrics: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get velocity leaders (items with highest velocity)
 */
export async function getVelocityLeaders(
  window: TrendingWindow = '1h',
  limit: number = 20
): Promise<TrendingResult[]> {
  try {
    const trendingItems = await getTrendingByWindow(window, limit * 2);
    
    // Sort by velocity (if available) or trending score
    return trendingItems
      .filter(item => item.velocity !== null && item.velocity > 0)
      .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
      .slice(0, limit);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching velocity leaders: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get breakout items (items with sudden score increases)
 */
export async function getBreakoutItems(
  scoreThreshold: number = 100,
  limit: number = 20
): Promise<TrendingResult[]> {
  try {
    // Get recent trending items with high scores
    const recentTrending = await getTrendingByWindow('1h', limit * 2);
    
    // Filter for items that might be breaking out
    return recentTrending
      .filter(item => item.score >= scoreThreshold)
      .filter(item => item.velocity && item.velocity > item.score * 0.1) // Velocity > 10% of score
      .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
      .slice(0, limit);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching breakout items: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get trending items with high comment engagement
 */
export async function getTrendingWithHighEngagement(
  window: TrendingWindow = '24h',
  minCommentRatio: number = 0.05,
  limit: number = 20
): Promise<TrendingResult[]> {
  try {
    const trendingItems = await getTrendingByWindow(window, limit * 2);
    
    return trendingItems
      .filter(item => {
        const commentRatio = item.comment_count / Math.max(item.score, 1);
        return commentRatio >= minCommentRatio;
      })
      .sort((a, b) => {
        const ratioA = a.comment_count / Math.max(a.score, 1);
        const ratioB = b.comment_count / Math.max(b.score, 1);
        return ratioB - ratioA;
      })
      .slice(0, limit);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Unexpected error fetching high engagement trending: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}