import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * GET /api/admin/data-health
 *
 * Returns a snapshot of the data pipeline health:
 * - How many technologies have full / partial / minimal / no data
 * - Dimension coverage breakdown
 * - Days since last scoring run
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // Latest scoring date
    const { data: latestDate } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastScoringRun = latestDate?.score_date ?? null
    const daysSinceLastRun = lastScoringRun
      ? Math.floor(
          (Date.now() - new Date(lastScoringRun).getTime()) / 86_400_000
        )
      : null

    // Completeness distribution
    const { data: scores } = await supabase
      .from('daily_scores')
      .select(
        'technology_id, data_completeness, github_score, community_score, jobs_score, ecosystem_score'
      )
      .eq('score_date', lastScoringRun ?? '')

    const totalTechnologies = scores?.length ?? 0
    let withFullData    = 0
    let withPartialData = 0
    let withMinimalData = 0
    let withNoData      = 0
    let githubHas       = 0
    let communityHas    = 0
    let jobsHas         = 0
    let ecosystemHas    = 0

    for (const row of scores ?? []) {
      const dc = Number(row.data_completeness ?? 0)
      if (dc >= 1.0)       withFullData++
      else if (dc >= 0.5)  withPartialData++
      else if (dc > 0)     withMinimalData++
      else                 withNoData++

      if (row.github_score    != null) githubHas++
      if (row.community_score != null) communityHas++
      if (row.jobs_score      != null) jobsHas++
      if (row.ecosystem_score != null) ecosystemHas++
    }

    // Fetch log summary by batch
    const { data: fetchLogs } = await supabase
      .from('fetch_logs')
      .select('batch, status, started_at, data_points_created')
      .order('started_at', { ascending: false })
      .limit(50)

    const batchHealth: Record<string, { lastRun: string | null; status: string; dataPoints: number }> = {}
    for (const log of fetchLogs ?? []) {
      const batch = String(log.batch ?? 'unknown')
      if (!batchHealth[batch]) {
        batchHealth[batch] = {
          lastRun:    log.started_at as string ?? null,
          status:     log.status as string ?? 'unknown',
          dataPoints: Number(log.data_points_created ?? 0),
        }
      }
    }

    return NextResponse.json({
      totalTechnologies,
      withFullData,
      withPartialData,
      withMinimalData,
      withNoData,
      lastScoringRun,
      daysSinceLastRun,
      dimensionCoverage: {
        github:    { has_data: githubHas,    missing: totalTechnologies - githubHas },
        community: { has_data: communityHas, missing: totalTechnologies - communityHas },
        jobs:      { has_data: jobsHas,      missing: totalTechnologies - jobsHas },
        ecosystem: { has_data: ecosystemHas, missing: totalTechnologies - ecosystemHas },
      },
      batchHealth,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
