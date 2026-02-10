import type { Technology, FetcherResult, DataPoint } from '@/types'
import { averageSentiment } from '@/lib/scoring/sentiment'

const HN_ALGOLIA_API = 'https://hn.algolia.com/api/v1'

/**
 * Fetch Hacker News mentions for all technologies.
 * Returns data_points for: mentions, upvotes (avg), comments (avg), sentiment (avg)
 */
export async function fetchHackerNewsData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // Unix timestamp

  for (const tech of technologies) {
    try {
      // Use technology name, add context for ambiguous names
      const query = getSearchQuery(tech.name, tech.slug)
      const hnData = await searchHackerNews(query, thirtyDaysAgo)

      if (hnData && hnData.hits.length > 0) {
        const hits = hnData.hits

        // mentions: total number of stories
        dataPoints.push({
          technology_id: tech.id,
          source: 'hackernews',
          metric: 'mentions',
          value: hnData.nbHits,
          metadata: {},
          measured_at: today,
        })

        // upvotes: average points across all hits
        const avgPoints = hits.reduce((sum, hit) => sum + (hit.points || 0), 0) / hits.length
        dataPoints.push({
          technology_id: tech.id,
          source: 'hackernews',
          metric: 'upvotes',
          value: Math.round(avgPoints),
          metadata: {},
          measured_at: today,
        })

        // comments: average num_comments across all hits
        const avgComments =
          hits.reduce((sum, hit) => sum + (hit.num_comments || 0), 0) / hits.length
        dataPoints.push({
          technology_id: tech.id,
          source: 'hackernews',
          metric: 'comments',
          value: Math.round(avgComments),
          metadata: {},
          measured_at: today,
        })

        // sentiment: average sentiment score across all titles
        const titles = hits
          .map((hit) => hit.title)
          .filter((t): t is string => typeof t === 'string' && t.length > 0)
        const avgSentiment = averageSentiment(titles)
        dataPoints.push({
          technology_id: tech.id,
          source: 'hackernews',
          metric: 'sentiment',
          value: avgSentiment,
          metadata: {
            top_stories: hits
              .slice(0, 5)
              .map((hit) => ({
                title: hit.title,
                url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
                points: hit.points,
              })),
          },
          measured_at: today,
        })
      } else {
        // No results - still create entries with 0 values
        dataPoints.push(
          {
            technology_id: tech.id,
            source: 'hackernews',
            metric: 'mentions',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'hackernews',
            metric: 'upvotes',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'hackernews',
            metric: 'comments',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'hackernews',
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

  return { source: 'hackernews', dataPoints, errors }
}

/**
 * Get search query with context for ambiguous technology names
 */
function getSearchQuery(name: string, slug: string): string {
  // Add context for ambiguous single-letter or common-word names
  const ambiguous: Record<string, string> = {
    c: 'C programming',
    go: 'Go programming',
    r: 'R language',
    rust: 'Rust programming',
    swift: 'Swift programming',
    dart: 'Dart programming',
  }

  return ambiguous[slug] || name
}

/**
 * Search Hacker News Algolia API
 */
async function searchHackerNews(
  query: string,
  createdAfter: number
): Promise<HNSearchResponse | null> {
  const url = `${HN_ALGOLIA_API}/search?query=${encodeURIComponent(
    query
  )}&tags=story&numericFilters=created_at_i>${createdAfter}&hitsPerPage=100`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`HN API error ${response.status}`)
  }

  return response.json()
}

/**
 * Hacker News Algolia API response shape
 */
interface HNSearchResponse {
  hits: HNHit[]
  nbHits: number
  page: number
  nbPages: number
}

interface HNHit {
  objectID: string
  title: string
  url: string | null
  points: number
  num_comments: number
  created_at_i: number
}
