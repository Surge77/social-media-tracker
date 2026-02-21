/**
 * GET /api/ai/digest/latest
 *
 * Returns the most recent weekly digest, or a specific week via ?week=YYYY-MM-DD
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const week = req.nextUrl.searchParams.get('week')

  let query = supabase.from('weekly_digests').select('*')

  if (week) {
    query = query.eq('week_start', week)
  } else {
    query = query.order('week_start', { ascending: false }).limit(1)
  }

  const { data, error } = await query.single()

  if (error || !data) {
    return NextResponse.json({ digest: null, weekStart: null })
  }

  return NextResponse.json({
    digest: data.digest_data,
    weekStart: data.week_start,
  })
}
