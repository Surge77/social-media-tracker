import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const maxDuration = 60

/**
 * Monthly cleanup cron: enforce data retention policy.
 *
 * - data_points:       delete rows older than 90 days (raw data is useless after scoring)
 * - language_rankings: delete rows older than 90 days (46 rows/day = ~16k rows/year otherwise)
 * - fetch_logs:        delete rows older than 30 days (audit trail, not analytics)
 *
 * Schedule: 1st of every month at 4:00 AM UTC (configured in vercel.json)
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
    const now = new Date()

    const cutoff90 = new Date(now)
    cutoff90.setDate(cutoff90.getDate() - 90)
    const cutoff90Str = cutoff90.toISOString().split('T')[0]

    const cutoff30 = new Date(now)
    cutoff30.setDate(cutoff30.getDate() - 30)
    const cutoff30Str = cutoff30.toISOString().split('T')[0]

    // Delete raw data_points older than 90 days
    const { error: dpError, count: dpDeleted } = await supabase
      .from('data_points')
      .delete({ count: 'exact' })
      .lt('measured_at', cutoff90Str)

    if (dpError) {
      throw new Error(`data_points cleanup failed: ${dpError.message}`)
    }

    // Delete language_rankings older than 90 days (46 rows/day accumulation)
    const { error: lrError, count: lrDeleted } = await supabase
      .from('language_rankings')
      .delete({ count: 'exact' })
      .lt('snapshot_date', cutoff90Str)

    if (lrError) {
      throw new Error(`language_rankings cleanup failed: ${lrError.message}`)
    }

    // Delete fetch_logs older than 30 days
    const { error: logError, count: logsDeleted } = await supabase
      .from('fetch_logs')
      .delete({ count: 'exact' })
      .lt('started_at', cutoff30Str)

    if (logError) {
      throw new Error(`fetch_logs cleanup failed: ${logError.message}`)
    }

    const duration = Date.now() - startTime
    console.log(`[Cleanup] Deleted ${dpDeleted ?? 0} data_points, ${lrDeleted ?? 0} language_rankings, ${logsDeleted ?? 0} fetch_logs in ${duration}ms`)

    return Response.json({
      success: true,
      duration: `${duration}ms`,
      deleted: {
        data_points: dpDeleted ?? 0,
        language_rankings: lrDeleted ?? 0,
        fetch_logs: logsDeleted ?? 0,
      },
      cutoffs: {
        data_points: cutoff90Str,
        language_rankings: cutoff90Str,
        fetch_logs: cutoff30Str,
      },
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Cleanup] Error:', errorMsg)
    return Response.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
