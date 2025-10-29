// Main types export file
export * from './database.types'
export * from './trending.types'
export * from './collector.types'

// Re-export commonly used types for convenience
export type {
  // Database types
  Item,
  ItemInsert,
  ItemUpdate,
  ContentPopularity,
  ContentPopularityInsert,
  ContentPopularityUpdate,
  TrendingMetric,
  TrendingMetricInsert,
  TrendingMetricUpdate,
  ItemWithTrending,
  ItemWithPopularity,
  SearchResult,
  TrendingResult,
  PopularContentResult,
  ContentSource,
  TrendingWindow,
  TrendType,
  AlgorithmVersion,
  TrendingAlgorithmConfig,
  PopularityMetrics,
  ContentFilters,
  TrendingApiResponse,
  PopularContentApiResponse,
  Database,
  Json
} from './database.types'

export type {
  // Trending algorithm types
  TrendingAlgorithmParams,
  PopularityInput,
  TrendingDetectionResult,
  ContentWithTrendingData,
  TrendingExplanation,
  HackerNewsData,
  RSSFeedData,
  NewsAPIData,
  SourceDataTransformer,
  TrendDetector,
  PopularityCalculator,
  TimeDecayFunction,
  TrendingMetricsAggregation,
  AdvancedContentFilters,
  TrendingAnalyticsResponse,
  PopularityAnalyticsResponse,
  ContentCollectionStatus,
  BatchProcessingResult,
  TrendingUpdate
} from './trending.types'

export type {
  // Collector types
  CollectorSource,
  ItemDTO,
  Collector,
  RSSSource,
  RSSConfig,
  CollectorConfig,
  HNStory,
  NewsAPIArticle,
  NewsAPIResponse,
  RSSItem,
  LogEntry,
  CollectionResult,
  BatchCollectionResult
} from './collector.types'

export {
  // Collector schemas
  ItemDTOSchema,
  RSSSourceSchema,
  RSSConfigSchema,
  CollectorConfigSchema
} from './collector.types'