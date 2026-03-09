import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  buildShardedCronStepUrls,
  buildInternalCronHeaders,
  hasCronSecretConfigError,
  isAuthorizedScheduledRequest,
  resolveCronBaseUrl,
  runCronStepWithRetry,
} from '@/lib/cron/orchestrator'

export const maxDuration = 60

/**
 * Daily cron orchestrator:
 * 1. Validates scheduler/auth configuration
 * 2. Runs all fetcher batches with retry
 * 3. Returns step-level status for observability
 *
 * Schedule: Every day at 2:00 AM UTC (configured in vercel.json)
 *
 * Batch routes (each has its own timeout):
 *   - batch-1, batch-2, and batch-4a run as sharded fan-out
 *   - remaining batch routes run once
 *   - scoring runs in a later cron window to avoid Hobby plan schedule jitter
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  // Verify this is a Vercel cron request in production
  if (process.env.VERCEL_ENV === 'production') {
    if (!isAuthorizedScheduledRequest(request, process.env)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    if (hasCronSecretConfigError(process.env)) {
      return Response.json(
        {
          success: false,
          error: 'CRON_SECRET is required in production for internal cron fan-out',
        },
        { status: 500 }
      )
    }

    const baseUrl = resolveCronBaseUrl(request, process.env)

    const fetcherBatches = [
      ...buildShardedCronStepUrls(baseUrl, '/api/cron/fetch-daily/batch-1', 6),
      ...buildShardedCronStepUrls(baseUrl, '/api/cron/fetch-daily/batch-2', 4),
      `${baseUrl}/api/cron/fetch-daily/batch-3`,
      ...buildShardedCronStepUrls(baseUrl, '/api/cron/fetch-daily/batch-4a', 12),
      `${baseUrl}/api/cron/fetch-daily/batch-4b`,
      `${baseUrl}/api/cron/fetch-daily/language-rankings`,
      `${baseUrl}/api/cron/fetch-daily/batch-5-blockchain`,
      `${baseUrl}/api/cron/fetch-daily/batch-6-youtube`,
    ]

    const headers = buildInternalCronHeaders(process.env)

    const fetchResults = await Promise.all(
      fetcherBatches.map((url, i) =>
        runCronStepWithRetry({
          name: `fetcher-${i + 1}`,
          url,
          init: { headers },
          retries: 1,
        })
      )
    )

    const stepResults = fetchResults
    const failedSteps = stepResults.filter((step) => !step.ok)
    const hasFailures = failedSteps.length > 0

    // Log the orchestrator run
    const supabase = createSupabaseAdminClient()
    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'daily_cron',
      status: hasFailures ? 'failed' : 'success',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: hasFailures
        ? failedSteps
            .map((step) => `${step.name}: ${step.error ?? `HTTP ${step.status}`}`)
            .join('; ')
        : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    if (hasFailures) {
      return Response.json(
        {
          success: false,
          message: 'One or more daily cron steps failed',
          duration: `${duration}ms`,
          stepResults,
          failedSteps,
        },
        { status: 500 }
      )
    }

    return Response.json(
      {
        success: true,
        message: 'Completed daily fetch fan-out; scoring runs in a later cron window',
        duration: `${duration}ms`,
        stepResults,
      },
      { status: 200 }
    )
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
