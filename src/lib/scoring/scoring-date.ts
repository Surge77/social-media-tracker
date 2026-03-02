import type { SupabaseClient } from '@supabase/supabase-js'

export function pickCanonicalScoringDate(
  latestDate: string | null,
  latestCompleteDate: string | null
): string | null {
  return latestCompleteDate ?? latestDate
}

export function getTargetDateDaysAgo(date: string, daysAgo: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export async function getLatestScoreDate(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data } = await supabase
    .from('daily_scores')
    .select('score_date')
    .order('score_date', { ascending: false })
    .limit(1)
    .single()

  return data?.score_date ?? null
}

export async function getLatestCompleteScoreDate(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data } = await supabase
    .from('daily_scores')
    .select('score_date')
    .not('jobs_score', 'is', null)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()

  return data?.score_date ?? null
}

export async function getCanonicalScoringDate(
  supabase: SupabaseClient
): Promise<{ lastUpdated: string | null; scoringDate: string | null }> {
  const [lastUpdated, latestComplete] = await Promise.all([
    getLatestScoreDate(supabase),
    getLatestCompleteScoreDate(supabase),
  ])

  return {
    lastUpdated,
    scoringDate: pickCanonicalScoringDate(lastUpdated, latestComplete),
  }
}

export async function getNearestDateAtOrBefore(
  supabase: SupabaseClient,
  targetDate: string,
  requireComplete = false
): Promise<string | null> {
  let query = supabase
    .from('daily_scores')
    .select('score_date')
    .lte('score_date', targetDate)
    .order('score_date', { ascending: false })
    .limit(1)

  if (requireComplete) {
    query = query.not('jobs_score', 'is', null)
  }

  const { data } = await query.single()
  return data?.score_date ?? null
}

