import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchTechnologyGoogleTrendsSignal } from '@/lib/api/serpapi-jobs'
import { rebuildJobsIntelligenceRollups } from '@/lib/jobs/intelligence'
import { isAuthorizedCronRequest } from '@/lib/cron/orchestrator'
import type { Technology } from '@/types'

export const maxDuration = 60

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production' && !isAuthorizedCronRequest(request, process.env)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const today = new Date().toISOString().split('T')[0]
    const maxTechs = Number(process.env.JOBS_TRENDS_MAX_TECHS ?? 40)

    const { data: technologies, error } = await supabase
      .from('technologies')
      .select('*')
      .eq('is_active', true)
      .limit(maxTechs)

    if (error || !technologies) {
      throw new Error(`Failed to fetch technologies: ${error?.message}`)
    }

    const dataPoints = []
    for (const technology of technologies as Technology[]) {
      const signal = await fetchTechnologyGoogleTrendsSignal(technology)
      dataPoints.push(
        { technology_id: technology.id, source: 'googletrends', metric: 'interest_index', value: signal.searchInterest ?? 0, metadata: signal.raw, measured_at: today },
        { technology_id: technology.id, source: 'googletrends', metric: 'interest_velocity', value: signal.searchVelocity, metadata: signal.raw, measured_at: today },
        { technology_id: technology.id, source: 'googletrends', metric: 'interest_acceleration', value: signal.searchAcceleration, metadata: signal.raw, measured_at: today },
        { technology_id: technology.id, source: 'googletrends', metric: 'geo_spread', value: signal.geoSpread, metadata: signal.raw, measured_at: today },
        { technology_id: technology.id, source: 'googletrends', metric: 'related_queries_rising', value: signal.relatedQueriesRisingCount, metadata: signal.raw, measured_at: today },
      )
    }

    if (dataPoints.length > 0) {
      const { error: insertError } = await supabase
        .from('data_points')
        .upsert(dataPoints, { onConflict: 'technology_id,source,metric,measured_at' })
      if (insertError) throw new Error(`Failed to upsert google trends data: ${insertError.message}`)
    }

    const rebuilt = await rebuildJobsIntelligenceRollups(supabase, today)

    return Response.json({
      success: true,
      technologiesProcessed: technologies.length,
      dataPointsCreated: dataPoints.length,
      ...rebuilt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
