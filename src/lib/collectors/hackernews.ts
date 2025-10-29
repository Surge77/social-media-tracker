// Hacker News collector implementation
// Fetches top stories from Hacker News API and normalizes them to ItemDTO format

import type { Collector, ItemDTO, HNStory } from '@/types/collector.types'
import { httpRequest, httpRequestBatch } from './utils/http'
import { logInfo, logWarn, logError, logCollectionStart, logCollectionComplete } from './utils/logger'
import { safeValidateItemDTO } from './utils/validation'

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'
const DEFAULT_MAX_STORIES = 30
const DEFAULT_CONCURRENT_REQUESTS = 5

/**
 * Hacker News collector configuration
 */
export interface HNCollectorConfig {
  maxStories?: number
  concurrentRequests?: number
}

/**
 * Hacker News API client
 */
export class HNAPIClient {
  private readonly baseUrl: string
  private readonly concurrentRequests: number

  constructor(concurrentRequests: number = DEFAULT_CONCURRENT_REQUESTS) {
    this.baseUrl = HN_API_BASE
    this.concurrentRequests = concurrentRequests
  }

  /**
   * Fetches top story IDs from Hacker News
   */
  async fetchTopStoryIds(limit: number = DEFAULT_MAX_STORIES): Promise<number[]> {
    try {
      const url = `${this.baseUrl}/topstories.json`
      logInfo('hn', `Fetching top ${limit} story IDs`)
      
      const storyIds = await httpRequest<number[]>(url, {
        timeout: 10000,
        retries: 3,
      })

      return storyIds.slice(0, limit)
    } catch (error) {
      logError('hn', 'Failed to fetch top story IDs', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Fetches a single story by ID
   */
  async fetchStory(id: number): Promise<HNStory | null> {
    try {
      const url = `${this.baseUrl}/item/${id}.json`
      const story = await httpRequest<HNStory>(url, {
        timeout: 10000,
        retries: 2,
      })

      return story
    } catch (error) {
      logWarn('hn', `Failed to fetch story ${id}`, {
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  /**
   * Fetches multiple stories concurrently with rate limiting
   */
  async fetchStories(ids: number[]): Promise<HNStory[]> {
    logInfo('hn', `Fetching ${ids.length} stories with concurrency limit of ${this.concurrentRequests}`)

    const urls = ids.map(id => `${this.baseUrl}/item/${id}.json`)
    
    try {
      const stories = await httpRequestBatch<HNStory>(
        urls,
        {
          timeout: 10000,
          retries: 2,
        },
        this.concurrentRequests
      )

      // Filter out null responses
      const validStories = stories.filter((story): story is HNStory => story !== null)
      
      logInfo('hn', `Successfully fetched ${validStories.length} out of ${ids.length} stories`)
      
      return validStories
    } catch (error) {
      logError('hn', 'Failed to fetch stories batch', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}

/**
 * Normalizes a Hacker News story to ItemDTO format
 */
export function normalizeHNStory(story: HNStory): ItemDTO | null {
  try {
    // Filter out jobs, polls, and stories without URLs
    if (story.type === 'job' || story.type === 'poll') {
      logInfo('hn', `Skipping ${story.type} item: ${story.id}`)
      return null
    }

    // Skip stories without URLs (Ask HN, Show HN without links)
    if (!story.url) {
      logInfo('hn', `Skipping story without URL: ${story.id}`)
      return null
    }

    // Convert Unix timestamp to ISO string
    const published_at = new Date(story.time * 1000).toISOString()

    // Create ItemDTO
    const item: ItemDTO = {
      source: 'hn',
      title: story.title,
      url: story.url,
      published_at,
      author: story.by,
      score: story.score,
      comment_count: story.descendants,
    }

    // Validate the item
    const validatedItem = safeValidateItemDTO(item)
    
    if (!validatedItem) {
      logWarn('hn', `Item validation failed for story ${story.id}`, { item })
      return null
    }

    return validatedItem
  } catch (error) {
    logWarn('hn', `Failed to normalize story ${story.id}`, {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Hacker News collector implementation
 */
export class HackerNewsCollector implements Collector {
  private readonly apiClient: HNAPIClient
  private readonly maxStories: number

  constructor(config: HNCollectorConfig = {}) {
    this.maxStories = config.maxStories || DEFAULT_MAX_STORIES
    this.apiClient = new HNAPIClient(config.concurrentRequests || DEFAULT_CONCURRENT_REQUESTS)
  }

  /**
   * Collects top stories from Hacker News and returns normalized ItemDTOs
   */
  async collect(): Promise<ItemDTO[]> {
    const startTime = Date.now()
    logCollectionStart('hn')

    try {
      // Fetch top story IDs
      const storyIds = await this.apiClient.fetchTopStoryIds(this.maxStories)
      
      if (storyIds.length === 0) {
        logWarn('hn', 'No story IDs returned from API')
        return []
      }

      // Fetch story details
      const stories = await this.apiClient.fetchStories(storyIds)

      // Normalize stories to ItemDTO format
      const items = stories
        .map(story => normalizeHNStory(story))
        .filter((item): item is ItemDTO => item !== null)

      const duration = Date.now() - startTime
      logCollectionComplete('hn', items.length, duration)

      return items
    } catch (error) {
      const duration = Date.now() - startTime
      logError('hn', 'Collection failed', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      })
      throw error
    }
  }
}