import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getPrimaryDriver } from '@/lib/insights/ai-summaries'
import { NextRequest } from 'next/server'

/**
 * GET /api/technologies/movers?period=7d
 *
 * Returns top 5 risers and top 5 fallers based on score deltas.
 * Period can be '7d' (default) or '30d'.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') === '30d' ? '30d' : '7d'
    const daysAgo = period === '7d' ? 7 : 30

    // Get the most recent score date (for display)
    const { data: latestDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const lastUpdated = latestDateRow?.score_date ?? null

    if (!lastUpdated) {
      return Response.json({ period, risers: [], fallers: [], last_updated: null })
    }

    // Use the most recent date with complete scores (non-null jobs_score)
    const { data: completeDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .not('jobs_score', 'is', null)
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const scoringDate = completeDateRow?.score_date ?? lastUpdated

    // Find nearest available date at least daysAgo before scoringDate
    const targetDate = new Date(scoringDate)
    targetDate.setDate(targetDate.getDate() - daysAgo)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    const { data: prevDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .lte('score_date', targetDateStr)
      .not('jobs_score', 'is', null)
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const previousDate = prevDateRow?.score_date ?? null

    if (!previousDate) {
      return Response.json({ period, risers: [], fallers: [], last_updated: lastUpdated })
    }

    // Fetch latest scores from the most recent complete date
    const { data: latestScores } = await supabase
      .from('daily_scores')
      .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum')
      .eq('score_date', scoringDate)

    // Fetch previous scores
    const { data: previousScores } = await supabase
      .from('daily_scores')
      .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score')
      .eq('score_date', previousDate)

    // Fetch technology details
    const { data: technologies } = await supabase
      .from('technologies')
      .select('id, slug, name, color, category')
      .eq('is_active', true)

    if (!latestScores || !technologies) {
      return Response.json({
        period,
        risers: [],
        fallers: [],
        last_updated: lastUpdated,
      })
    }

    // If previous scores are empty (no data for that date), return empty movers
    if (!previousScores || previousScores.length === 0) {
      return Response.json({ period, risers: [], fallers: [], last_updated: lastUpdated })
    }

    // Create maps for quick lookup
    const latestMap = new Map(latestScores.map(s => [s.technology_id, s]))
    const previousMap = new Map(previousScores.map(s => [s.technology_id, s]))
    const techMap = new Map(technologies.map(t => [t.id, t]))

    // Compute deltas and rank changes
    interface MoverData {
      slug: string
      name: string
      color: string
      category: string
      current_score: number
      previous_score: number
      score_delta: number
      rank_change: number
      current_rank: number
      momentum: number
      primary_driver: string
      sparkline: number[]
    }

    const movers: MoverData[] = []

    for (const tech of technologies) {
      const latest = latestMap.get(tech.id)
      const previous = previousMap.get(tech.id)

      if (!latest || !previous) continue

      const currentScore = Number(latest.composite_score)
      const previousScore = Number(previous.composite_score)
      const scoreDelta = currentScore - previousScore

      // Calculate sub-score deltas for primary driver
      const scoreDeltas = {
        github_delta: Number(latest.github_score) - Number(previous.github_score),
        community_delta: Number(latest.community_score) - Number(previous.community_score),
        jobs_delta: Number(latest.jobs_score) - Number(previous.jobs_score),
        ecosystem_delta: Number(latest.ecosystem_score) - Number(previous.ecosystem_score),
      }

      movers.push({
        slug: tech.slug,
        name: tech.name,
        color: tech.color,
        category: tech.category,
        current_score: currentScore,
        previous_score: previousScore,
        score_delta: scoreDelta,
        rank_change: 0, // Will compute after ranking
        current_rank: 0, // Will compute after ranking
        momentum: Number(latest.momentum),
        primary_driver: getPrimaryDriver(scoreDeltas),
        sparkline: [], // Will fetch below
      })
    }

    // Sort by current score to determine current ranks
    const currentRanking = [...movers].sort((a, b) => b.current_score - a.current_score)
    const currentRankMap = new Map(currentRanking.map((m, i) => [m.slug, i + 1]))

    // Sort by previous score to determine previous ranks
    const previousRanking = [...movers].sort((a, b) => b.previous_score - a.previous_score)
    const previousRankMap = new Map(previousRanking.map((m, i) => [m.slug, i + 1]))

    // Update rank info
    movers.forEach(m => {
      m.current_rank = currentRankMap.get(m.slug) ?? 0
      const previousRank = previousRankMap.get(m.slug) ?? 0
      m.rank_change = previousRank - m.current_rank
    })

    // Fetch sparklines for top movers (last 7 days)
    const sevenDaysAgo = new Date(lastUpdated)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: sparklineData } = await supabase
      .from('daily_scores')
      .select('technology_id, score_date, composite_score')
      .gte('score_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('score_date', { ascending: true })

    const sparklineMap = new Map<string, number[]>()
    if (sparklineData) {
      for (const row of sparklineData) {
        if (!sparklineMap.has(row.technology_id)) {
          sparklineMap.set(row.technology_id, [])
        }
        sparklineMap.get(row.technology_id)!.push(Number(row.composite_score))
      }
    }

    // Build slug → id map for efficient sparkline lookup
    const slugToId = new Map(technologies.map((t) => [t.slug, t.id]))

    // Add sparklines to movers
    movers.forEach(m => {
      const techId = slugToId.get(m.slug)
      if (techId) {
        m.sparkline = sparklineMap.get(techId) ?? []
      }
    })

    // Sort all movers by delta — take best performers as risers, worst as fallers
    const sortedByDelta = [...movers].sort((a, b) => b.score_delta - a.score_delta)

    // Risers: top 5 by delta, only show if delta > the median (i.e. genuinely better than average)
    const medianDelta = sortedByDelta[Math.floor(sortedByDelta.length / 2)]?.score_delta ?? 0
    const risers = sortedByDelta
      .filter(m => m.score_delta > medianDelta)
      .slice(0, 5)

    // Fallers: bottom 5 by delta — only include if they dropped noticeably more than average
    const fallers = sortedByDelta
      .reverse()
      .filter(m => m.score_delta < medianDelta)
      .slice(0, 5)

    return Response.json({
      period,
      risers,
      fallers,
      last_updated: lastUpdated,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
