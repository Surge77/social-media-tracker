import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/technologies
 *
 * Returns all active technologies with their latest scores and 30-day sparklines.
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

    // Fetch all active technologies with their latest scores
    let query = supabase
      .from('technologies')
      .select('id, slug, name, description, category, color')
      .eq('is_active', true)

    const { data: technologies, error: techError } = await query

    if (techError) {
      throw new Error(`Failed to fetch technologies: ${techError.message}`)
    }

    // Fetch latest scores for all technologies
    const scoreMap = new Map<string, Record<string, unknown>>()

    if (lastUpdated) {
      const { data: scores } = await supabase
        .from('daily_scores')
        .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, data_completeness')
        .eq('score_date', lastUpdated)

      if (scores) {
        for (const s of scores) {
          scoreMap.set(s.technology_id, s)
        }
      }
    }

    // Fetch sparkline data (last 30 days of composite scores)
    const sparklineMap = new Map<string, number[]>()

    if (lastUpdated) {
      const thirtyDaysAgo = new Date(lastUpdated)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: sparklineData } = await supabase
        .from('daily_scores')
        .select('technology_id, score_date, composite_score')
        .gte('score_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('score_date', { ascending: true })

      if (sparklineData) {
        for (const row of sparklineData) {
          if (!sparklineMap.has(row.technology_id)) {
            sparklineMap.set(row.technology_id, [])
          }
          sparklineMap.get(row.technology_id)!.push(Number(row.composite_score))
        }
      }
    }

    // Merge technologies with scores and sparklines
    const result = (technologies ?? []).map((tech) => {
      const scores = scoreMap.get(tech.id) as Record<string, unknown> | undefined
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
      }
    })

    // Sort by composite score descending, nulls last
    result.sort((a, b) => {
      if (a.composite_score === null && b.composite_score === null) return 0
      if (a.composite_score === null) return 1
      if (b.composite_score === null) return -1
      return b.composite_score - a.composite_score
    })

    return Response.json({
      technologies: result,
      last_updated: lastUpdated,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
