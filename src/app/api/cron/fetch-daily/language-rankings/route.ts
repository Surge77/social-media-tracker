import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchLanguageStats, computePopularityIndex, TRACKED_LANGUAGES, LanguageStats } from '@/lib/api/language-stats'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Fetch all language stats
    const allStats: LanguageStats[] = []
    for (const lang of TRACKED_LANGUAGES) {
      const stats = await fetchLanguageStats(lang)
      allStats.push(stats)
    }

    // Compute popularity index for each
    const withIndex = allStats.map((s) => ({
      ...s,
      popularity_index: computePopularityIndex(allStats, s),
    }))

    // Sort by popularity index to assign ranks
    withIndex.sort((a, b) => b.popularity_index - a.popularity_index)

    // Get yesterday's ranks for comparison
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

    await supabase.from('language_rankings').upsert(rows, { onConflict: 'language,snapshot_date' })

    return Response.json({ success: true, count: rows.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
