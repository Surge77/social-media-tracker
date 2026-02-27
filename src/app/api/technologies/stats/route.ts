import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { CATEGORY_LABELS } from '@/types'
import type { TechnologyCategory } from '@/types'

type TrendLabel = 'Booming' | 'Growing' | 'Stable' | 'Mature' | 'Cooling'

interface MergedTech {
  technology_id: string
  slug: string
  name: string
  category: TechnologyCategory
  color: string
  composite_score: number
  jobs_score: number | null
  community_score: number | null
  github_score: number | null
  ecosystem_score: number | null
  momentum: number
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function trendLabel(avgMomentum: number): TrendLabel {
  if (avgMomentum > 8) return 'Booming'
  if (avgMomentum > 3) return 'Growing'
  if (avgMomentum > -3) return 'Stable'
  if (avgMomentum > -8) return 'Mature'
  return 'Cooling'
}

// Hardcoded popular stack combinations — scores resolved dynamically at runtime
const STACK_TEMPLATES = [
  { name: 'Full-Stack Web', emoji: '🎯', description: 'Modern web development', slugs: ['react', 'nodejs', 'typescript', 'postgresql'] },
  { name: 'AI/ML Engineering', emoji: '🤖', description: 'Machine learning & AI', slugs: ['python', 'pytorch', 'tensorflow', 'fastapi'] },
  { name: 'Mobile Development', emoji: '📱', description: 'Cross-platform mobile', slugs: ['react-native', 'typescript', 'firebase'] },
  { name: 'DevOps & Cloud', emoji: '☁️', description: 'Infrastructure & CI/CD', slugs: ['docker', 'kubernetes', 'terraform', 'aws'] },
  { name: 'Backend Heavy', emoji: '⚙️', description: 'Scalable services', slugs: ['go', 'postgresql', 'redis', 'docker'] },
]

/** Find the nearest available score_date that is <= the given target date string */
async function findNearestDate(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  targetDate: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('daily_scores')
    .select('score_date')
    .lte('score_date', targetDate)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()
  return data?.score_date ?? null
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient()

    // 1. Get the most recent scored date (for display)
    const { data: latestDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const lastUpdated = latestDateRow?.score_date ?? null
    if (!lastUpdated) {
      return Response.json({ error: 'No score data available yet' }, { status: 404 })
    }

    // 2. Use most recent complete date (non-null jobs_score) as the scoring date
    const { data: completeDateRow } = await supabase
      .from('daily_scores')
      .select('score_date')
      .not('jobs_score', 'is', null)
      .order('score_date', { ascending: false })
      .limit(1)
      .single()

    const scoringDate = completeDateRow?.score_date ?? lastUpdated

    // 3. Find nearest comparison date at least 7 days before scoringDate with complete data
    const targetPrevDate = new Date(scoringDate)
    targetPrevDate.setDate(targetPrevDate.getDate() - 7)
    const previousDate = await findNearestDate(supabase, targetPrevDate.toISOString().split('T')[0])

    // 4. Run all queries in parallel
    const [techResult, latestScoresResult, previousScoresResult, newTechsResult] = await Promise.all([
      supabase
        .from('technologies')
        .select('id, slug, name, category, color')
        .eq('is_active', true),
      supabase
        .from('daily_scores')
        .select('technology_id, composite_score, community_score, github_score, ecosystem_score, momentum, jobs_score')
        .eq('score_date', scoringDate),
      previousDate
        ? supabase
            .from('daily_scores')
            .select('technology_id, composite_score')
            .eq('score_date', previousDate)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from('technologies')
        .select('id')
        .eq('is_active', true)
        .gte('created_at', previousDate ?? scoringDate),
    ])

    if (techResult.error) throw new Error(techResult.error.message)
    const technologies = techResult.data ?? []

    // 5. Build lookup maps
    const scoreMap = new Map<string, { composite_score: number; jobs_score: number | null; community_score: number | null; github_score: number | null; ecosystem_score: number | null; momentum: number }>()
    for (const s of (latestScoresResult.data ?? [])) {
      scoreMap.set(s.technology_id, {
        composite_score: Number(s.composite_score ?? 0),
        jobs_score: s.jobs_score != null ? Number(s.jobs_score) : null,
        community_score: s.community_score != null ? Number(s.community_score) : null,
        github_score: s.github_score != null ? Number(s.github_score) : null,
        ecosystem_score: s.ecosystem_score != null ? Number(s.ecosystem_score) : null,
        momentum: Number(s.momentum ?? 0),
      })
    }

    const prevScoreMap = new Map<string, number>()
    for (const s of (previousScoresResult.data ?? [])) {
      prevScoreMap.set(s.technology_id, Number(s.composite_score ?? 0))
    }

    // 6. Merge technologies with scores
    const merged: MergedTech[] = technologies
      .map((tech) => {
        const scores = scoreMap.get(tech.id)
        if (!scores) return null
        return {
          technology_id: tech.id,
          slug: tech.slug as string,
          name: tech.name as string,
          category: tech.category as TechnologyCategory,
          color: tech.color as string,
          composite_score: scores.composite_score,
          jobs_score: scores.jobs_score,
          community_score: scores.community_score,
          github_score: scores.github_score,
          ecosystem_score: scores.ecosystem_score,
          momentum: scores.momentum,
        }
      })
      .filter((t): t is MergedTech => t !== null)

    if (merged.length === 0) {
      return Response.json({ error: 'No scored technologies found' }, { status: 404 })
    }

    // 7. Compute score deltas — if no previous date found, deltas default to 0
    const withDelta = merged.map((t) => ({
      ...t,
      score_delta: prevScoreMap.size > 0
        ? t.composite_score - (prevScoreMap.get(t.technology_id) ?? t.composite_score)
        : 0,
    }))

    // 8. Market Pulse
    const sortedByDelta = [...withDelta].sort((a, b) => b.score_delta - a.score_delta)
    const sortedByMomentum = [...merged].sort((a, b) => b.momentum - a.momentum)

    // Use delta-based hottest/cooling when prev data exists, otherwise fall back to momentum
    const hasPrevData = prevScoreMap.size > 0
    const hottestEntry = hasPrevData ? sortedByDelta[0] : sortedByMomentum[0]
    const coolingEntry = hasPrevData
      ? (sortedByDelta[sortedByDelta.length - 1]?.score_delta < 0 ? sortedByDelta[sortedByDelta.length - 1] : null)
      : sortedByMomentum[sortedByMomentum.length - 1]

    const hottestDelta = hottestEntry
      ? Math.round((hasPrevData ? (withDelta.find(t => t.technology_id === hottestEntry.technology_id)?.score_delta ?? 0) : hottestEntry.momentum) * 10) / 10
      : 0
    const coolingDelta = coolingEntry
      ? Math.round((hasPrevData ? (withDelta.find(t => t.technology_id === coolingEntry.technology_id)?.score_delta ?? 0) : coolingEntry.momentum) * 10) / 10
      : 0

    const mostDemanded = [...merged]
      .filter((t) => t.jobs_score !== null)
      .sort((a, b) => (b.jobs_score ?? 0) - (a.jobs_score ?? 0))[0] ?? null

    const hiddenGem = merged
      .filter((t) => (t.jobs_score ?? 0) > 40 && (t.community_score ?? 0) < 55)
      .sort((a, b) => ((b.jobs_score ?? 0) - (b.community_score ?? 0)) - ((a.jobs_score ?? 0) - (a.community_score ?? 0)))[0] ?? null

    const trending = sortedByMomentum.slice(0, 3)

    const safestBet = merged
      .filter((t) => Math.abs(t.momentum) < 5)
      .sort((a, b) => b.composite_score - a.composite_score)[0]

    const market_pulse = {
      hottest: hottestEntry
        ? { name: hottestEntry.name, slug: hottestEntry.slug, color: hottestEntry.color, score_delta: hottestDelta }
        : null,
      most_demanded: mostDemanded
        ? { name: mostDemanded.name, slug: mostDemanded.slug, color: mostDemanded.color, jobs_score: Math.round(mostDemanded.jobs_score!) }
        : null,
      cooling: coolingEntry
        ? { name: coolingEntry.name, slug: coolingEntry.slug, color: coolingEntry.color, score_delta: coolingDelta }
        : null,
      hidden_gem: hiddenGem
        ? { name: hiddenGem.name, slug: hiddenGem.slug, color: hiddenGem.color }
        : null,
      trending: trending.map((t) => ({ name: t.name, slug: t.slug, color: t.color })),
      safest_bet: safestBet
        ? { name: safestBet.name, slug: safestBet.slug, color: safestBet.color }
        : null,
    }

    // 9. Category Health
    const categoryGroups = new Map<TechnologyCategory, MergedTech[]>()
    for (const tech of merged) {
      if (!categoryGroups.has(tech.category)) categoryGroups.set(tech.category, [])
      categoryGroups.get(tech.category)!.push(tech)
    }

    const category_health = Array.from(categoryGroups.entries()).map(([cat, techs]) => {
      const avgScore = Math.round(mean(techs.map((t) => t.composite_score ?? 0)) * 10) / 10
      const avgMomentum = Math.round(mean(techs.map((t) => t.momentum ?? 0)) * 10) / 10
      const bestTech = [...techs].sort((a, b) => b.composite_score - a.composite_score)[0]
      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        count: techs.length,
        avg_score: avgScore,
        avg_momentum: avgMomentum,
        trend_label: trendLabel(avgMomentum),
        best_tech: { name: bestTech.name, slug: bestTech.slug, score: Math.round(bestTech.composite_score) },
      }
    }).sort((a, b) => b.avg_score - a.avg_score)

    // 10. Score Distribution (10 buckets: 0-10, 10-20, ..., 90-100)
    const score_distribution = Array.from({ length: 10 }, (_, i) => ({
      bucket: `${i * 10}–${(i + 1) * 10}`,
      count: merged.filter((t) =>
        t.composite_score >= i * 10 && t.composite_score < (i + 1) * 10
      ).length,
    }))
    // Edge case: score exactly 100 goes in the last bucket
    if (merged.some((t) => t.composite_score === 100)) {
      score_distribution[9].count += merged.filter((t) => t.composite_score === 100).length
    }

    // 11. Weekly Digest
    const highlights: string[] = []

    if (prevScoreMap.size > 0) {
      // Rank overtakes
      const sortedCurrent = [...merged].sort((a, b) => b.composite_score - a.composite_score)
      const sortedPrev = [...merged].sort((a, b) =>
        (prevScoreMap.get(b.technology_id) ?? 0) - (prevScoreMap.get(a.technology_id) ?? 0)
      )
      for (let i = 0; i < Math.min(10, sortedCurrent.length - 1); i++) {
        const prevRankA = sortedPrev.findIndex((t) => t.technology_id === sortedCurrent[i].technology_id)
        const prevRankB = sortedPrev.findIndex((t) => t.technology_id === sortedCurrent[i + 1].technology_id)
        if (prevRankA > prevRankB && prevRankA >= 0 && prevRankB >= 0) {
          highlights.push(`${sortedCurrent[i].name} overtook ${sortedCurrent[i + 1].name} in overall score`)
          break
        }
      }

      // Biggest weekly mover
      const biggestGainer = sortedByDelta[0]
      const biggestLoser = sortedByDelta[sortedByDelta.length - 1]
      if (biggestGainer?.score_delta > 5) {
        highlights.push(`${biggestGainer.name} had the biggest gain this week (+${biggestGainer.score_delta.toFixed(1)} pts)`)
      }
      if (biggestLoser?.score_delta < -5) {
        highlights.push(`${biggestLoser.name} had the sharpest decline this week (${biggestLoser.score_delta.toFixed(1)} pts)`)
      }

      // Significant changes count
      const sigChanges = withDelta.filter((t) => Math.abs(t.score_delta) >= 5).length
      if (sigChanges > 0) {
        highlights.push(`${sigChanges} ${sigChanges === 1 ? 'technology' : 'technologies'} saw significant score changes this week`)
      }
    }

    // Hottest category (always available)
    const hottestCategory = [...category_health].sort((a, b) => b.avg_momentum - a.avg_momentum)[0]
    if (hottestCategory?.avg_momentum > 3) {
      highlights.push(`${hottestCategory.label} is the fastest-growing category (avg momentum +${hottestCategory.avg_momentum})`)
    }

    // Top scorer (always available as a fallback highlight)
    const topScorer = [...merged].sort((a, b) => b.composite_score - a.composite_score)[0]
    if (topScorer && highlights.length < 2) {
      highlights.push(`${topScorer.name} leads all technologies with a score of ${Math.round(topScorer.composite_score)}`)
    }

    // Period label
    const endDate = new Date(lastUpdated)
    const startDate = new Date(lastUpdated)
    startDate.setDate(startDate.getDate() - 6)
    const periodLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    const weekly_digest = {
      highlights: highlights.slice(0, 5),
      period: periodLabel,
      new_techs_added: newTechsResult.data?.length ?? 0,
    }

    // 12. Popular Stacks (dynamic scores)
    const slugToTech = new Map(merged.map((t) => [t.slug, t]))

    const popular_stacks = STACK_TEMPLATES.map((stack) => {
      const techs = stack.slugs
        .map((slug) => slugToTech.get(slug))
        .filter((t): t is MergedTech => t != null)
      if (techs.length < 2) return null
      const avgScore = Math.round(mean(techs.map((t) => t.composite_score)))
      return {
        name: stack.name,
        emoji: stack.emoji,
        description: stack.description,
        technologies: techs.map((t) => ({
          name: t.name,
          slug: t.slug,
          color: t.color,
          score: Math.round(t.composite_score),
        })),
        avg_score: avgScore,
      }
    }).filter((s): s is NonNullable<typeof s> => s !== null)

    return Response.json(
      {
        market_pulse,
        category_health,
        score_distribution,
        weekly_digest,
        popular_stacks,
        last_updated: lastUpdated,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}
