import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchJobsData } from '@/lib/api/jobs'
import type { Technology, FetcherResult } from '@/types'

export const maxDuration = 60 // Maximum duration in seconds (Vercel hobby plan limit)

/**
 * Weekly cron job: Fetch data from weekly sources (jobs, news)
 * Schedule: Every Monday at 3:00 AM UTC (configured in vercel.json)
 *
 * Manual trigger: GET /api/cron/fetch-weekly
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
    const supabase = createSupabaseAdminClient()

    // Step 1: Fetch all active technologies
    const { data: technologies, error: fetchError } = await supabase
      .from('technologies')
      .select('*')
      .eq('is_active', true)

    if (fetchError || !technologies) {
      throw new Error(`Failed to fetch technologies: ${fetchError?.message}`)
    }

    console.log(`[Weekly Cron] Fetched ${technologies.length} technologies`)

    // Step 2: Run weekly fetchers sequentially
    const results: FetcherResult[] = []
    const fetcherNames: string[] = []

    // Jobs (Adzuna, JSearch, Remotive, Arbeitnow)
    console.log('[Weekly Cron] Fetching job market data...')
    const jobsResult = await fetchJobsData(technologies as Technology[])
    results.push(jobsResult)
    fetcherNames.push('jobs')

    // Step 3: Aggregate all data points
    const allDataPoints = results.flatMap((r) => r.dataPoints)
    const allErrors = results.flatMap((r, i) =>
      r.errors.map((e) => `[${fetcherNames[i]}] ${e}`)
    )

    console.log(`[Weekly Cron] Generated ${allDataPoints.length} data points`)

    // Step 4: Upsert all data points into database (batch, handles duplicates)
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
      }

      console.log(`[Weekly Cron] Inserted ${allDataPoints.length} data points`)
    }

    // Step 5: Log to fetch_logs
    const duration = Date.now() - startTime
    const { error: logError } = await supabase.from('fetch_logs').insert({
      source: 'weekly_cron',
      status: allErrors.length === 0 ? 'success' : 'partial',
      technologies_processed: technologies.length,
      data_points_created: allDataPoints.length,
      error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    if (logError) {
      console.error('[Weekly Cron] Failed to log to fetch_logs:', logError)
    }

    return Response.json({
      success: true,
      duration: `${duration}ms`,
      technologiesProcessed: technologies.length,
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
    console.error('[Weekly Cron] Error:', errorMsg)

    // Log failure
    const duration = Date.now() - startTime
    const supabase = createSupabaseAdminClient()
    await supabase.from('fetch_logs').insert({
      source: 'weekly_cron',
      status: 'failed',
      technologies_processed: 0,
      data_points_created: 0,
      error_message: errorMsg,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json(
      {
        success: false,
        error: errorMsg,
        duration: `${duration}ms`,
      },
      { status: 500 }
    )
  }
}
