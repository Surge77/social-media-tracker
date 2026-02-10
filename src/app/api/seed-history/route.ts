import { createSupabaseAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/seed-history
 *
 * Generates 30 days of realistic historical daily_scores
 * with distinct "personality" patterns so sparklines tell different stories.
 *
 * Patterns: rocket (sharp rise), decline (falling), volatile (swings),
 * breakout (flat then spike), plateau (rise then flat), steady-climb,
 * slow-fade, U-shape (dip then recovery), hype-cycle (spike then settle).
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
      return Response.json(
        { error: 'No existing scores found. Run the scoring pipeline first.' },
        { status: 400 }
      )
    }

    const { data: currentScores, error: scoresError } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('score_date', latestDate.score_date)

    if (scoresError || !currentScores || currentScores.length === 0) {
      return Response.json({ error: 'Failed to fetch current scores' }, { status: 500 })
    }

    console.log(
      `[Seed] Found ${currentScores.length} technologies with scores from ${latestDate.score_date}`
    )

    // Seeded random for reproducible results
    let seed = 42
    function seededRandom() {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }

    // ---- Personality patterns ----
    // Each returns a multiplier for how much the score changes on a given day (0-29)
    // Positive = score increases forward in time, negative = decreases
    type Pattern = {
      name: string
      // Returns daily delta for day index (0=oldest, 29=newest)
      getDelta: (day: number, noise: number) => number
      // Total expected change over 30 days (for scaling)
      totalRange: number
    }

    const patterns: Pattern[] = [
      {
        name: 'rocket',
        // Accelerating growth — slow start, steep finish
        getDelta: (day, noise) => {
          const acceleration = (day / 29) ** 1.8
          return acceleration * 1.2 + noise * 0.4
        },
        totalRange: 25,
      },
      {
        name: 'decline',
        // Steady decline with occasional bounces
        getDelta: (day, noise) => {
          return -0.6 + noise * 0.5 + (day % 7 === 0 ? 1.5 : 0)
        },
        totalRange: -18,
      },
      {
        name: 'volatile',
        // Big swings both directions — exciting but unpredictable
        getDelta: (day, noise) => {
          const wave = Math.sin(day * 0.8) * 2.5
          return wave + noise * 1.8
        },
        totalRange: 5,
      },
      {
        name: 'breakout',
        // Flat for 20 days then sharp spike in last 10
        getDelta: (day, noise) => {
          if (day < 20) return noise * 0.3
          return 2.0 + noise * 0.5
        },
        totalRange: 20,
      },
      {
        name: 'plateau',
        // Rose quickly early, now leveling off
        getDelta: (day, noise) => {
          if (day < 12) return 1.5 + noise * 0.4
          return noise * 0.3
        },
        totalRange: 18,
      },
      {
        name: 'steady-climb',
        // Consistent upward trend with minor noise
        getDelta: (day, noise) => {
          return 0.5 + noise * 0.3
        },
        totalRange: 15,
      },
      {
        name: 'slow-fade',
        // Gradual decline — losing steam
        getDelta: (day, noise) => {
          const fade = -0.3 - (day / 29) * 0.4
          return fade + noise * 0.4
        },
        totalRange: -15,
      },
      {
        name: 'u-shape',
        // Dipped mid-month then recovered
        getDelta: (day, noise) => {
          if (day < 15) return -0.8 + noise * 0.3
          return 1.0 + noise * 0.3
        },
        totalRange: 3,
      },
      {
        name: 'hype-cycle',
        // Spiked early then settled back down
        getDelta: (day, noise) => {
          if (day < 8) return 2.0 + noise * 0.3
          if (day < 18) return -1.0 + noise * 0.3
          return noise * 0.2
        },
        totalRange: 6,
      },
    ]

    const DAYS = 30
    const rows: Array<Record<string, unknown>> = []
    const today = new Date(latestDate.score_date)

    for (const score of currentScores) {
      // Pick a pattern deterministically based on tech
      const patternIndex = Math.floor(seededRandom() * patterns.length)
      const pattern = patterns[patternIndex]

      // Current "today" values (day 29 = most recent)
      const todayComposite = Number(score.composite_score) || 50

      // Generate the 30-day forward series, then map to actual dates
      const compositeSeries: number[] = []

      // Start value: work backwards from today's score
      // If pattern.totalRange is +25, day-0 score should be ~25 lower
      let dayScore = clamp(todayComposite - pattern.totalRange, 5, 95)

      for (let day = 0; day < DAYS; day++) {
        const noise = (seededRandom() - 0.5) * 2 // ±1
        const delta = pattern.getDelta(day, noise)
        dayScore = clamp(dayScore + delta, 5, 95)
        compositeSeries.push(dayScore)
      }

      // Normalize: scale the series so the last value matches today's actual score
      const seriesLast = compositeSeries[DAYS - 1]
      const offset = todayComposite - seriesLast
      for (let i = 0; i < DAYS; i++) {
        compositeSeries[i] = clamp(compositeSeries[i] + offset, 5, 95)
      }

      // Generate sub-scores with correlated but independent variation
      const githubBase = Number(score.github_score) || 0
      const communityBase = Number(score.community_score) || 0
      const jobsBase = Number(score.jobs_score) || 0
      const ecosystemBase = Number(score.ecosystem_score) || 0

      for (let day = 0; day < DAYS; day++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (DAYS - 1 - day))
        const dateStr = date.toISOString().split('T')[0]

        // Sub-score variation: track composite ratio with some independence
        const ratio = compositeSeries[day] / todayComposite
        const subNoise = () => (seededRandom() - 0.5) * 6 // ±3 points

        const github = clamp(githubBase * ratio + subNoise(), 0, 100)
        const community = clamp(communityBase * ratio + subNoise() * 1.5, 0, 100)
        const jobs = clamp(jobsBase * ratio + subNoise() * 0.6, 0, 100)
        const ecosystem = clamp(ecosystemBase * ratio + subNoise() * 0.8, 0, 100)

        // Momentum: based on recent change direction
        let momentum = 0
        if (day >= 7) {
          const weekAgo = compositeSeries[day - 7]
          const now = compositeSeries[day]
          momentum = round2(((now - weekAgo) / Math.max(weekAgo, 1)) * 100)
          momentum = clamp(momentum, -30, 30)
        }

        rows.push({
          technology_id: score.technology_id,
          score_date: dateStr,
          composite_score: round2(compositeSeries[day]),
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
