import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchLanguageStats, computePopularityIndex, TRACKED_LANGUAGES, LanguageStats } from '@/lib/api/language-stats'

export const maxDuration = 60

/**
 * Daily language rankings cron.
 * Fetches stats for all 46 tracked languages and upserts into language_rankings.
 *
 * Languages are processed in parallel batches of 8 to stay within the
 * GitHub search API rate limit (30 req/min) while finishing well under 60s.
 */
export async function GET(request: Request) {
  // Auth: accept Vercel cron header or internal orchestrator secret
  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    const isInternal = request.headers.get('x-internal-cron') === process.env.CRON_SECRET
    if (!isVercelCron && !isInternal) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createSupabaseAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Process in parallel batches of 8 (safe for GitHub search 30 req/min limit)
    // Sequential 46-language loop would take ~55-70s; this completes in ~12s.
    const BATCH_SIZE = 8
    const allStats: LanguageStats[] = []

    for (let i = 0; i < TRACKED_LANGUAGES.length; i += BATCH_SIZE) {
      const batch = TRACKED_LANGUAGES.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(batch.map((lang) => fetchLanguageStats(lang)))
      allStats.push(...batchResults)
    }

    // Compute popularity index for each language relative to all others
    const withIndex = allStats.map((s) => ({
      ...s,
      popularity_index: computePopularityIndex(allStats, s),
    }))

    // Sort by popularity index descending to assign ranks
    withIndex.sort((a, b) => b.popularity_index - a.popularity_index)

    // Get yesterday's ranks for rank-change comparison
    const { data: prevRanks } = await supabase
      .from('language_rankings')
      .select('language, rank')
      .eq('snapshot_date', yesterday)

    const prevRankMap = new Map((prevRanks ?? []).map((r) => [r.language, r.rank]))

    // Upsert today's rankings
    const rows = withIndex.map((s, i) => ({
      language: s.language,
      rank: i + 1,
      prev_rank: prevRankMap.get(s.language) ?? null,
      github_repos_count: s.github_repos_count,
      stackoverflow_questions: s.stackoverflow_questions,
      job_listings: s.job_listings,
      popularity_index: s.popularity_index,
      snapshot_date: today,
    }))

    const { error: upsertError } = await supabase
      .from('language_rankings')
      .upsert(rows, { onConflict: 'language,snapshot_date' })

    if (upsertError) {
      throw new Error(`Failed to upsert language rankings: ${upsertError.message}`)
    }

    return Response.json({ success: true, count: rows.length, date: today })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Language Rankings] Error:', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
