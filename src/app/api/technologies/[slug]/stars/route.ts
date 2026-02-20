import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]/stars?period=90d|1y|all
 *
 * Returns daily star counts from data_points for star history chart.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const period = request.nextUrl.searchParams.get('period') ?? '1y'

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
      return Response.json({ data: [], note: 'No GitHub repo tracked' })
    }

    let daysBack = 365
    if (period === '90d') daysBack = 90
    else if (period === 'all') daysBack = 1825 // 5 years

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    const startDateStr = startDate.toISOString().split('T')[0]

    const { data: rows, error } = await supabase
      .from('data_points')
      .select('measured_at, value')
      .eq('technology_id', technology.id)
      .eq('source', 'github')
      .eq('metric', 'stars')
      .gte('measured_at', startDateStr)
      .order('measured_at', { ascending: true })

    if (error) throw new Error(error.message)

    const data = (rows ?? []).map((row) => ({
      date: row.measured_at,
      stars: Number(row.value),
    }))

    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
