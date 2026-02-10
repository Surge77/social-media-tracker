import type { Technology, FetcherResult, DataPoint } from '@/types'

const DEVTO_API_BASE = 'https://dev.to/api'
const DELAY_MS = 400 // 400ms delay between requests (rate limit: 30 req/30s, ~2.5 req/s stays well under)

/**
 * Fetch Dev.to article metrics for all technologies with a devto_tag.
 * Returns data_points for: articles (count), upvotes (total reactions), comments (total)
 */
export async function fetchDevToData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Filter technologies that have a Dev.to tag
  const techsWithTag = technologies.filter((t) => t.devto_tag)

  for (let i = 0; i < techsWithTag.length; i++) {
    const tech = techsWithTag[i]

    try {
      const articles = await fetchDevToArticles(tech.devto_tag!)

      if (articles && articles.length > 0) {
        // articles: count
        dataPoints.push({
          technology_id: tech.id,
          source: 'devto',
          metric: 'articles',
          value: articles.length,
          metadata: {},
          measured_at: today,
        })

        // upvotes: sum of positive_reactions_count
        const totalReactions = articles.reduce(
          (sum, article) => sum + (article.positive_reactions_count || 0),
          0
        )
        dataPoints.push({
          technology_id: tech.id,
          source: 'devto',
          metric: 'upvotes',
          value: totalReactions,
          metadata: {},
          measured_at: today,
        })

        // comments: sum of comments_count
        const totalComments = articles.reduce(
          (sum, article) => sum + (article.comments_count || 0),
          0
        )
        dataPoints.push({
          technology_id: tech.id,
          source: 'devto',
          metric: 'comments',
          value: totalComments,
          metadata: {},
          measured_at: today,
        })
      } else {
        // No articles found - create zero-value entries
        dataPoints.push(
          {
            technology_id: tech.id,
            source: 'devto',
            metric: 'articles',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'devto',
            metric: 'upvotes',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'devto',
            metric: 'comments',
            value: 0,
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

    // Rate limiting: 1 second delay between requests
    if (i < techsWithTag.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return { source: 'devto', dataPoints, errors }
}

/**
 * Fetch Dev.to articles by tag
 * API: GET /api/articles?tag={tag}&top=30&per_page=100
 * top=30 means "top articles from last 30 days"
 */
async function fetchDevToArticles(tag: string): Promise<DevToArticle[] | null> {
  const url = `${DEVTO_API_BASE}/articles?tag=${encodeURIComponent(
    tag
  )}&top=30&per_page=100`

  const response = await fetch(url, {
    headers: {
      // API key is optional for read-only requests, but include if available
      ...(process.env.DEVTO_API_KEY && { 'api-key': process.env.DEVTO_API_KEY }),
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      // Tag not found
      return null
    }
    throw new Error(`Dev.to API error ${response.status}`)
  }

  return response.json()
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Dev.to API response shape
 */
interface DevToArticle {
  id: number
  title: string
  description: string
  url: string
  published_at: string
  positive_reactions_count: number
  comments_count: number
  tag_list: string[]
  user: {
    name: string
    username: string
  }
}
