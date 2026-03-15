import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { fetchHasDataJobsForTechnologies, fetchRemotiveFallbackListings } from '@/lib/api/hasdata-jobs'
import { rebuildJobsIntelligenceRollups, upsertNormalizedListings } from '@/lib/jobs/intelligence'
import { isAuthorizedCronRequest } from '@/lib/cron/orchestrator'
import type { Technology } from '@/types'

export const maxDuration = 60

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production' && !isAuthorizedCronRequest(request, process.env)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createSupabaseAdminClient()
    const maxTechs = Number(process.env.JOBS_INTELLIGENCE_MAX_TECHS ?? 20)

    const { data: technologies, error } = await supabase
      .from('technologies')
      .select('*')
      .eq('is_active', true)
      .limit(maxTechs)

    if (error || !technologies) {
      throw new Error(`Failed to fetch technologies: ${error?.message}`)
    }

    let listings
    try {
      listings = await fetchHasDataJobsForTechnologies(technologies as Technology[], {
        maxTechnologies: maxTechs,
        pagesPerTechnology: 1,
        location: 'United States',
      })
    } catch (error) {
      console.warn('[Jobs Intelligence] HasData unavailable, falling back to Remotive listings:', error)
      listings = await fetchRemotiveFallbackListings(technologies as Technology[])
    }

    const upserted = await upsertNormalizedListings(supabase, technologies as Technology[], listings)
    const rebuilt = await rebuildJobsIntelligenceRollups(supabase)

    return Response.json({
      success: true,
      listingsFetched: listings.length,
      ...upserted,
      ...rebuilt,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
