import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60

/**
 * Daily cron orchestrator:
 * 1. Fires 3 fetcher batches in parallel (fire-and-forget)
 * 2. Waits 55s for them to finish
 * 3. Fires scoring batch (fire-and-forget)
 * 4. Returns
 *
 * Schedule: Every day at 2:00 AM UTC (configured in vercel.json)
 *
 * Batch routes (each has its own 60s timeout):
 *   - batch-1: GitHub + HN + Stack Overflow
 *   - batch-2: Packages + Dev.to
 *   - batch-3: Reddit + RSS
 *   - batch-scoring: Computes daily_scores from data_points
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  // Verify this is a Vercel cron request in production
  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const fetcherBatches = [
      `${baseUrl}/api/cron/fetch-daily/batch-1`,
      `${baseUrl}/api/cron/fetch-daily/batch-2`,
      `${baseUrl}/api/cron/fetch-daily/batch-3`,
      `${baseUrl}/api/cron/fetch-daily/batch-4a`,
      `${baseUrl}/api/cron/fetch-daily/batch-4b`,
    ]
    const scoringRoute = `${baseUrl}/api/cron/fetch-daily/batch-scoring`

    const headers: Record<string, string> = {}
    if (process.env.CRON_SECRET) {
      headers['x-internal-cron'] = process.env.CRON_SECRET
    }

    // Fire all 5 fetcher batches and wait for results
    const fetchResults = await Promise.allSettled(
      fetcherBatches.map((url) => fetch(url, { headers }))
    )

    // Retry once for any failed batches
    const failedIndexes = fetchResults
      .map((r, i) => ({ r, i }))
      .filter((x) => x.r.status === 'rejected')
      .map((x) => x.i)

    if (failedIndexes.length > 0) {
      console.warn(`[Daily Cron] Retrying ${failedIndexes.length} failed batches`)
      await Promise.allSettled(
        failedIndexes.map((i) => fetch(fetcherBatches[i], { headers }))
      )
    }

    // Fire scoring after all fetchers complete
    fetch(scoringRoute, { headers }).catch((err) => {
      console.error('[Daily Cron] Failed to fire scoring:', err)
    })

    // Log the orchestrator run
    const supabase = createSupabaseAdminClient()
    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'daily_cron',
      status: 'success',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      message: 'Fired 5 fetcher batches + scoring',
      batches: [...fetcherBatches, scoringRoute],
      duration: `${duration}ms`,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Daily Cron] Orchestrator error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_cron',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}
