// RSS collector implementation
// Fetches and normalizes content from RSS/Atom feeds

import Parser from 'rss-parser'
import type { Collector, ItemDTO, RSSItem, RSSConfig } from '@/types/collector.types'
import { logInfo, logWarn, logError, logCollectionStart, logCollectionComplete } from './utils/logger'
import { safeValidateItemDTO } from './utils/validation'
import { loadRSSConfig } from './utils/config'

const DEFAULT_TIMEOUT = 15000
const DEFAULT_MAX_ITEMS_PER_FEED = 20
const DEFAULT_MAX_AGE_HOURS = 24

/**
 * RSS collector configuration
 */
export interface RSSCollectorConfig {
  timeout?: number
  maxItemsPerFeed?: number
  maxAgeHours?: number
  configPath?: string
}

/**
 * RSS feed parser client with error handling
 */
export class RSSFeedParser {
  private readonly parser: Parser

  constructor(timeout: number = DEFAULT_TIMEOUT) {
    this.parser = new Parser({
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendWatch/1.0)',
      },
    })
  }

  /**
   * Parses an RSS feed from a URL
   * @param url - The RSS feed URL
   * @returns Parsed feed with items
   */
  async parseFeed(url: string): Promise<Parser.Output<RSSItem>> {
    try {
      logInfo('rss', `Parsing feed: ${url}`)
      const feed = await this.parser.parseURL(url)
      logInfo('rss', `Successfully parsed feed: ${feed.title || url}`, {
        itemCount: feed.items?.length || 0,
      })
      return feed
    } catch (error) {
      logError('rss', `Failed to parse feed: ${url}`, {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Parses multiple RSS feeds with error handling
   * @param urls - Array of RSS feed URLs
   * @returns Array of successfully parsed feeds
   */
  async parseFeeds(urls: string[]): Promise<Array<{ url: string; feed: Parser.Output<RSSItem> }>> {
    const results: Array<{ url: string; feed: Parser.Output<RSSItem> }> = []

    for (const url of urls) {
      try {
        const feed = await this.parseFeed(url)
        results.push({ url, feed })
      } catch (error) {
        logWarn('rss', `Skipping feed due to error: ${url}`, {
          error: error instanceof Error ? error.message : String(error),
        })
        // Continue with other feeds
      }
    }

    return results
  }
}

/**
 * Normalizes publication date from RSS item
 * Handles various date formats from RSS/Atom feeds
 */
function normalizePublicationDate(item: RSSItem): string | null {
  try {
    // Try isoDate first (most reliable)
    if (item.isoDate) {
      return new Date(item.isoDate).toISOString()
    }

    // Try pubDate
    if (item.pubDate) {
      const date = new Date(item.pubDate)
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }

    // No valid date found
    return null
  } catch (error) {
    logWarn('rss', 'Failed to normalize publication date', {
      item: { isoDate: item.isoDate, pubDate: item.pubDate },
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

/**
 * Extracts excerpt from RSS item content
 * Handles various content formats and lengths
 */
function extractExcerpt(item: RSSItem, maxLength: number = 997): string | undefined {
  // Try contentSnippet first (usually clean text)
  if (item.contentSnippet) {
    const excerpt = item.contentSnippet.trim()
    return excerpt.length > maxLength ? excerpt.substring(0, maxLength) + '...' : excerpt
  }

  // Try content field
  if (item.content) {
    // Strip HTML tags if present
    const textContent = item.content.replace(/<[^>]*>/g, '').trim()
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent
  }

  return undefined
}

/**
 * Extracts author from RSS item
 * Handles various author field formats
 */
function extractAuthor(item: RSSItem): string | undefined {
  // Try creator field (Dublin Core)
  if (item.creator) {
    return item.creator
  }

  // Try author field
  if (item.author) {
    return item.author
  }

  return undefined
}

/**
 * Extracts URL from RSS item
 * Tries multiple fields to find a valid URL
 */
function extractUrl(item: RSSItem): string | null {
  // Try link field first
  if (item.link) {
    return item.link
  }

  // Try guid if it looks like a URL
  if (item.guid && (item.guid.startsWith('http://') || item.guid.startsWith('https://'))) {
    return item.guid
  }

  return null
}

/**
 * Normalizes an RSS item to ItemDTO format
 * @param item - The RSS item to normalize
 * @param sourceName - The name of the RSS source
 * @param maxAgeHours - Maximum age of items to include (in hours)
 * @returns Normalized ItemDTO or null if item is invalid
 */
export function normalizeRSSItem(
  item: RSSItem,
  sourceName: string,
  maxAgeHours: number = DEFAULT_MAX_AGE_HOURS
): ItemDTO | null {
  try {
    // Validate required fields
    const url = extractUrl(item)
    if (!item.title || !url) {
      logWarn('rss', `Skipping RSS item without title or link from ${sourceName}`)
      return null
    }

    // Normalize publication date
    const published_at = normalizePublicationDate(item)
    if (!published_at) {
      logWarn('rss', `Skipping RSS item without valid date from ${sourceName}`, {
        title: item.title,
      })
      return null
    }

    // Check if item is within max age
    const itemAge = Date.now() - new Date(published_at).getTime()
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000
    if (itemAge > maxAgeMs) {
      logInfo('rss', `Skipping old RSS item from ${sourceName}`, {
        title: item.title,
        ageHours: Math.round(itemAge / (60 * 60 * 1000)),
      })
      return null
    }

    // Create ItemDTO
    const itemDTO: ItemDTO = {
      source: 'rss',
      title: item.title.trim(),
      url: url,
      published_at,
      author: extractAuthor(item),
      excerpt: extractExcerpt(item),
    }

    // Validate the item
    const validatedItem = safeValidateItemDTO(itemDTO)
    
    if (!validatedItem) {
      logWarn('rss', `Item validation failed for RSS item from ${sourceName}`, {
        title: item.title,
        url: url,
        itemDTO,
      })
      return null
    }

    return validatedItem
  } catch (error) {
    logWarn('rss', `Failed to normalize RSS item from ${sourceName}`, {
      error: error instanceof Error ? error.message : String(error),
      title: item.title,
    })
    return null
  }
}

/**
 * RSS collector implementation
 * Collects and normalizes content from configured RSS/Atom feeds
 */
export class RSSCollector implements Collector {
  private readonly parser: RSSFeedParser
  private readonly config: RSSConfig
  private readonly maxItemsPerFeed: number
  private readonly maxAgeHours: number

  constructor(collectorConfig: RSSCollectorConfig = {}) {
    this.parser = new RSSFeedParser(collectorConfig.timeout || DEFAULT_TIMEOUT)
    this.maxItemsPerFeed = collectorConfig.maxItemsPerFeed || DEFAULT_MAX_ITEMS_PER_FEED
    this.maxAgeHours = collectorConfig.maxAgeHours || DEFAULT_MAX_AGE_HOURS

    try {
      // Load RSS sources configuration
      this.config = loadRSSConfig()
      
      // Validate configuration
      if (!this.config.sources || this.config.sources.length === 0) {
        throw new Error('No RSS sources configured')
      }

      logInfo('rss', `Loaded ${this.config.sources.length} RSS sources`, {
        sources: this.config.sources.map(s => s.name),
      })
    } catch (error) {
      logError('rss', 'Failed to load RSS configuration', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Collects items from a single RSS feed
   * @param source - The RSS source configuration
   * @returns Array of normalized ItemDTOs
   */
  private async collectFromFeed(source: { name: string; url: string; category?: string }): Promise<ItemDTO[]> {
    try {
      logInfo('rss', `Collecting from feed: ${source.name}`)

      // Parse the feed
      const feed = await this.parser.parseFeed(source.url)

      if (!feed.items || feed.items.length === 0) {
        logWarn('rss', `No items found in feed: ${source.name}`)
        return []
      }

      // Limit items per feed
      const itemsToProcess = feed.items.slice(0, this.maxItemsPerFeed)

      // Normalize items
      const normalizedItems = itemsToProcess
        .map(item => normalizeRSSItem(item, source.name, this.maxAgeHours))
        .filter((item): item is ItemDTO => item !== null)

      logInfo('rss', `Collected ${normalizedItems.length} items from ${source.name}`)

      return normalizedItems
    } catch (error) {
      logError('rss', `Failed to collect from feed: ${source.name}`, {
        error: error instanceof Error ? error.message : String(error),
        url: source.url,
      })
      // Return empty array to continue with other feeds
      return []
    }
  }

  /**
   * Collects items from all configured RSS feeds
   * @returns Array of normalized ItemDTOs from all feeds
   */
  async collect(): Promise<ItemDTO[]> {
    const startTime = Date.now()
    logCollectionStart('rss')

    try {
      const allItems: ItemDTO[] = []

      // Collect from each feed sequentially to avoid overwhelming servers
      for (const source of this.config.sources) {
        const items = await this.collectFromFeed(source)
        allItems.push(...items)
      }

      const duration = Date.now() - startTime
      logCollectionComplete('rss', allItems.length, duration)

      return allItems
    } catch (error) {
      const duration = Date.now() - startTime
      logError('rss', 'Collection failed', {
        error: error instanceof Error ? error.message : String(error),
        durationMs: duration,
      })
      throw error
    }
  }
}
