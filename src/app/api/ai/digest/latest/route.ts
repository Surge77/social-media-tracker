/**
 * GET /api/ai/digest/latest
 *
 * Returns the most recent weekly digest
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('weekly_digests')
    .select('*')
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({
      digest: null,
      weekStart: null
    })
  }

  return NextResponse.json({
    digest: data.digest_data,
    weekStart: data.week_start
  })
}
