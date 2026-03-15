import type { NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsRoleRows } from '@/lib/jobs/intelligence'

export async function GET(request: NextRequest) {
  try {
    const technology = request.nextUrl.searchParams.get('technology')
    const supabase = createSupabaseAdminClient()
    const roles = await getJobsRoleRows(supabase, technology)
    return Response.json({ roles })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
