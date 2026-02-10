import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/compare?techs=react,vue,svelte
 *
 * Compare 2-4 technologies. Returns scores, raw signals, and 90-day chart data.
 */
export async function GET(request: NextRequest) {
  try {
    const techsParam = request.nextUrl.searchParams.get('techs')

    if (!techsParam) {
      return Response.json({ error: 'Missing "techs" query parameter' }, { status: 400 })
    }

    const slugs = techsParam.split(',').map((s) => s.trim()).filter(Boolean)

    if (slugs.length < 2 || slugs.length > 4) {
      return Response.json(
        { error: 'Provide 2-4 technology slugs, comma-separated' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Fetch technologies by slugs
    const { data: technologies, error: techError } = await supabase
      .from('technologies')
      .select('id, slug, name, color')
      .in('slug', slugs)
      .eq('is_active', true)

    if (techError) {
      throw new Error(`Failed to fetch technologies: ${techError.message}`)
    }

    if (!technologies || technologies.length < 2) {
      return Response.json(
        { error: 'At least 2 valid technology slugs are required' },
        { status: 400 }
      )
    }

    const techIds = technologies.map((t) => t.id)
    const techIdToSlug = new Map(technologies.map((t) => [t.id, t.slug]))

    // Fetch latest scores
    const { data: latestDate } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const scoreDate = latestDate?.score_date ?? null

    const scoreMap = new Map<string, Record<string, unknown>>()
    if (scoreDate) {
      const { data: scores } = await supabase
        .from('daily_scores')
        .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum')
        .in('technology_id', techIds)
        .eq('score_date', scoreDate)

      if (scores) {
        for (const s of scores) {
          scoreMap.set(s.technology_id, s)
        }
      }
    }

    // Fetch latest raw signals for comparison table
    const today = new Date().toISOString().split('T')[0]
    const { data: dataPoints } = await supabase
      .from('data_points')
      .select('technology_id, source, metric, value')
      .in('technology_id', techIds)
      .eq('measured_at', today)

    const signalMap = new Map<string, Map<string, number>>()
    if (dataPoints) {
      for (const dp of dataPoints) {
        if (!signalMap.has(dp.technology_id)) {
          signalMap.set(dp.technology_id, new Map())
        }
        signalMap.get(dp.technology_id)!.set(`${dp.source}:${dp.metric}`, Number(dp.value))
      }
    }

    // Build response technologies
    const techResults = technologies.map((tech) => {
      const scores = scoreMap.get(tech.id)
      const signals = signalMap.get(tech.id)

      return {
        slug: tech.slug,
        name: tech.name,
        color: tech.color,
        composite_score: scores ? Number(scores.composite_score) : 0,
        github_score: scores ? Number(scores.github_score) : 0,
        community_score: scores ? Number(scores.community_score) : 0,
        jobs_score: scores ? Number(scores.jobs_score) : 0,
        ecosystem_score: scores ? Number(scores.ecosystem_score) : 0,
        momentum: scores ? Number(scores.momentum) : 0,
        github_stars: signals?.get('github:stars') ?? null,
        npm_downloads: signals?.get('npm:downloads') ?? null,
        so_questions: signals?.get('stackoverflow:questions') ?? null,
        job_postings: (signals?.get('adzuna:job_postings') ?? 0) +
          (signals?.get('jsearch:job_postings') ?? 0) +
          (signals?.get('remotive:job_postings') ?? 0) || null,
        hn_mentions: signals?.get('hackernews:mentions') ?? null,
      }
    })

    // Fetch 90-day chart data for all compared technologies
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: chartRows } = await supabase
      .from('daily_scores')
      .select('technology_id, score_date, composite_score')
      .in('technology_id', techIds)
      .gte('score_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('score_date', { ascending: true })

    // Group chart data by date with slug keys
    const chartMap = new Map<string, Record<string, string | number>>()
    if (chartRows) {
      for (const row of chartRows) {
        const slug = techIdToSlug.get(row.technology_id)
        if (!slug) continue

        if (!chartMap.has(row.score_date)) {
          chartMap.set(row.score_date, { date: row.score_date })
        }
        chartMap.get(row.score_date)![slug] = Number(row.composite_score)
      }
    }

    const chart_data = Array.from(chartMap.values()).sort((a, b) =>
      (a.date as string).localeCompare(b.date as string)
    )

    return Response.json({
      technologies: techResults,
      chart_data,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
