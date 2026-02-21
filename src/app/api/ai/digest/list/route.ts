/**
 * GET /api/ai/digest/list
 *
 * Returns a list of available weekly digest weeks (most recent first, up to 12)
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('weekly_digests')
    .select('week_start, generated_at')
    .order('week_start', { ascending: false })
    .limit(12)

  if (error) {
    return NextResponse.json({ weeks: [] })
  }

  return NextResponse.json({ weeks: data || [] })
}
