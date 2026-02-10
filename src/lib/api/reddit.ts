import type { Technology, FetcherResult, DataPoint } from '@/types'
import { averageSentiment } from '@/lib/scoring/sentiment'

const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token'
const REDDIT_API_BASE = 'https://oauth.reddit.com'
const DELAY_MS = 1000 // 1 second delay (rate limit: 60 req/min)

let cachedAccessToken: string | null = null
let tokenExpiresAt: number | null = null

/**
 * Fetch Reddit metrics for all technologies with a subreddit.
 * Returns data_points for: posts (count), upvotes (avg), comments (avg), sentiment (avg)
 *
 * Note: Skips entirely if REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are not configured.
 */
export async function fetchRedditData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Check if Reddit credentials are configured
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const userAgent = process.env.REDDIT_USER_AGENT || 'DevTrends/1.0'

  if (!clientId || !clientSecret) {
    errors.push('REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not configured - skipping Reddit')
    return { source: 'reddit', dataPoints, errors }
  }

  // Get access token
  let accessToken: string
  try {
    accessToken = await getAccessToken(clientId, clientSecret, userAgent)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    errors.push(`OAuth authentication failed: ${errorMsg}`)
    return { source: 'reddit', dataPoints, errors }
  }

  // Filter technologies that have a subreddit
  const techsWithSubreddit = technologies.filter((t) => t.subreddit)

  for (let i = 0; i < techsWithSubreddit.length; i++) {
    const tech = techsWithSubreddit[i]

    try {
      const posts = await fetchSubredditPosts(
        tech.subreddit!,
        accessToken,
        userAgent
      )

      if (posts && posts.length > 0) {
        // posts: count
        dataPoints.push({
          technology_id: tech.id,
          source: 'reddit',
          metric: 'posts',
          value: posts.length,
          metadata: {},
          measured_at: today,
        })

        // upvotes: average score
        const avgUpvotes = posts.reduce((sum, post) => sum + post.score, 0) / posts.length
        dataPoints.push({
          technology_id: tech.id,
          source: 'reddit',
          metric: 'upvotes',
          value: Math.round(avgUpvotes),
          metadata: {},
          measured_at: today,
        })

        // comments: average num_comments
        const avgComments =
          posts.reduce((sum, post) => sum + post.num_comments, 0) / posts.length
        dataPoints.push({
          technology_id: tech.id,
          source: 'reddit',
          metric: 'comments',
          value: Math.round(avgComments),
          metadata: {},
          measured_at: today,
        })

        // sentiment: average sentiment from titles
        const titles = posts
          .map((post) => post.title)
          .filter((t): t is string => typeof t === 'string' && t.length > 0)
        const avgSentiment = averageSentiment(titles)
        dataPoints.push({
          technology_id: tech.id,
          source: 'reddit',
          metric: 'sentiment',
          value: avgSentiment,
          metadata: {},
          measured_at: today,
        })
      } else {
        // No posts found - create zero-value entries
        dataPoints.push(
          {
            technology_id: tech.id,
            source: 'reddit',
            metric: 'posts',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'reddit',
            metric: 'upvotes',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'reddit',
            metric: 'comments',
            value: 0,
            metadata: {},
            measured_at: today,
          },
          {
            technology_id: tech.id,
            source: 'reddit',
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

    // Rate limiting: 1 second delay between requests
    if (i < techsWithSubreddit.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return { source: 'reddit', dataPoints, errors }
}

/**
 * Get Reddit OAuth access token (cached for session)
 */
async function getAccessToken(
  clientId: string,
  clientSecret: string,
  userAgent: string
): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedAccessToken
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(REDDIT_AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': userAgent,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Reddit OAuth error ${response.status}`)
  }

  const data: RedditAuthResponse = await response.json()

  // Cache the token (expires_in is in seconds, default 1 hour)
  cachedAccessToken = data.access_token
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000 // Refresh 1 min before expiry

  return data.access_token
}

/**
 * Fetch top posts from a subreddit (last month)
 */
async function fetchSubredditPosts(
  subreddit: string,
  accessToken: string,
  userAgent: string
): Promise<RedditPost[] | null> {
  const url = `${REDDIT_API_BASE}/r/${subreddit}/top?t=month&limit=100`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': userAgent,
    },
  })

  if (!response.ok) {
    if (response.status === 404 || response.status === 403) {
      // Subreddit not found or private
      return null
    }
    throw new Error(`Reddit API error ${response.status}`)
  }

  const data: RedditListingResponse = await response.json()
  return data.data.children.map((child) => child.data)
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Reddit API response types
 */
interface RedditAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface RedditListingResponse {
  kind: string
  data: {
    children: Array<{
      kind: string
      data: RedditPost
    }>
    after: string | null
    before: string | null
  }
}

interface RedditPost {
  id: string
  title: string
  author: string
  score: number
  num_comments: number
  created_utc: number
  permalink: string
  url: string
  selftext: string
  subreddit: string
}
