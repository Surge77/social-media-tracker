import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsCompanyRows } from '@/lib/jobs/intelligence'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createSupabaseAdminClient()
    const companies = await getJobsCompanyRows(supabase)
    const company = companies.find((entry) => entry.companySlug === slug)

    if (!company) {
      return Response.json({ error: 'Company not found' }, { status: 404 })
    }

    return Response.json({ company })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
