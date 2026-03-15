import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsOverview } from '@/lib/jobs/intelligence'

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()
    const overview = await getJobsOverview(supabase)

    return Response.json(overview, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
