/**
 * Dev Scheduler
 *
 * Runs automatically when the Next.js dev server starts (via instrumentation.ts).
 * - On boot: checks if data is stale (> 23h) and fires the cron immediately
 * - Every 24h: fires the daily fetch in the background
 * - Every 7 days: fires the weekly jobs fetch
 *
 * This means your demo data stays fresh without deploying to Vercel.
 * Does nothing in production (Vercel crons handle that).
 */

import { createSupabaseAdminClient } from '@/lib/supabase/admin'

let started = false

export function startDevScheduler() {
  // Guard: only start once (hot-reload can call this multiple times)
  if (started) return
  started = true

  // Port matches the dev script: next dev -p 3000
  const port = process.env.PORT ?? '3000'
  const base = `http://127.0.0.1:${port}`

  async function runDaily() {
    console.log('\n[DevScheduler] Triggering daily data fetch...')
    try {
      const res = await fetch(`${base}/api/cron/fetch-daily`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { message?: string; error?: string }
      console.log('[DevScheduler] Daily fetch done:', json.message ?? 'ok')
    } catch (err) {
      console.error('[DevScheduler] Daily fetch failed:', err)
    }
  }

  async function runWeekly() {
    console.log('\n[DevScheduler] Triggering weekly jobs fetch...')
    try {
      const res = await fetch(`${base}/api/cron/fetch-weekly`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json() as { message?: string; error?: string }
      console.log('[DevScheduler] Weekly fetch done:', json.message ?? 'ok')
    } catch (err) {
      console.error('[DevScheduler] Weekly fetch failed:', err)
    }
  }

  async function checkAndRunIfStale() {
    try {
      const supabase = createSupabaseAdminClient()

      // Check daily data age
      const { data: latest } = await supabase
        .from('daily_scores')
        .select('score_date')
        .order('score_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      const lastDaily = latest?.score_date ? new Date(latest.score_date as string) : null
      const hoursSinceDaily = lastDaily
        ? (Date.now() - lastDaily.getTime()) / 3_600_000
        : Infinity

      if (hoursSinceDaily > 23) {
        console.log(
          `\n[DevScheduler] Daily data is ${Math.round(hoursSinceDaily)}h old — fetching now`
        )
        await runDaily()
      } else {
        console.log(
          `\n[DevScheduler] Daily data is fresh (${Math.round(hoursSinceDaily)}h old) — skipping`
        )
      }

      // Check weekly jobs data age (jobs come from fetch-weekly)
      const { data: latestJob } = await supabase
        .from('data_points')
        .select('measured_at')
        .in('source', ['adzuna', 'jsearch', 'remotive'])
        .order('measured_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const lastWeekly = latestJob?.measured_at ? new Date(latestJob.measured_at as string) : null
      const daysSinceWeekly = lastWeekly
        ? (Date.now() - lastWeekly.getTime()) / 86_400_000
        : Infinity

      if (daysSinceWeekly > 6) {
        console.log(
          `[DevScheduler] Jobs data is ${Math.round(daysSinceWeekly)}d old — fetching now`
        )
        await runWeekly()
      }
    } catch (err) {
      console.error('[DevScheduler] Staleness check failed:', err)
    }
  }

  // Wait 4s for the dev server to finish booting, then check staleness
  setTimeout(checkAndRunIfStale, 4_000)

  // Re-run daily and weekly in background for long-running dev sessions
  setInterval(runDaily,  24 * 60 * 60 * 1_000)
  setInterval(runWeekly,  7 * 24 * 60 * 60 * 1_000)

  console.log('[DevScheduler] Started — auto-fetches stale data on boot, then every 24h')
}
