import { getTechResources, getTechVideos } from '@/lib/quiz/resources'
import type { YouTubeTopVideo } from '@/types'
import type { VideoIntent } from '@/lib/quiz/video-intent'

export interface ResolvedVideo {
  videoId: string
  title: string
  channel: string
  views?: number
  likes?: number
  thumbnail?: string | null
  durationMinutes?: number
  source: 'api' | 'hardcoded'
  /** Video type tag — helps UI label videos appropriately */
  videoType?: 'intro' | 'crash-course' | 'full-tutorial' | 'project-based' | 'comparison'
}

/**
 * Resolve the best available video for a technology slug, with intent-awareness.
 *
 * Priority:
 *   1. Live YouTube API data (from data_points_latest via LatestSignals.youtube)
 *      — picks tutorial or comparison video based on intent
 *   2. Hardcoded fallback from resources.ts (always tutorials)
 *
 * Returns null if no video is available from either source.
 */
export function getVideoForTech(
  slug: string,
  intent: VideoIntent = 'learn',
  apiVideos?: YouTubeTopVideo[]
): ResolvedVideo | null {
  // Priority 1: Fresh API data — filter by intent
  if (apiVideos && apiVideos.length > 0) {
    const wantComparison = intent === 'compare' || intent === 'migrate'
    const preferredVideos = apiVideos.filter(v =>
      wantComparison ? v.intent === 'comparison' : v.intent === 'tutorial'
    )
    // Fall back to any video if preferred intent has no results
    const candidates = preferredVideos.length > 0 ? preferredVideos : apiVideos
    const best = candidates[0] // already sorted by views in the fetcher

    return {
      videoId: best.videoId,
      title: best.title,
      channel: best.channel,
      views: best.views,
      likes: best.likes,
      thumbnail: best.thumbnail ?? undefined,
      source: 'api',
    }
  }

  // Priority 2: Hardcoded fallback (resources.ts)
  const resources = getTechResources(slug)
  if (resources?.youtube) {
    return {
      videoId: resources.youtube.videoId,
      title: resources.youtube.title,
      channel: resources.youtube.channel,
      durationMinutes: resources.youtube.durationMinutes,
      source: 'hardcoded',
    }
  }

  return null
}

/**
 * Resolve ALL available videos for a technology slug.
 *
 * Returns an array with multiple videos (intro, crash-course, full-tutorial, etc.)
 * sourced from:
 *   1. Live YouTube API data (if available)
 *   2. Curated youtubeVideos array from resources.ts
 *   3. Falls back to wrapping the single youtube field
 *
 * The result is deduplicated by videoId.
 */
export function getVideosForTech(
  slug: string,
  apiVideos?: YouTubeTopVideo[]
): ResolvedVideo[] {
  const seen = new Set<string>()
  const result: ResolvedVideo[] = []

  const addIfNew = (video: ResolvedVideo) => {
    if (!seen.has(video.videoId)) {
      seen.add(video.videoId)
      result.push(video)
    }
  }

  // Source 1: API videos (highest priority — fresh data)
  if (apiVideos && apiVideos.length > 0) {
    for (const v of apiVideos) {
      addIfNew({
        videoId: v.videoId,
        title: v.title,
        channel: v.channel,
        views: v.views,
        likes: v.likes,
        thumbnail: v.thumbnail ?? undefined,
        source: 'api',
        videoType: v.intent === 'comparison' ? 'comparison' : undefined,
      })
    }
  }

  // Source 2: Curated multi-video list (resources.ts)
  const curatedVideos = getTechVideos(slug)
  for (const v of curatedVideos) {
    addIfNew({
      videoId: v.videoId,
      title: v.title,
      channel: v.channel,
      durationMinutes: v.durationMinutes,
      source: 'hardcoded',
      videoType: v.type,
    })
  }

  return result
}
