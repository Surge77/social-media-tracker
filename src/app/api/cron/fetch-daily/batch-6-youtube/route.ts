import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchYouTubeData } from '@/lib/api/youtube'
import type { Technology, DataPoint } from '@/types'

type DataPointInsert = Omit<DataPoint, 'id' | 'created_at'>

export const maxDuration = 60

/**
 * Batch 6: YouTube Data API v3
 * Fetches tutorial video counts, views, upload velocity, and top video metadata.
 * Isolated batch to keep quota management separate from other fetchers.
 *
 * Quota usage: ~4,848–6,868 units/day (10,000 daily limit)
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

    console.log(`[Batch 6 YouTube] Processing ${technologies.length} technologies`)

    const result = await fetchYouTubeData(technologies as Technology[])

    if (result.dataPoints.length > 0) {
      const BATCH_SIZE = 500
      for (let i = 0; i < result.dataPoints.length; i += BATCH_SIZE) {
        const batch = result.dataPoints.slice(i, i + BATCH_SIZE)
        const { error: insertError } = await supabase
          .from('data_points')
          .insert(batch as DataPointInsert[])

        if (insertError) {
          console.error('[Batch 6 YouTube] Insert error:', insertError.message)
        }
      }
    }

    const duration = Date.now() - startTime
    const status = result.errors.length === 0
      ? 'success'
      : result.dataPoints.length > 0 ? 'partial' : 'failed'

    await supabase.from('fetch_logs').insert({
      source: 'youtube',
      status,
      technologies_processed: technologies.length,
      data_points_created: result.dataPoints.length,
      error_message: result.errors.length > 0 ? result.errors.slice(0, 3).join('; ') : null,
      duration_ms: duration,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    })

    return Response.json({
      success: true,
      source: 'youtube',
      dataPoints: result.dataPoints.length,
      errors: result.errors,
      duration: `${duration}ms`,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Batch 6 YouTube] Error:', errorMsg)
    return Response.json({ success: false, error: errorMsg }, { status: 500 })
  }
}
