import type { Technology, FetcherResult, DataPoint } from '@/types'

const SO_API_BASE = 'https://api.stackexchange.com/2.3'
const DELAY_MS = 100 // Polite delay between requests

/**
 * Fetch Stack Overflow metrics for all technologies.
 * Returns data_points for: questions (total), mentions (30-day questions)
 */
export async function fetchStackOverflowData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 // Unix timestamp

  const apiKey = process.env.STACKOVERFLOW_API_KEY
  if (!apiKey) {
    errors.push('STACKOVERFLOW_API_KEY not configured')
    return { source: 'stackoverflow', dataPoints, errors }
  }

  for (let i = 0; i < technologies.length; i++) {
    const tech = technologies[i]

    try {
      const tag = tech.stackoverflow_tag
      const encodedTag = encodeURIComponent(tag)

      // Fetch tag info (total question count)
      const tagInfo = await fetchTagInfo(encodedTag, apiKey)

      // Fetch recent question count (last 30 days)
      const recentCount = await fetchRecentQuestions(encodedTag, thirtyDaysAgo, apiKey)

      if (tagInfo) {
        // questions: total all-time question count
        dataPoints.push({
          technology_id: tech.id,
          source: 'stackoverflow',
          metric: 'questions',
          value: tagInfo.count,
          metadata: {},
          measured_at: today,
        })
      }

      // mentions: questions in last 30 days
      dataPoints.push({
        technology_id: tech.id,
        source: 'stackoverflow',
        metric: 'mentions',
        value: recentCount,
        metadata: {},
        measured_at: today,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`${tech.slug}: ${errorMsg}`)
      // Continue to next technology
    }

    // Polite delay between requests
    if (i < technologies.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return { source: 'stackoverflow', dataPoints, errors }
}

/**
 * Fetch tag info (total question count)
 */
async function fetchTagInfo(
  encodedTag: string,
  apiKey: string
): Promise<SOTagInfo | null> {
  const url = `${SO_API_BASE}/tags/${encodedTag}/info?site=stackoverflow&key=${apiKey}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SO API error ${response.status}`)
  }

  const data: SOTagInfoResponse = await response.json()

  if (data.items && data.items.length > 0) {
    return data.items[0]
  }

  return null
}

/**
 * Fetch recent question count (last 30 days)
 */
async function fetchRecentQuestions(
  encodedTag: string,
  fromDate: number,
  apiKey: string
): Promise<number> {
  const url = `${SO_API_BASE}/search/advanced?tagged=${encodedTag}&site=stackoverflow&sort=creation&order=desc&fromdate=${fromDate}&key=${apiKey}&filter=total`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`SO API error ${response.status}`)
  }

  const data: SOSearchResponse = await response.json()
  return data.total || 0
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Stack Overflow API response shapes
 */
interface SOTagInfoResponse {
  items: SOTagInfo[]
  has_more: boolean
  quota_max: number
  quota_remaining: number
}

interface SOTagInfo {
  count: number
  name: string
  is_moderator_only: boolean
  is_required: boolean
  has_synonyms: boolean
}

interface SOSearchResponse {
  items: unknown[]
  has_more: boolean
  quota_max: number
  quota_remaining: number
  total: number
}
