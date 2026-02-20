import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const today = new Date().toISOString().split('T')[0]

    // Try today's snapshot first
    const { data: rows } = await supabase
      .from('language_rankings')
      .select('*')
      .eq('snapshot_date', today)
      .order('rank', { ascending: true })

    if (rows && rows.length > 0) {
      return Response.json({ rankings: rows }, {
        headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' },
      })
    }

    // Fall back to most recent snapshot
    const { data: latest } = await supabase
      .from('language_rankings')
      .select('snapshot_date')
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return Response.json({ rankings: [], note: 'No data yet — run the cron job to populate' })
    }

    const { data: fallback } = await supabase
      .from('language_rankings')
      .select('*')
      .eq('snapshot_date', latest.snapshot_date)
      .order('rank', { ascending: true })

    return Response.json({ rankings: fallback ?? [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
