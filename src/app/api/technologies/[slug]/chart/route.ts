import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]/chart?period=30d|90d|1y
 *
 * Returns time-series chart data for a single technology.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const period = request.nextUrl.searchParams.get('period') ?? '90d'

    // Compute the start date based on period
    const now = new Date()
    let daysBack: number
    switch (period) {
      case '30d':
        daysBack = 30
        break
      case '1y':
        daysBack = 365
        break
      case '90d':
      default:
        daysBack = 90
        break
    }

    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysBack)
    const startDateStr = startDate.toISOString().split('T')[0]

    const supabase = createSupabaseAdminClient()

    // Look up technology by slug
    const { data: technology, error: techError } = await supabase
      .from('technologies')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (techError || !technology) {
      return Response.json({ error: 'Technology not found' }, { status: 404 })
    }

    // Fetch chart data
    const { data: chartRows, error: chartError } = await supabase
      .from('daily_scores')
      .select('score_date, composite_score, github_score, community_score, jobs_score, ecosystem_score')
      .eq('technology_id', technology.id)
      .gte('score_date', startDateStr)
      .order('score_date', { ascending: true })

    if (chartError) {
      throw new Error(`Failed to fetch chart data: ${chartError.message}`)
    }

    const data = (chartRows ?? []).map((row) => ({
      date: row.score_date,
      composite: Number(row.composite_score),
      github: row.github_score !== null ? Number(row.github_score) : null,
      community: row.community_score !== null ? Number(row.community_score) : null,
      jobs: row.jobs_score !== null ? Number(row.jobs_score) : null,
      ecosystem: row.ecosystem_score !== null ? Number(row.ecosystem_score) : null,
    }))

    return Response.json({ data })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: errorMsg }, { status: 500 })
  }
}
