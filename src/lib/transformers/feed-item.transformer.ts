import { FeedItem } from '@/components/feed/types';

/**
 * Database trending item structure from Supabase
 */
export interface DatabaseTrendingItem {
  id: number;
  source: string;
  title: string;
  url: string;
  excerpt: string | null;
  author: string | null;
  score: number;
  comment_count: number;
  published_at: string;
  trending_score?: number;
  velocity?: number | null;
  trend_type?: string;
  confidence_score?: number;
  popularity_score?: number | null;
  view_count?: number;
}

/**
 * Transforms database trending items into frontend FeedItem format
 */
export class FeedItemTransformer {
  private window: string = '1h';

  constructor(window?: string) {
    if (window) {
      this.window = window;
    }
  }

  /**
   * Transform a database item into a FeedItem
   */
  transform(dbItem: DatabaseTrendingItem): FeedItem {
    return {
      id: dbItem.id.toString(),
      title: dbItem.title,
      url: dbItem.url,
      summary: dbItem.excerpt || this.generateSummary(dbItem.title),
      score: dbItem.score,
      comments: dbItem.comment_count,
      velocity: dbItem.velocity || 0,
      source: this.formatSource(dbItem.source, dbItem.url),
      timeAgo: this.calculateTimeAgo(dbItem.published_at),
      views: dbItem.view_count || this.estimateViews(dbItem),
      chips: this.generateChips(dbItem),
      chipTypes: this.generateChipTypes(dbItem),
    };
  }

  /**
   * Generate explanatory chips based on item metrics
   */
  private generateChips(dbItem: DatabaseTrendingItem): string[] {
    const chips: string[] = [];

    // High velocity chip
    if (dbItem.velocity && dbItem.velocity > 100) {
      const windowLabel = this.getWindowLabel();
      chips.push(`High ${windowLabel} velocity`);
    }

    // Freshness chip
    const hoursSincePublished = this.getHoursSince(dbItem.published_at);
    if (hoursSincePublished < 2) {
      chips.push('Fresh');
    }

    // Breakout chip
    if (dbItem.trend_type === 'viral' && dbItem.velocity) {
      const spike = this.calculateSpikePercentage(dbItem);
      chips.push(`Breakout! +${spike}% spike`);
    }

    // High engagement chip
    const engagementRatio = dbItem.comment_count / (dbItem.score || 1);
    if (engagementRatio > 0.3) {
      chips.push('High comment rate');
    }

    return chips;
  }

  /**
   * Generate parallel array of chip type identifiers
   */
  private generateChipTypes(dbItem: DatabaseTrendingItem): string[] {
    const chipTypes: string[] = [];

    // High velocity chip type
    if (dbItem.velocity && dbItem.velocity > 100) {
      chipTypes.push('velocity');
    }

    // Freshness chip type
    const hoursSincePublished = this.getHoursSince(dbItem.published_at);
    if (hoursSincePublished < 2) {
      chipTypes.push('freshness');
    }

    // Breakout chip type
    if (dbItem.trend_type === 'viral' && dbItem.velocity) {
      chipTypes.push('breakout');
    }

    // High engagement chip type
    const engagementRatio = dbItem.comment_count / (dbItem.score || 1);
    if (engagementRatio > 0.3) {
      chipTypes.push('engagement');
    }

    return chipTypes;
  }

  /**
   * Calculate relative time string from ISO timestamp
   */
  calculateTimeAgo(publishedAt: string): string {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes > 0) {
        return `${diffHours}h ${remainingMinutes}m ago`;
      }
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Format database source code to display-friendly domain name
   */
  formatSource(source: string, url: string): string {
    switch (source) {
      case 'hn':
      case 'hackernews':
        return 'news.ycombinator.com';
      case 'newsapi':
        // Extract domain from URL for NewsAPI sources
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.replace('www.', '');
        } catch {
          return 'newsapi.org';
        }
      case 'rss':
        // Extract domain from URL for RSS sources
        try {
          const urlObj = new URL(url);
          return urlObj.hostname.replace('www.', '');
        } catch {
          return 'rss';
        }
      default:
        return source;
    }
  }

  /**
   * Estimate views using formula: score * 15 + comment_count * 50
   */
  estimateViews(dbItem: DatabaseTrendingItem): number {
    return dbItem.score * 15 + dbItem.comment_count * 50;
  }

  /**
   * Generate a summary from title if excerpt is not available
   */
  private generateSummary(title: string): string {
    // Use first 100 characters of title as fallback summary
    if (title.length > 100) {
      return title.substring(0, 97) + '...';
    }
    return title;
  }

  /**
   * Get human-readable window label
   */
  private getWindowLabel(): string {
    switch (this.window) {
      case '15m':
        return '15m';
      case '1h':
        return '1h';
      case '6h':
        return '6h';
      case '24h':
        return '24h';
      case '7d':
        return '7d';
      case '30d':
        return '30d';
      default:
        return this.window;
    }
  }

  /**
   * Calculate hours since publication
   */
  private getHoursSince(publishedAt: string): number {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffMs = now.getTime() - published.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Calculate spike percentage for breakout items
   */
  private calculateSpikePercentage(dbItem: DatabaseTrendingItem): number {
    // Use velocity as a proxy for spike percentage
    // Higher velocity indicates a bigger spike
    if (!dbItem.velocity) return 0;
    
    // Map velocity to spike percentage
    // velocity > 500 = 500%+
    // velocity 300-500 = 300-500%
    // velocity 100-300 = 100-300%
    if (dbItem.velocity >= 500) {
      return 500;
    } else if (dbItem.velocity >= 300) {
      return Math.floor(dbItem.velocity);
    } else {
      return Math.floor(dbItem.velocity * 1.5);
    }
  }
}
