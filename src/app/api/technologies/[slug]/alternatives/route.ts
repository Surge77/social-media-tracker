import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]/alternatives
 *
 * Returns alternative technologies for a given tech.
 * Falls back to same-category techs if no explicit 'alternative' relationships exist.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()

    // Look up the technology
    const { data: technology } = await supabase
      .from('technologies')
      .select('id, category, slug')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!technology) {
      return Response.json({ error: 'Technology not found' }, { status: 404 })
    }

    // Try explicit 'alternative' relationships first
    const { data: relationships } = await supabase
      .from('tech_relationships')
      .select('related_technology_id')
      .eq('technology_id', technology.id)
      .eq('relationship_type', 'alternative')
      .limit(4)

    let alternativeIds: string[] = (relationships ?? []).map((r) => r.related_technology_id)

    // Fall back: same category, exclude self, top 4 by score
    if (alternativeIds.length === 0) {
      const { data: sameCat } = await supabase
        .from('technologies')
        .select('id')
        .eq('category', technology.category)
        .eq('is_active', true)
        .neq('id', technology.id)
        .limit(4)

      alternativeIds = (sameCat ?? []).map((t) => t.id)
    }

    if (alternativeIds.length === 0) {
      return Response.json({ alternatives: [] })
    }

    // Fetch tech details
    const { data: techs } = await supabase
      .from('technologies')
      .select('id, slug, name, category, description, github_repo, stackoverflow_tag, color')
      .in('id', alternativeIds)
      .eq('is_active', true)

    if (!techs || techs.length === 0) {
      return Response.json({ alternatives: [] })
    }

    // Fetch today's data points for each (stars, SO questions, jobs)
    const today = new Date().toISOString().split('T')[0]
    const { data: dataPoints } = await supabase
      .from('data_points')
      .select('technology_id, source, metric, value')
      .in('technology_id', alternativeIds)
      .eq('measured_at', today)

    // Get latest scores
    const { data: scores } = await supabase
      .from('daily_scores')
      .select('technology_id, composite_score')
      .in('technology_id', alternativeIds)
      .order('score_date', { ascending: false })

    // Build score map (most recent per tech)
    const scoreMap = new Map<string, number>()
    for (const s of scores ?? []) {
      if (!scoreMap.has(s.technology_id)) {
        scoreMap.set(s.technology_id, Number(s.composite_score))
      }
    }

    // Build metrics per tech
    type DataPoint = { technology_id: string; source: string; metric: string; value: number }
    const getMetric = (points: DataPoint[], techId: string, source: string, metric: string) => {
      const dp = points.find(
        (d) => d.technology_id === techId && d.source === source && d.metric === metric
      )
      return dp ? Number(dp.value) : null
    }

    const alternatives = techs.map((t) => {
      const points = dataPoints ?? []
      return {
        slug: t.slug,
        name: t.name,
        category: t.category,
        description: t.description,
        color: t.color,
        github_repo: t.github_repo,
        stars: getMetric(points, t.id, 'github', 'stars'),
        forks: getMetric(points, t.id, 'github', 'forks'),
        stackoverflow_questions: getMetric(points, t.id, 'stackoverflow', 'questions'),
        job_listings: (getMetric(points, t.id, 'adzuna', 'job_postings') ?? 0) +
                      (getMetric(points, t.id, 'jsearch', 'job_postings') ?? 0),
        composite_score: scoreMap.get(t.id) ?? null,
      }
    })

    return Response.json({ alternatives })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
