import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsLocationRows } from '@/lib/jobs/intelligence'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()
    const locations = await getJobsLocationRows(supabase)
    const location = locations.find((entry) => entry.locationSlug === slug)

    if (!location) {
      return Response.json({ error: 'Location not found' }, { status: 404 })
    }

    return Response.json({
      location,
      related: locations.filter((entry) => entry.locationSlug === slug),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
