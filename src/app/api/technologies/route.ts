import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { generateTechSummary } from '@/lib/insights/ai-summaries'
import { getLifecycleDescription } from '@/lib/analysis/lifecycle'
import type { TechnologyWithScore } from '@/types'
import type { LifecycleStage } from '@/lib/analysis/lifecycle'

/**
 * GET /api/technologies
 *
 * Returns all active technologies with their latest scores, 30-day sparklines,
 * rank changes (vs 7 days ago), and honest AI summaries.
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // Get the most recent score date (for display)
    const { data: latestDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const lastUpdated = latestDateRow?.score_date ?? null

    // Use the most recent date WITH complete scores (non-null jobs_score).
    // If the latest run is incomplete (jobs failed), fall back to the previous complete run.
    const { data: completeDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .not('jobs_score', 'is', null)
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const scoringDate = completeDateRow?.score_date ?? lastUpdated

    // Compute date ranges from the scoring date
    const sevenDaysAgo = scoringDate ? new Date(scoringDate) : null
    if (sevenDaysAgo) sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo?.toISOString().split('T')[0]

    // Find nearest date with data at least 7 days back
    const prevDateResult = sevenDaysAgoStr
      ? await supabase
          .from('daily_scores')
          .select('score_date')
          .lte('score_date', sevenDaysAgoStr)
          .order('score_date', { ascending: false })
          .limit(1)
          .single()
      : null
    const previousDate = prevDateResult?.data?.score_date ?? null

    const thirtyDaysAgo = scoringDate ? new Date(scoringDate) : null
    if (thirtyDaysAgo) thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo?.toISOString().split('T')[0]

    // Run all queries in parallel (OPT-02)
    const [techResult, scoresResult, previousScoresResult, sparklineResult] = await Promise.all([
      supabase
        .from('technologies')
        .select('id, slug, name, description, category, color')
        .eq('is_active', true),
      scoringDate
        ? supabase
            .from('daily_scores')
            .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, data_completeness, raw_sub_scores')
            .eq('score_date', scoringDate)
        : Promise.resolve({ data: null }),
      previousDate
        ? supabase
            .from('daily_scores')
            .select('technology_id, composite_score')
            .eq('score_date', previousDate)
        : Promise.resolve({ data: null }),
      scoringDate && thirtyDaysAgoStr
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

      // Extract confidence grade from raw_sub_scores
      const rawSub = scores?.raw_sub_scores as Record<string, unknown> | undefined
      const confidenceGrade = (rawSub?.confidence as Record<string, unknown> | undefined)?.grade as string | undefined

      return {
        ...tech,
        composite_score: scores?.composite_score != null ? Number(scores.composite_score) : null,
        github_score: scores?.github_score != null ? Number(scores.github_score) : null,
        community_score: scores?.community_score != null ? Number(scores.community_score) : null,
        jobs_score: scores?.jobs_score != null ? Number(scores.jobs_score) : null,
        ecosystem_score: scores?.ecosystem_score != null ? Number(scores.ecosystem_score) : null,
        momentum: scores?.momentum != null ? Number(scores.momentum) : null,
        data_completeness: scores?.data_completeness != null ? Number(scores.data_completeness) : null,
        sparkline: sparklineMap.get(tech.id) ?? [],
        previous_rank: null, // Will be computed after sorting
        rank_change: null,   // Will be computed after sorting
        rank: null,          // Will be set after sorting
        ai_summary: '',      // Will be generated after sorting
        confidence_grade: confidenceGrade ?? null,
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

    // Add current rank, previous rank, rank change, AI summary, and lifecycle to each tech
    result.forEach((tech, index) => {
      const currentRank = index + 1
      const previousRank = previousRankMap.get(tech.id) ?? null

      tech.previous_rank = previousRank
      tech.rank_change = previousRank !== null ? previousRank - currentRank : null
      tech.rank = currentRank
      tech.ai_summary = generateTechSummary(tech)

      // Read lifecycle from raw_sub_scores — already computed by the scoring pipeline,
      // no need to recompute analyzeMomentum + computeConfidence + classifyLifecycle here
      const scores = scoreMap.get(tech.id) as Record<string, unknown> | undefined
      const rawSub = scores?.raw_sub_scores as Record<string, unknown> | undefined
      const storedLifecycle = rawSub?.lifecycle as Record<string, unknown> | undefined
      if (storedLifecycle?.stage) {
        const stage = storedLifecycle.stage as LifecycleStage
        tech.lifecycle_stage = stage
        tech.lifecycle_label = getLifecycleDescription(stage)
      }
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
