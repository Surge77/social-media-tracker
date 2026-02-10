import type { Technology, FetcherResult, DataPoint } from '@/types'
import { averageSentiment } from '@/lib/scoring/sentiment'

const NEWSAPI_BASE = 'https://newsapi.org/v2'

/**
 * Fetch news articles from NewsAPI for all technologies.
 * Uses broad category queries to conserve the 100 req/day limit.
 * Returns data_points for: articles (count), sentiment (avg from titles)
 */
export async function fetchNewsData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const apiKey = process.env.NEWSAPI_KEY
  if (!apiKey) {
    errors.push('NEWSAPI_KEY not configured')
    return { source: 'newsapi', dataPoints, errors }
  }

  // Broad category queries to conserve API limit
  const queries = [
    'react vue angular svelte frontend framework',
    'python django fastapi machine learning',
    'rust go java backend developer',
    'docker kubernetes devops cloud',
    'AI artificial intelligence LLM GPT',
    'typescript javascript nodejs',
  ]

  // Fetch all articles from broad queries
  const allArticles: Array<{ title: string; description: string }> = []

  for (const query of queries) {
    try {
      const articles = await searchNewsAPI(query, apiKey)
      allArticles.push(...articles)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`Query "${query}": ${errorMsg}`)
      // Continue with other queries
    }
  }

  // For each technology, find articles that mention it
  for (const tech of technologies) {
    const mentioningArticles = findTechnologyMentions(tech, allArticles)

    if (mentioningArticles.length > 0) {
      // articles: count
      dataPoints.push({
        technology_id: tech.id,
        source: 'newsapi',
        metric: 'articles',
        value: mentioningArticles.length,
        metadata: {},
        measured_at: today,
      })

      // sentiment: average sentiment from titles
      const avgSentiment = averageSentiment(mentioningArticles)
      dataPoints.push({
        technology_id: tech.id,
        source: 'newsapi',
        metric: 'sentiment',
        value: avgSentiment,
        metadata: {},
        measured_at: today,
      })
    } else {
      // No articles found - create zero-value entries
      dataPoints.push(
        {
          technology_id: tech.id,
          source: 'newsapi',
          metric: 'articles',
          value: 0,
          metadata: {},
          measured_at: today,
        },
        {
          technology_id: tech.id,
          source: 'newsapi',
          metric: 'sentiment',
          value: 0.5, // neutral
          metadata: {},
          measured_at: today,
        }
      )
    }
  }

  return { source: 'newsapi', dataPoints, errors }
}

/**
 * Search NewsAPI for a query
 */
async function searchNewsAPI(
  query: string,
  apiKey: string
): Promise<Array<{ title: string; description: string }>> {
  const url = `${NEWSAPI_BASE}/everything?q=${encodeURIComponent(
    query
  )}&language=en&sortBy=relevancy&pageSize=20&apiKey=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded')
    }
    if (response.status === 401) {
      throw new Error('Invalid API key')
    }
    throw new Error(`NewsAPI error ${response.status}`)
  }

  const data: NewsAPIResponse = await response.json()

  if (data.status !== 'ok') {
    throw new Error(data.message || 'NewsAPI error')
  }

  return (data.articles || []).map((article) => ({
    title: article.title || '',
    description: article.description || '',
  }))
}

/**
 * Find articles that mention a specific technology
 * Returns array of titles that mention the technology
 */
function findTechnologyMentions(
  tech: Technology,
  articles: Array<{ title: string; description: string }>
): string[] {
  const mentions: string[] = []
  const searchTerms = [tech.name.toLowerCase(), ...tech.aliases.map((a) => a.toLowerCase())]

  for (const article of articles) {
    const titleLower = article.title.toLowerCase()
    const descLower = article.description.toLowerCase()

    // Check if any search term appears in title or description
    const mentioned = searchTerms.some(
      (term) => titleLower.includes(term) || descLower.includes(term)
    )

    if (mentioned) {
      mentions.push(article.title)
    }
  }

  return mentions
}

/**
 * NewsAPI response type
 */
interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: Array<{
    source: {
      id: string | null
      name: string
    }
    author: string | null
    title: string
    description: string
    url: string
    publishedAt: string
    content: string
  }>
  code?: string
  message?: string
}
