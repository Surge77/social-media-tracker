import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchBlockchainJobCounts } from '@/lib/api/blockchain-jobs'
import { fetchChainTVLs, fetchTopProtocols } from '@/lib/api/defillama'

export const maxDuration = 60

/**
 * Blockchain-specific daily batch.
 * Fetches: DeFiLlama TVL, blockchain job counts, chain activity.
 * Runs as part of the existing fetch-daily orchestrator.
 * No new Vercel cron slot needed.
 *
 * Auth: x-vercel-cron OR x-internal-cron header
 */
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production') {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    const isInternal   = request.headers.get('x-internal-cron') === process.env.CRON_SECRET
    if (!isVercelCron && !isInternal) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const startTime = Date.now()
  const supabase  = createSupabaseAdminClient()

  try {
    const [chainTVLs, protocols, jobCounts] = await Promise.all([
      fetchChainTVLs().catch(() => []),
      fetchTopProtocols().catch(() => []),
      fetchBlockchainJobCounts().catch(() => new Map<string, number>()),
    ])

    // Store chain/protocol data as system_config for the /blockchain page to read
    const chainData = {
      chains: chainTVLs.slice(0, 10).map((c) => ({
        name: c.name,
        tvl: c.tvl,
        change_1d: c.change_1d,
        change_7d: c.change_7d,
      })),
      protocols: protocols.slice(0, 20).map((p) => ({
        name: p.name,
        slug: p.slug,
        tvl: p.tvl,
        category: p.category,
        chains: p.chains,
      })),
      job_counts: Object.fromEntries(jobCounts),
      fetched_at: new Date().toISOString(),
    }

    await supabase
      .from('system_config')
      .upsert({ key: 'blockchain_daily_data', value: JSON.stringify(chainData) })

    const duration = Date.now() - startTime
    console.log(
      `[Batch 5 Blockchain] Completed in ${duration}ms — ${chainTVLs.length} chains, ${protocols.length} protocols`
    )

    return Response.json({
      success: true,
      duration: `${duration}ms`,
      chains: chainTVLs.length,
      protocols: protocols.length,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Batch 5 Blockchain] Error:', msg)
    return Response.json({ success: false, error: msg }, { status: 500 })
  }
}
