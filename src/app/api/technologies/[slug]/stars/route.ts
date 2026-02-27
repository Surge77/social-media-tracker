import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]/stars?period=90d|1y|all
 *
 * Returns daily star counts from data_points for star history chart.
 * Also returns metadata: last_updated, total_days_available (so the UI
 * can intelligently hide period tabs with no data).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const period = request.nextUrl.searchParams.get('period') ?? '90d'

    const supabase = createSupabaseAdminClient()

    const { data: technology } = await supabase
      .from('technologies')
      .select('id, github_repo')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!technology) {
      return Response.json({ error: 'Technology not found' }, { status: 404 })
    }

    if (!technology.github_repo) {
      return Response.json({ data: [], note: 'No GitHub repo tracked', total_days_available: 0 })
    }

    // Build query — for "all" we skip the date filter entirely (Fix #5)
    let query = supabase
      .from('data_points')
      .select('measured_at, value')
      .eq('technology_id', technology.id)
      .eq('source', 'github')
      .eq('metric', 'stars')
      .order('measured_at', { ascending: true })

    if (period !== 'all') {
      const daysBack = period === '90d' ? 90 : 365
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)
      const startDateStr = startDate.toISOString().split('T')[0]
      query = query.gte('measured_at', startDateStr)
    }

    const { data: rows, error } = await query

    if (error) throw new Error(error.message)

    const data = (rows ?? []).map((row) => ({
      date: row.measured_at,
      stars: Number(row.value),
    }))

    // Compute total days of data available (for smart period tab visibility)
    let totalDaysAvailable = 0
    if (data.length >= 2) {
      const oldest = new Date(data[0].date)
      const newest = new Date(data[data.length - 1].date)
      totalDaysAvailable = Math.round((newest.getTime() - oldest.getTime()) / 86400000)
    } else if (data.length === 1) {
      totalDaysAvailable = 1
    }

    // Freshness: last data point date (Fix #3)
    const lastUpdated = data.length > 0 ? data[data.length - 1].date : null

    return Response.json({
      data,
      last_updated: lastUpdated,
      total_days_available: totalDaysAvailable,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
