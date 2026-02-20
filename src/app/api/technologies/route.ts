import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { generateTechSummary } from '@/lib/insights/ai-summaries'
import type { TechnologyWithScore } from '@/types'

/**
 * GET /api/technologies
 *
 * Returns all active technologies with their latest scores, 30-day sparklines,
 * rank changes (vs 7 days ago), and honest AI summaries.
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // Get the most recent score date
    const { data: latestDate } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const lastUpdated = latestDate?.score_date ?? null

    // Compute date ranges upfront
    const sevenDaysAgo = lastUpdated ? new Date(lastUpdated) : null
    if (sevenDaysAgo) sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const previousDate = sevenDaysAgo?.toISOString().split('T')[0]

    const thirtyDaysAgo = lastUpdated ? new Date(lastUpdated) : null
    if (thirtyDaysAgo) thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo?.toISOString().split('T')[0]

    // Run all queries in parallel (OPT-02)
    const [techResult, scoresResult, previousScoresResult, sparklineResult] = await Promise.all([
      supabase
        .from('technologies')
        .select('id, slug, name, description, category, color')
        .eq('is_active', true),
      lastUpdated
        ? supabase
            .from('daily_scores')
            .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, data_completeness')
            .eq('score_date', lastUpdated)
        : Promise.resolve({ data: null }),
      lastUpdated && previousDate
        ? supabase
            .from('daily_scores')
            .select('technology_id, composite_score')
            .eq('score_date', previousDate)
        : Promise.resolve({ data: null }),
      lastUpdated && thirtyDaysAgoStr
        ? supabase
            .from('daily_scores')
            .select('technology_id, score_date, composite_score')
            .gte('score_date', thirtyDaysAgoStr)
            .order('score_date', { ascending: true })
        : Promise.resolve({ data: null }),
    ])

    const { data: technologies, error: techError } = techResult

    if (techError) {
      throw new Error(`Failed to fetch technologies: ${techError.message}`)
    }

    // Build score maps
    const scoreMap = new Map<string, Record<string, unknown>>()
    if (scoresResult.data) {
      for (const s of scoresResult.data) {
        scoreMap.set(s.technology_id, s)
      }
    }

    const previousScoreMap = new Map<string, Record<string, unknown>>()
    if (previousScoresResult.data) {
      for (const s of previousScoresResult.data) {
        previousScoreMap.set(s.technology_id, s)
      }
    }

    const sparklineMap = new Map<string, number[]>()
    if (sparklineResult.data) {
      for (const row of sparklineResult.data) {
        if (!sparklineMap.has(row.technology_id)) {
          sparklineMap.set(row.technology_id, [])
        }
        sparklineMap.get(row.technology_id)!.push(Number(row.composite_score))
      }
    }

    // Merge technologies with scores and sparklines
    const result: TechnologyWithScore[] = (technologies ?? []).map((tech) => {
      const scores = scoreMap.get(tech.id) as Record<string, unknown> | undefined
      const previousScore = previousScoreMap.get(tech.id) as Record<string, unknown> | undefined

      return {
        ...tech,
        composite_score: scores ? Number(scores.composite_score) : null,
        github_score: scores ? Number(scores.github_score) : null,
        community_score: scores ? Number(scores.community_score) : null,
        jobs_score: scores ? Number(scores.jobs_score) : null,
        ecosystem_score: scores ? Number(scores.ecosystem_score) : null,
        momentum: scores ? Number(scores.momentum) : null,
        data_completeness: scores ? Number(scores.data_completeness) : null,
        sparkline: sparklineMap.get(tech.id) ?? [],
        previous_rank: null, // Will be computed after sorting
        rank_change: null,   // Will be computed after sorting
        ai_summary: '',      // Will be generated after sorting
      } as TechnologyWithScore
    })

    // Sort by composite score descending, nulls last (current ranking)
    result.sort((a, b) => {
      if (a.composite_score === null && b.composite_score === null) return 0
      if (a.composite_score === null) return 1
      if (b.composite_score === null) return -1
      return b.composite_score - a.composite_score
    })

    // Compute previous ranking (by previous scores)
    const previousRanking = [...result]
    previousRanking.sort((a, b) => {
      const prevScoreA = previousScoreMap.get(a.id)
      const prevScoreB = previousScoreMap.get(b.id)
      const scoreA = prevScoreA ? Number(prevScoreA.composite_score) : null
      const scoreB = prevScoreB ? Number(prevScoreB.composite_score) : null

      if (scoreA === null && scoreB === null) return 0
      if (scoreA === null) return 1
      if (scoreB === null) return -1
      return scoreB - scoreA
    })

    // Create previous rank map
    const previousRankMap = new Map<string, number>()
    previousRanking.forEach((tech, index) => {
      previousRankMap.set(tech.id, index + 1)
    })

    // Add current rank, previous rank, rank change, and AI summary to each tech
    result.forEach((tech, index) => {
      const currentRank = index + 1
      const previousRank = previousRankMap.get(tech.id) ?? null

      tech.previous_rank = previousRank
      tech.rank_change = previousRank !== null ? previousRank - currentRank : null
      tech.ai_summary = generateTechSummary(tech)
    })

    // Cache for 1 hour — data only changes after the daily cron (OPT-03)
    return Response.json(
      { technologies: result, last_updated: lastUpdated },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
