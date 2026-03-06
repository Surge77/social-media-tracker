import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  buildInternalBearerHeaders,
  buildInternalCronHeaders,
  hasCronSecretConfigError,
  isAuthorizedScheduledRequest,
  runCronStepWithRetry,
} from '@/lib/cron/orchestrator'

export const maxDuration = 60

/**
 * Weekly task orchestrator consolidates non-daily cron work into one slot.
 *
 * Scheduled route: /api/cron/weekly-tasks
 * Fan-out:
 *   - /api/cron/fetch-weekly
 *   - /api/ai/digest/generate
 *   - /api/cron/cleanup (first Monday of month only)
 */
export async function GET(request: Request) {
  const startTime = Date.now()

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

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const internalHeaders = buildInternalCronHeaders(process.env)
    const digestHeaders = buildInternalBearerHeaders(process.env, {
      'Content-Type': 'application/json',
    })

    const [weeklyResult, digestResult] = await Promise.all([
      runCronStepWithRetry({
        name: 'fetch-weekly',
        url: `${baseUrl}/api/cron/fetch-weekly`,
        init: { headers: internalHeaders },
      }),
      runCronStepWithRetry({
        name: 'digest-generate',
        url: `${baseUrl}/api/ai/digest/generate`,
        init: { method: 'POST', headers: digestHeaders },
      }),
    ])

    const stepResults = [weeklyResult, digestResult]

    const dayOfMonth = new Date().getDate()
    if (dayOfMonth <= 7) {
      const cleanupResult = await runCronStepWithRetry({
        name: 'cleanup',
        url: `${baseUrl}/api/cron/cleanup`,
        init: { headers: internalHeaders },
      })
      stepResults.push(cleanupResult)
    }

    const failedSteps = stepResults.filter((step) => !step.ok)
    const hasFailures = failedSteps.length > 0

    const supabase = createSupabaseAdminClient()
    const duration = Date.now() - startTime
    await supabase.from('fetch_logs').insert({
      source: 'weekly_tasks_orchestrator',
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
          duration: `${duration}ms`,
          stepResults,
          failedSteps,
        },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      duration: `${duration}ms`,
      stepResults,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Weekly Tasks Orchestrator] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'weekly_tasks_orchestrator',
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
