import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedCronRequest } from '@/lib/cron/orchestrator'
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
    if (!isAuthorizedCronRequest(request, process.env)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createSupabaseAdminClient()
    const today = new Date().toISOString().split('T')[0]

    console.log(`[Batch Scoring] Running scoring pipeline for ${today}`)

    const { scored, errors } = await runScoringPipeline(supabase, today)
    const { data: rowsForDate } = await supabase
      .from('daily_scores')
      .select('technology_id, jobs_score, onchain_score')
      .eq('score_date', today)
    const { data: blockchainTechs } = await supabase
      .from('technologies')
      .select('id')
      .eq('category', 'blockchain')
      .eq('is_active', true)

    const duration = Date.now() - startTime
    const totalRows = rowsForDate?.length ?? 0
    const missingJobs = rowsForDate?.filter((r) => r.jobs_score === null).length ?? 0
    const blockchainIdSet = new Set((blockchainTechs ?? []).map((t) => t.id as string))
    const blockchainRows = rowsForDate?.filter((r) => blockchainIdSet.has(r.technology_id as string)) ?? []
    const blockchainWithOnchain = blockchainRows.filter((r) => r.onchain_score !== null).length

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
      diagnostics: {
        score_rows_for_date: totalRows,
        rows_missing_jobs_score: missingJobs,
        blockchain_rows: blockchainRows.length,
        blockchain_rows_with_onchain: blockchainWithOnchain,
      },
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
