/**
 * GET /api/ai/insights/[slug]
 *
 * Returns AI-generated insight for a single technology.
 * Cache-first: serves from ai_insights table if fresh.
 * Generates on-demand if cache miss or stale.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import {
  getInsightWithFreshness,
  computeDataHash,
  queueRegeneration,
} from '@/lib/ai/cache-strategy'
import { generateTechInsight } from '@/lib/ai/generators/tech-insight'
import type { TechInsight, TechInsightContext } from '@/lib/ai/generators/tech-insight'
import { checkInsightQuality } from '@/lib/ai/quality-monitor'
import { logTelemetry } from '@/lib/ai/telemetry'
import { checkRateLimit, rateLimitHeaders } from '@/lib/ai/rate-limiter'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createSupabaseAdminClient()

  // Rate limit check
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rlResult = await checkRateLimit('/api/ai/insights', ip, supabase)
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    )
  }

  // Find technology
  const { data: tech } = await supabase
    .from('technologies')
    .select('id, name, slug, category, description')
    .eq('slug', slug)
    .single()

  if (!tech) {
    return NextResponse.json(
      { error: 'Technology not found' },
      { status: 404 }
    )
  }

  // Build data hash for cache check
  const { data: latestScore } = await supabase
    .from('daily_scores')
    .select('composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, raw_sub_scores')
    .eq('technology_id', tech.id)
    .order('score_date', { ascending: false })
    .limit(1)
    .single()

  const dataHash = computeDataHash({
    score: latestScore?.composite_score,
    github: latestScore?.github_score,
    community: latestScore?.community_score,
    jobs: latestScore?.jobs_score,
    ecosystem: latestScore?.ecosystem_score,
  })

  // Check cache
  const startTime = Date.now()
  const cacheResult = await getInsightWithFreshness<TechInsight>(
    tech.id,
    'tech_single',
    supabase,
    dataHash
  )

  if (cacheResult.freshness === 'fresh' && cacheResult.data) {
    logTelemetry(
      {
        event: 'cache_hit',
        provider: 'cache',
        model: 'none',
        use_case: 'tech_insight',
        latency_ms: Date.now() - startTime,
        token_input: null,
        token_output: null,
        quality_score: null,
        error: null,
        metadata: { slug, freshness: 'fresh' },
      },
      supabase
    )

    return NextResponse.json(
      {
        insight: cacheResult.data,
        freshness: cacheResult.freshness,
        cached: true,
      },
      { headers: rateLimitHeaders(rlResult) }
    )
  }

  // Serve stale cache immediately but regenerate in background
  if (
    (cacheResult.freshness === 'stale' || cacheResult.freshness === 'expired') &&
    cacheResult.data
  ) {
    queueRegeneration(tech.id, 'tech_single', async () => {
      // Background regeneration — fire and forget
      try {
        const keyManager = createKeyManager()
        const context = await buildContext(tech, latestScore, supabase)
        const insight = await resilientAICall(
          'batch_insight',
          (provider) => generateTechInsight(context, provider, supabase),
          keyManager
        )
        await cacheInsight(tech.id, insight, dataHash, supabase)
      } catch (err) {
        console.error(`[Insight] Background regen failed for ${slug}:`, err)
      }
    })

    return NextResponse.json(
      {
        insight: cacheResult.data,
        freshness: cacheResult.freshness,
        cached: true,
        age: cacheResult.age ? Math.round(cacheResult.age) : null,
      },
      { headers: rateLimitHeaders(rlResult) }
    )
  }

  // Cache miss — generate on demand
  try {
    const keyManager = createKeyManager()
    const context = await buildContext(tech, latestScore, supabase)
    const insight = await resilientAICall(
      'batch_insight',
      (provider) => generateTechInsight(context, provider, supabase),
      keyManager
    )

    // Quality check
    const quality = checkInsightQuality(
      insight as unknown as Record<string, unknown>,
      JSON.stringify(context),
      context.confidence.grade
    )

    logTelemetry(
      {
        event: quality.passed ? 'generation' : 'quality_fail',
        provider: 'mixed',
        model: 'mixed',
        use_case: 'tech_insight',
        latency_ms: Date.now() - startTime,
        token_input: null,
        token_output: null,
        quality_score: quality.score,
        error: null,
        metadata: { slug, quality: quality.checks },
      },
      supabase
    )

    if (quality.passed) {
      await cacheInsight(tech.id, insight, dataHash, supabase)
    }

    return NextResponse.json(
      { insight, freshness: 'fresh', cached: false, quality: quality.score },
      { headers: rateLimitHeaders(rlResult) }
    )
  } catch (error) {
    logTelemetry(
      {
        event: 'error',
        provider: 'unknown',
        model: 'unknown',
        use_case: 'tech_insight',
        latency_ms: Date.now() - startTime,
        token_input: null,
        token_output: null,
        quality_score: null,
        error: (error as Error).message,
        metadata: { slug },
      },
      supabase
    )

    return NextResponse.json(
      { error: 'Failed to generate insight', insight: null },
      { status: 503 }
    )
  }
}

// ---- Helpers ----

async function buildContext(
  tech: { id: string; name: string; slug: string; category: string; description: string },
  latestScore: Record<string, unknown> | null,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<TechInsightContext> {
  // Fetch peers
  const { data: peers } = await supabase
    .from('daily_scores')
    .select('technology_id, composite_score, momentum')
    .eq(
      'score_date',
      new Date().toISOString().split('T')[0]
    )
    .order('composite_score', { ascending: false })

  const { data: techs } = await supabase
    .from('technologies')
    .select('id, name, category')
    .eq('category', tech.category)
    .eq('is_active', true)

  const techMap = new Map(techs?.map((t) => [t.id, t]) ?? [])
  const categoryPeers = (peers ?? [])
    .filter((p) => techMap.has(p.technology_id) && p.technology_id !== tech.id)
    .map((p) => ({
      name: techMap.get(p.technology_id)?.name ?? '',
      score: Number(p.composite_score),
      momentum: Number(p.momentum),
    }))

  const categoryTechs = (peers ?? []).filter((p) => techMap.has(p.technology_id))
  const rank = categoryTechs.findIndex((p) => p.technology_id === tech.id) + 1
  const total = categoryTechs.length
  const percentile = total > 0 ? Math.round(((total - rank) / total) * 100) : 50

  // Fetch momentum analysis
  const { data: momentumData } = await supabase
    .from('momentum_analysis')
    .select('*')
    .eq('technology_id', tech.id)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single()

  const rawSubScores = (latestScore?.raw_sub_scores ?? {}) as Record<string, unknown>
  const confidenceData = (rawSubScores.confidence ?? {}) as Record<string, unknown>

  return {
    name: tech.name,
    slug: tech.slug,
    category: tech.category,
    description: tech.description ?? '',
    compositeScore: Number(latestScore?.composite_score ?? 50),
    subScores: {
      github: latestScore?.github_score != null ? Number(latestScore.github_score) : null,
      community: latestScore?.community_score != null ? Number(latestScore.community_score) : null,
      jobs: latestScore?.jobs_score != null ? Number(latestScore.jobs_score) : null,
      ecosystem: latestScore?.ecosystem_score != null ? Number(latestScore.ecosystem_score) : null,
    },
    momentum: {
      shortTerm: Number(momentumData?.short_term ?? 0),
      mediumTerm: Number(momentumData?.medium_term ?? 0),
      longTerm: Number(momentumData?.long_term ?? 0),
      acceleration: Number(momentumData?.acceleration ?? 0),
      volatility: Number(momentumData?.volatility ?? 0),
      trend: (momentumData?.trend as 'stable') ?? 'stable',
      confidence: Number(momentumData?.confidence ?? 0),
      streak: Number(momentumData?.streak ?? 0),
    },
    confidence: {
      overall: Number(confidenceData.overall ?? 50),
      sourceCoverage: Number(confidenceData.sourceCoverage ?? 50),
      dataRecency: 100,
      historicalDepth: 50,
      signalAgreement: Number(confidenceData.signalAgreement ?? 50),
      grade: (confidenceData.grade as 'C') ?? 'C',
    },
    signals: {
      githubStars: null,
      githubForks: null,
      githubContributors: null,
      hnMentions: null,
      hnSentiment: null,
      hnTopStories: [],
      redditPosts: null,
      devtoArticles: null,
      jobPostings: { adzuna: null, jsearch: null, remotive: null },
      downloads: { weekly: null, trend: null },
      soQuestions: null,
    },
    categoryPeers,
    categoryRank: rank || 1,
    categoryTotal: total || 1,
    percentile,
    anomalies: [],
    relatedTechs: [],
    scoreHistory: [],
    allTimeHigh: Number(latestScore?.composite_score ?? 50),
    allTimeLow: Number(latestScore?.composite_score ?? 50),
  }
}

async function cacheInsight(
  technologyId: string,
  insight: TechInsight,
  dataHash: string,
  supabase: ReturnType<typeof createSupabaseAdminClient>
): Promise<void> {
  await supabase.from('ai_insights').upsert(
    {
      technology_id: technologyId,
      insight_type: 'tech_single',
      insight_data: insight,
      input_data_hash: dataHash,
      model_used: 'mixed',
      prompt_version: 1,
      quality_score: null,
      generated_at: new Date().toISOString(),
    },
    { onConflict: 'technology_id,insight_type' }
  )
}
