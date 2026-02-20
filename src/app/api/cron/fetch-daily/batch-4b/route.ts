import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchLibrariesIOData } from '@/lib/api/librariesio'
import { fetchNpmsData } from '@/lib/api/npms'
import type { Technology, DataPoint } from '@/types'

type DataPointInsert = Omit<DataPoint, 'id' | 'created_at'>

export const maxDuration = 60

/**
 * Batch 4b: Libraries.io (adoption signals) + npms.io (quality scores)
 * Runs in parallel with batch-4a. Called by the daily cron orchestrator.
 *
 * Libraries.io runs every 3 days (cadence enforced internally).
 * npms.io runs every day (bulk call, fast).
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    const isInternal = request.headers.get('x-internal-cron') === process.env.CRON_SECRET
    if (!isVercelCron && !isInternal) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createSupabaseAdminClient()

    const { data: technologies, error: fetchError } = await supabase
      .from('technologies')
      .select('*')
      .eq('is_active', true)

    if (fetchError || !technologies) {
      throw new Error(`Failed to fetch technologies: ${fetchError?.message}`)
    }

    console.log(`[Batch 4b] Processing ${technologies.length} technologies`)

    const allDataPoints: DataPointInsert[] = []
    const allErrors: string[] = []
    const summary: Array<{ source: string; dataPoints: number; errors: number; skipped?: boolean }> = []

    // Libraries.io (3-day cadence enforced inside fetchLibrariesIOData)
    console.log('[Batch 4b] Fetching Libraries.io data...')
    const libResult = await fetchLibrariesIOData(technologies as Technology[], supabase)
    allErrors.push(...libResult.errors.map((e) => `[librariesio] ${e}`))
    summary.push({
      source: 'librariesio',
      dataPoints: libResult.dataPoints.length,
      errors: libResult.errors.length,
      skipped: libResult.errors.some((e) => e.startsWith('Skipped')),
    })

    // npms.io (runs daily, one bulk call)
    console.log('[Batch 4b] Fetching npms.io data...')
    const npmsResult = await fetchNpmsData(technologies as Technology[])
    allErrors.push(...npmsResult.errors.map((e) => `[npms] ${e}`))
    summary.push({
      source: 'npms',
      dataPoints: npmsResult.dataPoints.length,
      errors: npmsResult.errors.length,
    })

    // Combine all data points
    const combinedDataPoints = [
      ...libResult.dataPoints,
      ...npmsResult.dataPoints,
    ]

    allDataPoints.push(...(combinedDataPoints as DataPointInsert[]))

    if (combinedDataPoints.length > 0) {
      const BATCH_SIZE = 500
      for (let i = 0; i < combinedDataPoints.length; i += BATCH_SIZE) {
        const batch = combinedDataPoints.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await supabase
          .from('data_points')
          .upsert(batch, { onConflict: 'technology_id,source,metric,measured_at' })

        if (insertError) {
          throw new Error(`Failed to upsert data points: ${insertError.message}`)
        }
      }
    }

    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_4b',
      status: allErrors.length === 0 ? 'success' : 'partial',
      technologies_processed: technologies.length,
      data_points_created: combinedDataPoints.length,
      error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      batch: '4b',
      duration: `${duration}ms`,
      dataPointsCreated: combinedDataPoints.length,
      errors: allErrors,
      summary,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Batch 4b] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_4b',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, batch: '4b', error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}

