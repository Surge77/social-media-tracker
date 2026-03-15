import type { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsLocationRows } from '@/lib/jobs/intelligence'

export async function GET(request: NextRequest) {
  try {
    const technology = request.nextUrl.searchParams.get('technology')
    const supabase = createSupabaseAdminClient()
    const locations = await getJobsLocationRows(supabase, technology)
    return Response.json({ locations })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
