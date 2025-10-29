/**
 * Trending algorithm and popularity metrics types
 * Specialized types for the new trending architecture
 */

import type { 
  ContentSource, 
  TrendingWindow, 
  TrendType, 
  AlgorithmVersion,
  Item,
  ContentPopularity,
  TrendingMetric
} from './database.types';

// Trending algorithm configuration
export interface TrendingAlgorithmParams {
  version: AlgorithmVersion;
  window: TrendingWindow;
  sourceWeights: Partial<Record<ContentSource, number>>;
  engagementWeights: {
    score: number;
    comments: number;
    shares: number;
    views: number;
  };
  timeDecayFactor: number;
  recencyBoost: number;
  confidenceThreshold: number;
}

// Popularity calculation input
export interface PopularityInput {
  itemId: number;
  source: ContentSource;
  engagementCount: number;
  shareCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt: string;
}

// Trending detection result
export interface TrendingDetectionResult {
  itemId: number;
  trendingScore: number;
  velocity: number;
  trendType: TrendType;
  confidence: number;
  explanation: string[];
  algorithm: AlgorithmVersion;
  window: TrendingWindow;
}

// Content with full trending data
export interface ContentWithTrendingData extends Item {
  popularity: ContentPopularity;
  trendingMetrics: TrendingMetric[];
  currentTrending?: TrendingDetectionResult;
}

// Trending explanation components
export interface TrendingExplanation {
  itemId: number;
  reasons: Array<{
    factor: 'score' | 'velocity' | 'engagement' | 'recency' | 'source_quality';
    weight: number;
    value: number;
    description: string;
  }>;
  algorithm: AlgorithmVersion;
  confidence: number;
  lastUpdated: string;
}

// Source-specific data formats
export interface HackerNewsData {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
  kids?: number[];
  type: 'story' | 'comment' | 'job' | 'poll' | 'pollopt';
}

export interface RSSFeedData {
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  author?: string;
  guid?: string;
  source: string;
  feedTitle: string;
}

export interface NewsAPIData {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

// Data transformation interfaces
export interface SourceDataTransformer<T> {
  transform(data: T): {
    title: string;
    url: string;
    excerpt?: string;
    author?: string;
    score: number;
    commentCount: number;
    publishedAt: string;
    externalId: string;
    rawData: T;
  };
}

// Trending algorithm interfaces
export interface TrendDetector {
  detect(items: Item[], params: TrendingAlgorithmParams): Promise<TrendingDetectionResult[]>;
  explain(result: TrendingDetectionResult): TrendingExplanation;
}

export interface PopularityCalculator {
  calculate(input: PopularityInput, params: TrendingAlgorithmParams): Promise<{
    score: number;
    velocity: number;
    confidence: number;
  }>;
}

// Time decay function interface
export interface TimeDecayFunction {
  calculate(publishedAt: string, window: TrendingWindow, decayFactor: number): number;
}

// Trending metrics aggregation
export interface TrendingMetricsAggregation {
  window: TrendingWindow;
  totalItems: number;
  averageScore: number;
  averageVelocity: number;
  topTrendTypes: Array<{
    type: TrendType;
    count: number;
    percentage: number;
  }>;
  sourceBreakdown: Array<{
    source: ContentSource;
    count: number;
    averageScore: number;
    averageVelocity: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    count: number;
    averageScore: number;
  }>;
}

// Content discovery filters (extended)
export interface AdvancedContentFilters {
  sources?: ContentSource[];
  trendTypes?: TrendType[];
  timeWindows?: TrendingWindow[];
  scoreRange?: {
    min: number;
    max: number;
  };
  velocityRange?: {
    min: number;
    max: number;
  };
  confidenceRange?: {
    min: number;
    max: number;
  };
  publishedRange?: {
    start: string;
    end: string;
  };
  engagementRatio?: {
    min: number; // comments/score ratio
    max: number;
  };
  keywords?: string[];
  excludeKeywords?: string[];
  authors?: string[];
  domains?: string[];
}

// API response types for trending endpoints
export interface TrendingAnalyticsResponse {
  summary: TrendingMetricsAggregation;
  trending: ContentWithTrendingData[];
  explanations: Record<number, TrendingExplanation>;
  algorithm: {
    version: AlgorithmVersion;
    params: TrendingAlgorithmParams;
    lastUpdated: string;
  };
}

export interface PopularityAnalyticsResponse {
  items: Array<{
    item: Item;
    popularity: ContentPopularity;
    rank: number;
    percentile: number;
  }>;
  metrics: {
    totalItems: number;
    averagePopularity: number;
    medianPopularity: number;
    topPercentileThreshold: number;
  };
  trends: {
    rising: Item[];
    declining: Item[];
    stable: Item[];
  };
}

// Content collection status
export interface ContentCollectionStatus {
  source: ContentSource;
  lastCollected: string;
  itemsCollected: number;
  errors: string[];
  nextCollection: string;
  isHealthy: boolean;
  averageLatency: number;
  successRate: number;
}

// Batch processing types
export interface BatchProcessingResult {
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    itemId?: number;
    error: string;
    timestamp: string;
  }>;
  duration: number;
  startTime: string;
  endTime: string;
}

// Real-time trending updates
export interface TrendingUpdate {
  type: 'new_trending' | 'score_update' | 'velocity_change' | 'trend_type_change';
  itemId: number;
  previousValue?: number;
  newValue: number;
  timestamp: string;
  window: TrendingWindow;
}

// Export all types for easy importing
export type {
  // Re-export from database types for convenience
  ContentSource,
  TrendingWindow,
  TrendType,
  AlgorithmVersion,
  Item,
  ContentPopularity,
  TrendingMetric
} from './database.types';