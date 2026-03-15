import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsRoleRows } from '@/lib/jobs/intelligence'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()
    const roles = await getJobsRoleRows(supabase)
    const role = roles.find((entry) => entry.roleSlug === slug)

    if (!role) {
      return Response.json({ error: 'Role not found' }, { status: 404 })
    }

    return Response.json({
      role,
      related: roles.filter((entry) => entry.roleSlug === slug),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
