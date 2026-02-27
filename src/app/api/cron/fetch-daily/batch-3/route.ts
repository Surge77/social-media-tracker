import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchRedditData } from '@/lib/api/reddit'
import { fetchRSSData } from '@/lib/api/rss'
import type { Technology, FetcherResult } from '@/types'

export const maxDuration = 60

/**
 * Batch 3: Reddit + RSS feeds
 *
 * NOTE: Job market fetching was moved to the weekly cron only
 * (fetch-weekly) to conserve Adzuna/JSearch API limits and prevent
 * daily runs from overwriting good weekly job counts with stale data.
 *
 * Called by the daily cron orchestrator. Can also be triggered manually.
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

    console.log(`[Batch 3] Fetched ${technologies.length} technologies`)

    const results: FetcherResult[] = []
    const fetcherNames: string[] = []

    console.log('[Batch 3] Fetching Reddit data...')
    results.push(await fetchRedditData(technologies as Technology[]))
    fetcherNames.push('reddit')

    console.log('[Batch 3] Fetching RSS data...')
    results.push(await fetchRSSData(technologies as Technology[]))
    fetcherNames.push('rss')

    // Aggregate and upsert
    const allDataPoints = results.flatMap((r) => r.dataPoints)
    const allErrors = results.flatMap((r, i) =>
      r.errors.map((e) => `[${fetcherNames[i]}] ${e}`)
    )

    console.log(`[Batch 3] Generated ${allDataPoints.length} data points`)

    if (allDataPoints.length > 0) {
      const BATCH_SIZE = 500
      for (let i = 0; i < allDataPoints.length; i += BATCH_SIZE) {
        const batch = allDataPoints.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await supabase
          .from('data_points')
          .upsert(batch, { onConflict: 'technology_id,source,metric,measured_at' })

        if (insertError) {
          throw new Error(`Failed to upsert data points (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${insertError.message}`)
        }

        // Keep data_points_latest in sync — one row per (tech, source, metric)
        const { error: latestError } = await supabase
          .from('data_points_latest')
          .upsert(
            batch.map((dp) => ({ ...dp, updated_at: new Date().toISOString() })),
            { onConflict: 'technology_id,source,metric' }
          )
        if (latestError) {
          console.warn(`[Batch 3] data_points_latest sync failed: ${latestError.message}`)
        }
      }
    }

    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_3',
      status: allErrors.length === 0 ? 'success' : 'partial',
      technologies_processed: technologies.length,
      data_points_created: allDataPoints.length,
      error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      batch: 3,
      duration: `${duration}ms`,
      dataPointsCreated: allDataPoints.length,
      errors: allErrors,
      summary: results.map((r, i) => ({
        source: fetcherNames[i],
        dataPoints: r.dataPoints.length,
        errors: r.errors.length,
      })),
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Batch 3] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_3',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, batch: 3, error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}
