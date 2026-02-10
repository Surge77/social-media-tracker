import Parser from 'rss-parser'
import type { Technology, FetcherResult, DataPoint } from '@/types'
import { averageSentiment } from '@/lib/scoring/sentiment'
import { RSS_FEEDS } from '@/lib/constants/data-sources'

const parser = new Parser()

/**
 * Fetch RSS feed data for all technologies.
 * Searches feed items for technology mentions and analyzes sentiment.
 * Returns data_points for: mentions (count), sentiment (avg from titles)
 */
export async function fetchRSSData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Fetch all RSS feeds
  const feedData = await fetchAllFeeds(errors)

  // For each technology, search across all feed items for mentions
  for (const tech of technologies) {
    try {
      const mentions = findTechnologyMentions(tech, feedData)

      if (mentions.length > 0) {
        // mentions: count
        dataPoints.push({
          technology_id: tech.id,
          source: 'rss',
          metric: 'mentions',
          value: mentions.length,
          metadata: {},
          measured_at: today,
        })

        // sentiment: average sentiment from titles
        const avgSentiment = averageSentiment(mentions)
        dataPoints.push({
          technology_id: tech.id,
          source: 'rss',
          metric: 'sentiment',
          value: avgSentiment,
          metadata: {},
          measured_at: today,
        })
      } else {
        // No mentions found - create zero-value entries
        dataPoints.push(
          {
            technology_id: tech.id,
            source: 'rss',
            metric: 'mentions',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'rss',
            metric: 'sentiment',
            value: 0.5, // neutral
            metadata: {},
            measured_at: today,
          }
        )
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`${tech.slug}: ${errorMsg}`)
      // Continue to next technology
    }
  }

  return { source: 'rss', dataPoints, errors }
}

/**
 * Fetch a single RSS feed with a timeout
 */
async function fetchSingleFeed(
  key: string,
  url: string,
  timeoutMs: number = 5000
): Promise<Array<{ title: string; content: string; link: string }>> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`RSS feed ${key} timed out after ${timeoutMs}ms`)), timeoutMs)
  )

  const feedPromise = (async () => {
    const feed = await parser.parseURL(url)
    const items: Array<{ title: string; content: string; link: string }> = []

    for (const item of feed.items) {
      if (item.title) {
        items.push({
          title: item.title,
          content: item.contentSnippet || item.content || '',
          link: item.link || '',
        })
      }
    }

    return items
  })()

  return Promise.race([feedPromise, timeoutPromise])
}

/**
 * Fetch all RSS feeds in parallel with concurrency limit
 */
async function fetchAllFeeds(
  errors: string[]
): Promise<Array<{ title: string; content: string; link: string }>> {
  const allItems: Array<{ title: string; content: string; link: string }> = []
  const feedEntries = Object.entries(RSS_FEEDS)

  const CONCURRENCY = 5
  // Process feeds in chunks of CONCURRENCY
  for (let i = 0; i < feedEntries.length; i += CONCURRENCY) {
    const chunk = feedEntries.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      chunk.map(([key, feedConfig]) => fetchSingleFeed(key, feedConfig.url))
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const [key] = chunk[j]

      if (result.status === 'fulfilled') {
        allItems.push(...result.value)
      } else {
        const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason)
        errors.push(`RSS feed ${key}: ${errorMsg}`)
      }
    }
  }

  return allItems
}

/**
 * Find mentions of a technology across all feed items
 * Returns array of titles that mention the technology
 */
function findTechnologyMentions(
  tech: Technology,
  feedItems: Array<{ title: string; content: string; link: string }>
): string[] {
  const mentions: string[] = []

  // Build search patterns (case-insensitive)
  const searchTerms = [tech.name.toLowerCase(), ...tech.aliases.map((a) => a.toLowerCase())]

  for (const item of feedItems) {
    const titleLower = item.title.toLowerCase()
    const contentLower = item.content.toLowerCase()

    // Check if any search term appears in title or content
    const mentioned = searchTerms.some(
      (term) => titleLower.includes(term) || contentLower.includes(term)
    )

    if (mentioned) {
      mentions.push(item.title)
    }
  }

  return mentions
}
