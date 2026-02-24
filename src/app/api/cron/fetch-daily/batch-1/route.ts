import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchGitHubData } from '@/lib/api/github'
import { fetchHackerNewsData } from '@/lib/api/hackernews'
import { fetchStackOverflowData } from '@/lib/api/stackoverflow'
import type { Technology, FetcherResult } from '@/types'

export const maxDuration = 60

/**
 * Batch 1: GitHub + Hacker News + Stack Overflow
 * Called by the daily cron orchestrator. Can also be triggered manually.
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  // Allow both Vercel cron and internal orchestrator calls
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

    console.log(`[Batch 1] Fetched ${technologies.length} technologies`)

    const results: FetcherResult[] = []
    const fetcherNames: string[] = []

    console.log('[Batch 1] Fetching GitHub data...')
    results.push(await fetchGitHubData(technologies as Technology[]))
    fetcherNames.push('github')

    console.log('[Batch 1] Fetching Hacker News data...')
    results.push(await fetchHackerNewsData(technologies as Technology[]))
    fetcherNames.push('hackernews')

    console.log('[Batch 1] Fetching Stack Overflow data...')
    results.push(await fetchStackOverflowData(technologies as Technology[]))
    fetcherNames.push('stackoverflow')

    // Aggregate and upsert
    const allDataPoints = results.flatMap((r) => r.dataPoints)
    const allErrors = results.flatMap((r, i) =>
      r.errors.map((e) => `[${fetcherNames[i]}] ${e}`)
    )

    console.log(`[Batch 1] Generated ${allDataPoints.length} data points`)

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
      source: 'daily_batch_1',
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
      batch: 1,
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
    console.error('[Batch 1] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_batch_1',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, batch: 1, error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}
