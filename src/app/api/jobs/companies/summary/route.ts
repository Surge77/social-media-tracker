import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getJobsCompanies, type JobOpeningsFilters } from '@/lib/jobs/aggregator'

function parseFilters(request: Request): JobOpeningsFilters {
  const { searchParams } = new URL(request.url)
  const remote = searchParams.get('remote')
  const postedWithin = searchParams.get('postedWithin')

  return {
    technology: searchParams.get('technology') ?? undefined,
    company: searchParams.get('company') ?? undefined,
    location: searchParams.get('location') ?? undefined,
    role: searchParams.get('role') ?? undefined,
    source: searchParams.get('source') ?? undefined,
    remote: remote === 'remote' || remote === 'onsite' || remote === 'all' ? remote : undefined,
    postedWithin: postedWithin === '24h' || postedWithin === '72h' || postedWithin === '7d' || postedWithin === '30d' ? postedWithin : undefined,
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdminClient()
    const companies = await getJobsCompanies(supabase, parseFilters(request))
    return Response.json(companies, {
      headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=900' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
