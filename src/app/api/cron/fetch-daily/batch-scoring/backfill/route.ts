import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isAuthorizedCronRequest } from '@/lib/cron/orchestrator'
import { runScoringPipeline } from '@/lib/scoring/pipeline'

export const maxDuration = 60

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function enumerateDates(from: Date, to: Date, maxDays: number): string[] {
  const out: string[] = []
  const cursor = new Date(from)
  while (cursor <= to && out.length < maxDays) {
    out.push(fmtDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

/**
 * GET /api/cron/fetch-daily/batch-scoring/backfill?from=YYYY-MM-DD&to=YYYY-MM-DD&max_days=7
 *
 * Recomputes daily scores for a bounded historical date range.
 * Intended for controlled replay/backfill after scoring logic changes.
 */
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV === 'production') {
    if (!isAuthorizedCronRequest(request, process.env)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = new URL(request.url)
  const fromDate = parseDate(url.searchParams.get('from'))
  const toDate = parseDate(url.searchParams.get('to'))
  const maxDaysRaw = Number(url.searchParams.get('max_days') ?? 7)
  const maxDays = Number.isFinite(maxDaysRaw)
    ? Math.max(1, Math.min(31, Math.floor(maxDaysRaw)))
    : 7

  if (!fromDate || !toDate) {
    return Response.json(
      { error: 'Missing or invalid date range. Use from=YYYY-MM-DD&to=YYYY-MM-DD' },
      { status: 400 }
    )
  }
  if (fromDate > toDate) {
    return Response.json({ error: '`from` must be <= `to`' }, { status: 400 })
  }

  const dates = enumerateDates(fromDate, toDate, maxDays)
  const supabase = createSupabaseAdminClient()

  const started = Date.now()
  const results: Array<{ date: string; scored: number; errors: string[] }> = []
  let totalScored = 0

  for (const date of dates) {
    const res = await runScoringPipeline(supabase, date)
    totalScored += res.scored
    results.push({ date, scored: res.scored, errors: res.errors })
  }

  const lastDateProcessed = dates.length > 0 ? dates[dates.length - 1] : null
  const hasMore = toDate > (lastDateProcessed ? new Date(lastDateProcessed) : toDate)
  const nextFrom = hasMore && lastDateProcessed
    ? fmtDate(new Date(new Date(lastDateProcessed).setDate(new Date(lastDateProcessed).getDate() + 1)))
    : null

  return Response.json({
    success: true,
    processed_days: dates.length,
    requested_max_days: maxDays,
    total_scored: totalScored,
    duration_ms: Date.now() - started,
    has_more: hasMore,
    next_from: nextFrom,
    to: fmtDate(toDate),
    results,
  })
}
