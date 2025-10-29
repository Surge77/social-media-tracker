// NewsAPI collector implementation
// Fetches top headlines from NewsAPI and normalizes them to ItemDTO format

import type { Collector, ItemDTO, NewsAPIArticle, NewsAPIResponse } from '@/types/collector.types'
import { httpRequest } from './utils/http'
import { logInfo, logWarn, logError, logCollectionStart, logCollectionComplete } from './utils/logger'
import { safeValidateItemDTO } from './utils/validation'
import { getNewsAPIKey } from './utils/config'

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2'
const DEFAULT_COUNTRY = 'us'
const DEFAULT_CATEGORY = 'technology'
const DEFAULT_PAGE_SIZE = 50

/**
 * NewsAPI collector configuration
 */
export interface NewsAPICollectorConfig {
  apiKey?: string
  country?: string
  category?: string
  pageSize?: number
}

/**
 * NewsAPI client with authentication and rate limiting awareness
 */
export class NewsAPIClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private requestCount: number = 0
  private readonly maxRequestsPerDay: number = 1000 // Free tier limit

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getNewsAPIKey()
    this.baseUrl = NEWSAPI_BASE_URL
  }

  /**
   * Fetches top headlines from NewsAPI
   * @param country - Country code (e.g., 'us', 'gb')
   * @param category - Category (e.g., 'technology', 'business')
   * @param pageSize - Number of articles to fetch (max 100)
   * @returns NewsAPI response with articles
   */
  async fetchTopHeadlines(
    country: string = DEFAULT_COUNTRY,
    category: string = DEFAULT_CATEGORY,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<NewsAPIResponse> {
    // Check rate limit awareness
    if (this.requestCount >= this.maxRequestsPerDay) {
      logWarn('newsapi', 'Approaching daily rate limit', {
        requestCount: this.requestCount,
        maxRequests: this.maxRequestsPerDay,
      })
    }

    try {
      const params = new URLSearchParams({
        country,
        category,
        pageSize: Math.min(pageSize, 100).toString(),
        apiKey: this.apiKey,
      })

      const url = `${this.baseUrl}/top-headlines?${params.toString()}`
      
      logInfo('newsapi', `Fetching top headlines`, {
        country,
        category,
        pageSize,
      })

      const response = await httpRequest<NewsAPIResponse>(url, {
        timeout: 15000,
        retries: 2,
      })

      this.requestCount++

      if (response.status !== 'ok') {
        throw new Error(`NewsAPI returned status: ${response.status}`)
      }

      logInfo('newsapi', `Successfully fetched ${response.articles.length} articles`, {
        totalResults: response.totalResults,
      })

      return response
    } catch (error) {
      logError('newsapi', 'Failed to fetch top headlines', {
        error: error instanceof Error ? error.message : String(error),
        country,
        category,
      })
      throw error
    }
  }

  /**
   * Gets the current request count (for monitoring)
   */
  getRequestCount(): number {
    return this.requestCount
  }

  /**
   * Resets the request count (typically called daily)
   */
  resetRequestCount(): void {
    this.requestCount = 0
  }
}

/**
 * Cleans and extracts excerpt from NewsAPI article description
 * @param article - The NewsAPI article
 * @param maxLength - Maximum length of excerpt
 * @returns Cleaned excerpt or undefined
 */
function extractExcerpt(article: NewsAPIArticle, maxLength: number = 997): string | undefined {
  // Try description first
  if (article.description) {
    const cleaned = article.description.trim()
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
  }

  // Try content field as fallback
  if (article.content) {
    // Remove the "[+XXXX chars]" suffix that NewsAPI adds
    const cleaned = article.content.replace(/\[\+\d+ chars\]$/, '').trim()
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
  }

  return undefined
}

/**
 * Extracts author from NewsAPI article
 * Handles missing or null author fields
 */
function extractAuthor(article: NewsAPIArticle): string | undefined {
  if (article.author && article.author.trim()) {
    return article.author.trim()
  }

  // Fallback to source name if author is missing
  if (article.source?.name) {
    return article.source.name
  }

  return undefined
}

/**
 * Normalizes publication date from NewsAPI article
 * @param publishedAt - ISO date string from NewsAPI
 * @returns Normalized ISO date string or null
 */
function normalizePublicationDate(publishedAt: string): string | null {
  try {
    const date = new Date(publishedAt)
    if (isNaN(date.getTime())) {
      return null
    }
    return date.toISOString()
  } catch (error) {
    logWarn('newsapi', 'Failed to normalize publication date', {
      publishedAt,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Normalizes a NewsAPI article to ItemDTO format
 * @param article - The NewsAPI article to normalize
 * @returns Normalized ItemDTO or null if article is invalid
 */
export function normalizeNewsAPIArticle(article: NewsAPIArticle): ItemDTO | null {
  try {
    // Validate required fields
    if (!article.title || !article.url) {
      logWarn('newsapi', 'Skipping article without title or URL')
      return null
    }

    // Normalize publication date
    const published_at = normalizePublicationDate(article.publishedAt)
    if (!published_at) {
      logWarn('newsapi', 'Skipping article without valid publication date', {
        title: article.title,
      })
      return null
    }

    // Create ItemDTO
    const itemDTO: ItemDTO = {
      source: 'newsapi',
      title: article.title.trim(),
      url: article.url,
      published_at,
      author: extractAuthor(article),
      excerpt: extractExcerpt(article),
    }

    // Validate the item
    const validatedItem = safeValidateItemDTO(itemDTO)
    
    if (!validatedItem) {
      logWarn('newsapi', 'Item validation failed for article', {
        title: article.title,
        url: article.url,
        itemDTO,
      })
      return null
    }

    return validatedItem
  } catch (error) {
    logWarn('newsapi', 'Failed to normalize article', {
      error: error instanceof Error ? error.message : String(error),
      title: article.title,
    })
    return null
  }
}

/**
 * NewsAPI collector implementation
 * Collects top headlines from NewsAPI and returns normalized ItemDTOs
 */
export class NewsAPICollector implements Collector {
  private readonly apiClient: NewsAPIClient
  private readonly country: string
  private readonly category: string
  private readonly pageSize: number

  constructor(config: NewsAPICollectorConfig = {}) {
    this.apiClient = new NewsAPIClient(config.apiKey)
    this.country = config.country || DEFAULT_COUNTRY
    this.category = config.category || DEFAULT_CATEGORY
    this.pageSize = config.pageSize || DEFAULT_PAGE_SIZE
  }

  /**
   * Collects top headlines from NewsAPI and returns normalized ItemDTOs
   */
  async collect(): Promise<ItemDTO[]> {
    const startTime = Date.now()
    logCollectionStart('newsapi')

    try {
      // Fetch top headlines
      const response = await this.apiClient.fetchTopHeadlines(
        this.country,
        this.category,
        this.pageSize
      )

      if (!response.articles || response.articles.length === 0) {
        logWarn('newsapi', 'No articles returned from API')
        return []
      }

      // Normalize articles to ItemDTO format
      const items = response.articles
        .map(article => normalizeNewsAPIArticle(article))
        .filter((item): item is ItemDTO => item !== null)

      const duration = Date.now() - startTime
      logCollectionComplete('newsapi', items.length, duration)

      return items
    } catch (error) {
      const duration = Date.now() - startTime
      logError('newsapi', 'Collection failed', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      })
      throw error
    }
  }
}
