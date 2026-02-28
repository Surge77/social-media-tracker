import { createSupabaseServerClient } from '@/lib/supabase/server'
import { fetchChainTVLs, fetchTopProtocols } from '@/lib/api/defillama'
import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1 hour cache

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Try cached data from system_config first (updated daily by batch-5)
    const { data: cached } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'blockchain_daily_data')
      .single()

    if (cached?.value) {
      const parsed = JSON.parse(cached.value as string)
      const age = Date.now() - new Date(parsed.fetched_at).getTime()
      // Invalidate if older than 24h OR if chain data is missing change fields (stale schema)
      const hasChangeFields = parsed.chains?.[0]?.change_1d !== undefined
      if (age < 86400000 && hasChangeFields) {
        return NextResponse.json({ success: true, data: parsed, source: 'cache' })
      }
    }

    // Fallback: fetch live
    const [chains, protocols] = await Promise.all([
      fetchChainTVLs(),
      fetchTopProtocols(),
    ])

    return NextResponse.json({
      success: true,
      data: { chains, protocols: protocols.slice(0, 20) },
      source: 'live',
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
