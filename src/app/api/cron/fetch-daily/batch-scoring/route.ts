import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { runScoringPipeline } from '@/lib/scoring/pipeline'

export const maxDuration = 60

/**
 * Batch Scoring: Runs after data fetcher batches complete.
 * Queries today's data_points, computes scores, upserts into daily_scores.
 *
 * Called by the daily cron orchestrator with a delay to let fetchers finish.
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
    const today = new Date().toISOString().split('T')[0]

    console.log(`[Batch Scoring] Running scoring pipeline for ${today}`)

    const { scored, errors } = await runScoringPipeline(supabase, today)

    const duration = Date.now() - startTime

    await supabase.from('fetch_logs').insert({
      source: 'daily_scoring',
      status: errors.length === 0 ? 'success' : 'partial',
      technologies_processed: scored,
      data_points_created: scored,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      batch: 'scoring',
      date: today,
      scored,
      duration: `${duration}ms`,
      errors,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Batch Scoring] Error:', errorMsg)

    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'daily_scoring',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      { success: false, batch: 'scoring', error: errorMsg, duration: `${duration}ms` },
      { status: 500 }
    )
  }
}
