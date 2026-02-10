import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/seed-history
 *
 * Generates 30 days of realistic historical daily_scores
 * so that sparklines and trend charts show meaningful data.
 *
 * Uses current scores as the "today" baseline and works backwards
 * with small daily variations to simulate organic growth/decline.
 *
 * ONLY for development — remove before production deploy.
 */
export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // Fetch current scores (most recent date)
    const { data: latestDate } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    if (!latestDate) {
      return Response.json({ error: 'No existing scores found. Run the scoring pipeline first.' }, { status: 400 })
    }

    const { data: currentScores, error: scoresError } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('score_date', latestDate.score_date)

    if (scoresError || !currentScores || currentScores.length === 0) {
      return Response.json({ error: 'Failed to fetch current scores' }, { status: 500 })
    }

    console.log(`[Seed] Found ${currentScores.length} technologies with scores from ${latestDate.score_date}`)

    // Seeded random for reproducible results
    let seed = 42
    function seededRandom() {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    // Generate 30 days of history (working backwards from today)
    const DAYS = 30
    const rows: Array<Record<string, unknown>> = []
    const today = new Date(latestDate.score_date)

    for (const score of currentScores) {
      // Current values as "today" baseline
      let composite = Number(score.composite_score) || 50
      let github = Number(score.github_score) || 0
      let community = Number(score.community_score) || 0
      let jobs = Number(score.jobs_score) || 0
      let ecosystem = Number(score.ecosystem_score) || 0

      // Assign a "personality" to each technology
      // Some are rising, some declining, some stable
      const personality = seededRandom()
      // 0-0.3: declining, 0.3-0.7: stable, 0.7-1.0: rising
      const trendBias = personality < 0.3 ? -0.4 : personality > 0.7 ? 0.5 : 0

      // Work backwards from today
      for (let day = 1; day <= DAYS; day++) {
        const date = new Date(today)
        date.setDate(date.getDate() - day)
        const dateStr = date.toISOString().split('T')[0]

        // Each day going backwards = subtract the daily change
        // (so going forward in time, the tech approaches its current score)
        const dailyNoise = (seededRandom() - 0.5) * 3 // ±1.5 random noise
        const dailyTrend = trendBias + dailyNoise

        // Apply backwards (subtract trend to get historical value)
        composite = clamp(composite - dailyTrend, 5, 95)
        github = clamp(github - dailyTrend * (0.8 + seededRandom() * 0.4), 0, 100)
        community = clamp(community - dailyTrend * (0.6 + seededRandom() * 0.8), 0, 100)
        jobs = clamp(jobs - dailyTrend * (0.3 + seededRandom() * 0.4), 0, 100)
        ecosystem = clamp(ecosystem - dailyTrend * (0.5 + seededRandom() * 0.5), 0, 100)

        // Compute momentum based on 30-day change
        const momentum = day >= 25 ? 0 : round2(trendBias * 15 + (seededRandom() - 0.5) * 8)

        rows.push({
          technology_id: score.technology_id,
          score_date: dateStr,
          composite_score: round2(composite),
          github_score: round2(github),
          community_score: round2(community),
          jobs_score: round2(jobs),
          ecosystem_score: round2(ecosystem),
          momentum: momentum,
          data_completeness: Number(score.data_completeness) || 0.5,
          raw_sub_scores: score.raw_sub_scores || {},
          computed_at: new Date().toISOString(),
        })
      }
    }

    console.log(`[Seed] Generated ${rows.length} historical score rows`)

    // Upsert in batches (ON CONFLICT update)
    const BATCH_SIZE = 500
    let upserted = 0

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE)
      const { error: upsertError } = await supabase
        .from('daily_scores')
        .upsert(batch, { onConflict: 'technology_id,score_date' })

      if (upsertError) {
        console.error(`[Seed] Batch ${Math.floor(i / BATCH_SIZE)} error:`, upsertError.message)
      } else {
        upserted += batch.length
      }
    }

    return Response.json({
      message: `Seeded ${upserted} historical score rows for ${currentScores.length} technologies over ${DAYS} days`,
      rows_created: upserted,
      technologies: currentScores.length,
      days: DAYS,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
