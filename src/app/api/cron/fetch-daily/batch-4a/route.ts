import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchGitHubStats } from '@/lib/api/github-stats'
import type { Technology } from '@/types'

export const maxDuration = 60

/**
 * Batch 4a: GitHub Stats (active contributors, commit velocity, closed issues)
 * Runs in parallel with batch-4b. Called by the daily cron orchestrator.
 *
 * Separate from batch-1 because contributor/commit stats need 202 retry delays.
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

    console.log(`[Batch 4a] Fetching GitHub Stats for ${technologies.length} technologies`)

    const result = await fetchGitHubStats(technologies as Technology[])
    const allErrors = result.errors.map((e) => `[github-stats] ${e}`)

    if (result.dataPoints.length > 0) {
      const BATCH_SIZE = 500
      for (let i = 0; i < result.dataPoints.length; i += BATCH_SIZE) {
        const batch = result.dataPoints.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await supabase
          .from('data_points')
          .upsert(batch, { onConflict: 'technology_id,source,metric,measured_at' })

        if (insertError) {
          throw new Error(`Failed to upsert data points: ${insertError.message}`)
        }

        // Keep data_points_latest in sync — one row per (tech, source, metric)
        await supabase
          .from('data_points_latest')
          .upsert(
            batch.map((dp) => ({ ...dp, updated_at: new Date().toISOString() })),
            { onConflict: 'technology_id,source,metric' }
          )
      }
    }

    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_4a',
      status: allErrors.length === 0 ? 'success' : 'partial',
      technologies_processed: technologies.length,
      data_points_created: result.dataPoints.length,
      error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      batch: '4a',
      duration: `${duration}ms`,
      dataPointsCreated: result.dataPoints.length,
      errors: allErrors,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Batch 4a] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_4a',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, batch: '4a', error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}
