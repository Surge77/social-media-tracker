import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsSearchVsHiringRows } from '@/lib/jobs/intelligence'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const points = await getJobsSearchVsHiringRows(supabase)
    return Response.json({ points })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
