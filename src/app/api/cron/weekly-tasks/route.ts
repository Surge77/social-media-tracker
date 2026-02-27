import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60

/**
 * Weekly task orchestrator — consolidates all non-daily cron work into one slot.
 *
 * Fires in parallel:
 *   - /api/cron/fetch-weekly    (job market data)
 *   - /api/ai/digest/generate   (weekly AI digest)
 *
 * Additionally, on the first Monday of every month:
 *   - /api/cron/cleanup         (data retention — deletes data_points >90d, fetch_logs >30d)
 *
 * This exists solely to stay within Vercel Hobby plan's 2-cron-job limit.
 * The two registered crons are: /api/cron/fetch-daily and /api/cron/weekly-tasks.
 *
 * Schedule: Every Monday at 3:00 AM UTC (configured in vercel.json)
 */
export async function GET(request: Request) {
  const startTime = Date.now()

  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const internalHeaders: Record<string, string> = {}
  if (process.env.CRON_SECRET) {
    internalHeaders['x-internal-cron'] = process.env.CRON_SECRET
  }

  const results: Record<string, unknown> = {}

  // Fire fetch-weekly and digest generation in parallel
  const [weeklyResult, digestResult] = await Promise.allSettled([
    fetch(`${baseUrl}/api/cron/fetch-weekly`, { headers: internalHeaders }),
    fetch(`${baseUrl}/api/ai/digest/generate`, {
      method: 'POST',
      headers: {
        ...internalHeaders,
        'Content-Type': 'application/json',
        ...(process.env.CRON_SECRET
          ? { Authorization: `Bearer ${process.env.CRON_SECRET}` }
          : {}),
      },
    }),
  ])

  results.fetchWeekly =
    weeklyResult.status === 'fulfilled' ? `HTTP ${weeklyResult.value.status}` : `failed: ${weeklyResult.reason}`
  results.digestGenerate =
    digestResult.status === 'fulfilled' ? `HTTP ${digestResult.value.status}` : `failed: ${digestResult.reason}`

  // Run cleanup only on the first Monday of the month (day 1–7)
  const dayOfMonth = new Date().getDate()
  if (dayOfMonth <= 7) {
    const cleanupResult = await fetch(`${baseUrl}/api/cron/cleanup`, { headers: internalHeaders })
    results.cleanup = `HTTP ${cleanupResult.status}`
  } else {
    results.cleanup = 'skipped (not first Monday of month)'
  }

  // Log orchestrator run
  const supabase = createSupabaseAdminClient()
  const duration = Date.now() - startTime
  await supabase.from('fetch_logs').insert({
    source: 'weekly_tasks_orchestrator',
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
    duration: `${duration}ms`,
    tasks: results,
  })
}
