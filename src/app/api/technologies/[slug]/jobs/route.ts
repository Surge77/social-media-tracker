import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * GET /api/technologies/[slug]/jobs?period=90d|1y|all
 *
 * Returns daily aggregate job counts across all job sources for the Job Market chart.
 * Also returns metadata: last_updated, total_days_available.
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
            .select('id')
            .eq('slug', slug)
            .eq('is_active', true)
            .single()

        if (!technology) {
            return Response.json({ error: 'Technology not found' }, { status: 404 })
        }

        let query = supabase
            .from('data_points')
            .select('measured_at, value, source')
            .eq('technology_id', technology.id)
            .eq('metric', 'job_postings')
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

        // Group rows by measured_at and sum up the 'value' across all sources (adzuna, jsearch, remotive)
        const groupedData: Record<string, number> = {}

            ; (rows ?? []).forEach((row) => {
                const date = row.measured_at
                const val = Number(row.value) || 0

                // We don't want to include negative or error values
                if (val >= 0) {
                    if (!groupedData[date]) {
                        groupedData[date] = 0
                    }
                    groupedData[date] += val
                }
            })

        const data = Object.entries(groupedData)
            .map(([date, jobs]) => ({
                date,
                jobs,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Compute total days of data available
        let totalDaysAvailable = 0
        if (data.length >= 2) {
            const oldest = new Date(data[0].date)
            const newest = new Date(data[data.length - 1].date)
            totalDaysAvailable = Math.round((newest.getTime() - oldest.getTime()) / 86400000)
        } else if (data.length === 1) {
            totalDaysAvailable = 1
        }

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
