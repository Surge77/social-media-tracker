// Collector types for unified data fetch system
// This file contains interfaces and types for data collection from multiple sources

import { z } from 'zod'

// Source type for collectors (aligned with database schema)
export type CollectorSource = 'hn' | 'rss' | 'newsapi'

// Normalized item data transfer object
export interface ItemDTO {
  source: CollectorSource
  title: string
  url: string
  published_at: string
  author?: string
  excerpt?: string
  score?: number
  comment_count?: number
}

// Base collector interface
export interface Collector {
  collect(): Promise<ItemDTO[]>
}

// RSS source configuration
export interface RSSSource {
  name: string
  url: string
  category?: string
}

// RSS configuration
export interface RSSConfig {
  sources: RSSSource[]
  maxItemsPerFeed: number
  maxAgeHours: number
}

// Collector configuration
export interface CollectorConfig {
  hn: {
    maxStories: number
    concurrentRequests: number
  }
  rss: {
    timeout: number
    maxItemsPerFeed: number
  }
  newsapi: {
    country: string
    category: string
    pageSize: number
  }
}

// Hacker News API types
export interface HNStory {
  id: number
  title: string
  url?: string
  by: string
  time: number
  score: number
  descendants?: number
  type: 'story' | 'job' | 'poll'
}

// NewsAPI types
export interface NewsAPIArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
}

export interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: NewsAPIArticle[]
}

// RSS feed item types (from rss-parser)
// Note: rss-parser provides its own types, but we define this for clarity
export interface RSSItem {
  title?: string
  link?: string
  pubDate?: string
  creator?: string
  author?: string
  content?: string
  contentSnippet?: string
  isoDate?: string
  guid?: string
  categories?: string[]
  enclosure?: {
    url: string
    type?: string
    length?: number
  }
}

// Zod validation schemas
export const ItemDTOSchema = z.object({
  source: z.enum(['hn', 'rss', 'newsapi']),
  title: z.string().min(1).max(500),
  url: z.string().url(),
  published_at: z.string().datetime(),
  author: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  score: z.number().int().min(0).optional(),
  comment_count: z.number().int().min(0).optional(),
})

export const RSSSourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  category: z.string().optional(),
})

export const RSSConfigSchema = z.object({
  sources: z.array(RSSSourceSchema),
  maxItemsPerFeed: z.number().int().positive(),
  maxAgeHours: z.number().int().positive(),
})

export const CollectorConfigSchema = z.object({
  hn: z.object({
    maxStories: z.number().int().positive(),
    concurrentRequests: z.number().int().positive(),
  }),
  rss: z.object({
    timeout: z.number().int().positive(),
    maxItemsPerFeed: z.number().int().positive(),
  }),
  newsapi: z.object({
    country: z.string().length(2),
    category: z.string(),
    pageSize: z.number().int().positive().max(100),
  }),
})

// Log entry interface for collector operations
export interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  collector: string
  message: string
  metadata?: Record<string, any>
}

// Collection result interface
export interface CollectionResult {
  source: CollectorSource
  itemsCollected: number
  itemsStored: number
  duplicatesSkipped: number
  errors: string[]
  duration: number
  timestamp: string
}

// Batch processing result
export interface BatchCollectionResult {
  results: CollectionResult[]
  totalItemsCollected: number
  totalItemsStored: number
  totalDuplicatesSkipped: number
  totalErrors: number
  totalDuration: number
  timestamp: string
}
