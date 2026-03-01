import type { Technology, FetcherResult, DataPoint, YouTubeTopVideo } from '@/types'

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3'
const DELAY_MS = 200
const MAX_RESULTS = 10

/**
 * Disambiguation map for tech names that produce noisy YouTube search results.
 * "Go" returns travel content, "Rust" returns the game, "Bun" returns food, etc.
 */
const SEARCH_TERM_OVERRIDES: Record<string, string> = {
  'go': 'Go programming language golang',
  'rust': 'Rust programming language systems',
  'bun': 'Bun JavaScript runtime',
  'swift': 'Swift Apple iOS programming',
  'kotlin': 'Kotlin Android JVM programming',
  'ruby': 'Ruby programming language web',
  'java': 'Java programming language',
  'r': 'R data science statistics programming',
  'c': 'C programming language systems',
  'scala': 'Scala functional programming JVM',
  'elixir': 'Elixir programming language Erlang',
  'elm': 'Elm functional frontend programming',
  'clojure': 'Clojure Lisp programming language',
}

/**
 * Top-20 slugs receive a second "comparison" search within the daily quota budget.
 *
 * Quota math:
 *   48 techs × 1 tutorial search.list (100u)  = 4,800u
 *   48 techs × 1 videos.list (1u)             =    48u
 *   20 techs × 1 comparison search.list (100u) = 2,000u
 *   20 techs × 1 videos.list (1u)             =    20u
 *   Total                                      = 6,868u / 10,000u daily ✅
 */
const DUAL_SEARCH_SLUGS = new Set([
  'react', 'typescript', 'nextjs', 'python', 'nodejs', 'tailwind-css',
  'docker', 'kubernetes', 'rust', 'go', 'vue', 'angular', 'svelte',
  'fastapi', 'prisma', 'supabase', 'vercel', 'postgresql', 'redis', 'graphql',
])

// ---- YouTube API response shapes ----

interface YTSearchItem {
  id: { videoId: string }
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
  }
}

interface YTVideoItem {
  id: string
  snippet: {
    title: string
    channelTitle: string
    publishedAt: string
    thumbnails?: {
      medium?: { url: string }
      default?: { url: string }
    }
  }
  statistics: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
  }
}

interface YTSearchResponse {
  items?: YTSearchItem[]
  error?: { code: number; errors?: Array<{ reason: string }> }
}

interface YTVideosResponse {
  items?: YTVideoItem[]
  error?: { code: number }
}

// ---- Main fetcher ----

/**
 * Fetch YouTube metrics for all active technologies.
 *
 * Data points produced per technology:
 *   yt_video_count     — number of recent tutorial videos (last 30 days)
 *   yt_total_views     — aggregate views across top tutorial videos
 *   yt_avg_likes       — average likes per video
 *   yt_upload_velocity — last7d video count minus prev7d count (positive = accelerating)
 *   yt_top_videos      — value=count; metadata.videos=top tutorials, metadata.comparisonVideos=top comparisons
 */
export async function fetchYouTubeData(
  technologies: Technology[]
): Promise<FetcherResult> {
  const dataPoints: Omit<DataPoint, 'id' | 'created_at'>[] = []
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0]

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    errors.push('YOUTUBE_API_KEY not configured — skipping YouTube fetch')
    return { source: 'youtube', dataPoints, errors }
  }

  for (let i = 0; i < technologies.length; i++) {
    const tech = technologies[i]
    const searchTerm = SEARCH_TERM_OVERRIDES[tech.slug] ?? `${tech.name} programming`

    try {
      // 1. Tutorial search
      const tutorialItems = await searchVideos(
        searchTerm,
        'tutorial OR crash course OR getting started',
        apiKey
      )

      if (tutorialItems === null) {
        // Quota exhausted — abort remaining techs gracefully
        errors.push(`Quota exhausted at ${tech.slug} — remaining ${technologies.length - i} techs skipped`)
        break
      }

      if (tutorialItems.length === 0) {
        // No results for this tech — skip without error
        continue
      }

      // 2. Detailed stats for found tutorial videos
      const tutorialIds = tutorialItems.map(v => v.id.videoId).filter(Boolean)
      const tutorialStats = tutorialIds.length > 0
        ? await getVideoStats(tutorialIds, apiKey)
        : []

      // 3. Aggregate metrics
      const totalViews = tutorialStats.reduce(
        (sum, v) => sum + parseInt(v.statistics.viewCount ?? '0', 10), 0
      )
      const totalLikes = tutorialStats.reduce(
        (sum, v) => sum + parseInt(v.statistics.likeCount ?? '0', 10), 0
      )
      const avgLikes = tutorialStats.length > 0
        ? Math.round(totalLikes / tutorialStats.length)
        : 0

      // 4. Upload velocity: videos last 7 days vs prior 7 days
      const now = Date.now()
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
      const last7d = tutorialItems.filter(v => {
        const age = now - new Date(v.snippet.publishedAt).getTime()
        return age <= sevenDaysMs
      }).length
      const prev7d = tutorialItems.filter(v => {
        const age = now - new Date(v.snippet.publishedAt).getTime()
        return age > sevenDaysMs && age <= sevenDaysMs * 2
      }).length
      const uploadVelocity = last7d - prev7d

      // 5. Build top tutorial videos (non-mutating sort)
      const topTutorials: YouTubeTopVideo[] = [...tutorialStats]
        .sort((a, b) =>
          parseInt(b.statistics.viewCount ?? '0', 10) -
          parseInt(a.statistics.viewCount ?? '0', 10)
        )
        .slice(0, 3)
        .map(v => ({
          videoId: v.id,
          title: v.snippet.title,
          channel: v.snippet.channelTitle,
          views: parseInt(v.statistics.viewCount ?? '0', 10),
          likes: parseInt(v.statistics.likeCount ?? '0', 10),
          publishedAt: v.snippet.publishedAt,
          thumbnail: v.snippet.thumbnails?.medium?.url
            ?? v.snippet.thumbnails?.default?.url
            ?? null,
          intent: 'tutorial' as const,
        }))

      // 6. Comparison search for top-20 techs
      let topComparisonVideos: YouTubeTopVideo[] = []
      if (DUAL_SEARCH_SLUGS.has(tech.slug)) {
        const compItems = await searchVideos(
          searchTerm,
          'vs OR comparison OR alternatives OR should you learn',
          apiKey
        )
        if (compItems !== null && compItems.length > 0) {
          const compIds = compItems.map(v => v.id.videoId).filter(Boolean)
          const compStats = compIds.length > 0 ? await getVideoStats(compIds, apiKey) : []
          topComparisonVideos = [...compStats]
            .sort((a, b) =>
              parseInt(b.statistics.viewCount ?? '0', 10) -
              parseInt(a.statistics.viewCount ?? '0', 10)
            )
            .slice(0, 2)
            .map(v => ({
              videoId: v.id,
              title: v.snippet.title,
              channel: v.snippet.channelTitle,
              views: parseInt(v.statistics.viewCount ?? '0', 10),
              likes: parseInt(v.statistics.likeCount ?? '0', 10),
              publishedAt: v.snippet.publishedAt,
              thumbnail: v.snippet.thumbnails?.medium?.url
                ?? v.snippet.thumbnails?.default?.url
                ?? null,
              intent: 'comparison' as const,
            }))
        }
      }

      // 7. Push all data points
      dataPoints.push({
        technology_id: tech.id,
        source: 'youtube',
        metric: 'yt_video_count',
        value: tutorialItems.length,
        metadata: { query: `${searchTerm} tutorial`, period: '30d' },
        measured_at: today,
      })

      dataPoints.push({
        technology_id: tech.id,
        source: 'youtube',
        metric: 'yt_total_views',
        value: totalViews,
        metadata: {},
        measured_at: today,
      })

      dataPoints.push({
        technology_id: tech.id,
        source: 'youtube',
        metric: 'yt_avg_likes',
        value: avgLikes,
        metadata: {},
        measured_at: today,
      })

      dataPoints.push({
        technology_id: tech.id,
        source: 'youtube',
        metric: 'yt_upload_velocity',
        value: uploadVelocity,
        metadata: { last7d, prev7d },
        measured_at: today,
      })

      // Note: value = total count of stored videos.
      // Actual video objects live in metadata.videos (tutorials) and metadata.comparisonVideos.
      dataPoints.push({
        technology_id: tech.id,
        source: 'youtube',
        metric: 'yt_top_videos',
        value: topTutorials.length + topComparisonVideos.length,
        metadata: {
          videos: topTutorials,
          comparisonVideos: topComparisonVideos,
        },
        measured_at: today,
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`${tech.slug}: ${errorMsg}`)
    }

    if (i < technologies.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  return { source: 'youtube', dataPoints, errors }
}

// ---- Private helpers ----

/**
 * Search YouTube for videos. Returns null on quota exhaustion (caller should abort).
 * Uses videoCategoryId 28 (Science & Technology) to filter noise for ambiguous terms.
 */
async function searchVideos(
  searchTerm: string,
  querySuffix: string,
  apiKey: string
): Promise<YTSearchItem[] | null> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${searchTerm} ${querySuffix}`,
    type: 'video',
    order: 'viewCount',
    maxResults: String(MAX_RESULTS),
    publishedAfter: thirtyDaysAgo.toISOString(),
    relevanceLanguage: 'en',
    videoDuration: 'medium',   // 4–20 min — filters out Shorts and multi-hour lectures
    videoCategoryId: '28',     // Science & Technology — critical noise reduction
    key: apiKey,
  })

  const res = await fetch(`${YT_API_BASE}/search?${params}`)
  const data: YTSearchResponse = await res.json()

  if (!res.ok) {
    const isQuotaExhausted = data.error?.errors?.some(e => e.reason === 'quotaExceeded')
    if (isQuotaExhausted) return null
    throw new Error(`YouTube search.list failed (${res.status}): ${data.error?.code}`)
  }

  return data.items ?? []
}

/** Get snippet + statistics for a list of video IDs in a single API call */
async function getVideoStats(videoIds: string[], apiKey: string): Promise<YTVideoItem[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics',
    id: videoIds.join(','),
    key: apiKey,
  })

  const res = await fetch(`${YT_API_BASE}/videos?${params}`)
  const data: YTVideosResponse = await res.json()

  if (!res.ok) {
    throw new Error(`YouTube videos.list failed (${res.status})`)
  }

  return data.items ?? []
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
