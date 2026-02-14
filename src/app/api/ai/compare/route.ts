/**
 * GET /api/ai/compare?slugs=react,vue
 *
 * Returns AI-generated comparison insight.
 * Cache-first with sorted slug key (react+vue === vue+react).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import {
  comparisonCacheKey,
  computeDataHash,
  enforceComparisonCacheLimit,
} from '@/lib/ai/cache-strategy'
import { generateComparisonInsight } from '@/lib/ai/generators/comparison-insight'
import type { ComparisonInsight } from '@/lib/ai/generators/comparison-insight'
import { logTelemetry } from '@/lib/ai/telemetry'
import { checkRateLimit, rateLimitHeaders } from '@/lib/ai/rate-limiter'

export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get('slugs')
  if (!slugsParam) {
    return NextResponse.json(
      { error: 'Missing slugs parameter. Use ?slugs=react,vue' },
      { status: 400 }
    )
  }

  const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean)
  if (slugs.length < 2 || slugs.length > 4) {
    return NextResponse.json(
      { error: 'Provide 2-4 technology slugs separated by commas' },
      { status: 400 }
    )
  }

  const supabase = createSupabaseAdminClient()

  // Rate limit
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rlResult = await checkRateLimit('/api/ai/compare', ip, supabase)
  if (!rlResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    )
  }

  const cacheKey = comparisonCacheKey(slugs)
  const startTime = Date.now()

  // Check cache
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('insight_data, generated_at, input_data_hash')
    .eq('comparison_key', cacheKey)
    .eq('insight_type', 'comparison')
    .single()

  if (cached) {
    const ageHours =
      (Date.now() - new Date(cached.generated_at).getTime()) / 3_600_000

    if (ageHours < 24) {
      // Update LRU tracking (fire and forget)
      supabase
        .rpc('touch_comparison_cache', { p_key: cacheKey })
        .then(({ error: rpcErr }) => {
          if (rpcErr) console.error('[Cache] LRU touch failed:', rpcErr)
        })

      logTelemetry(
        {
          event: 'cache_hit',
          provider: 'cache',
          model: 'none',
          use_case: 'comparison',
          latency_ms: Date.now() - startTime,
          token_input: null,
          token_output: null,
          quality_score: null,
          error: null,
          metadata: { slugs, cacheKey },
        },
        supabase
      )

      return NextResponse.json(
        {
          comparison: cached.insight_data,
          cached: true,
          freshness: 'fresh',
        },
        { headers: rateLimitHeaders(rlResult) }
      )
    }
  }

  // Fetch technology data for each slug
  const { data: technologies } = await supabase
    .from('technologies')
    .select('id, name, slug, category, description')
    .in('slug', slugs)

  if (!technologies || technologies.length < 2) {
    return NextResponse.json(
      { error: 'One or more technologies not found' },
      { status: 404 }
    )
  }

  // Build minimal contexts for comparison
  const contexts = await Promise.all(
    technologies.map(async (tech) => {
      const { data: score } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('technology_id', tech.id)
        .order('score_date', { ascending: false })
        .limit(1)
        .single()

      const { data: momentumData } = await supabase
        .from('momentum_analysis')
        .select('*')
        .eq('technology_id', tech.id)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single()

      const rawSubScores = (score?.raw_sub_scores ?? {}) as Record<string, unknown>
      const conf = (rawSubScores.confidence ?? {}) as Record<string, unknown>

      return {
        name: tech.name,
        slug: tech.slug,
        category: tech.category,
        description: tech.description ?? '',
        compositeScore: Number(score?.composite_score ?? 50),
        subScores: {
          github: score?.github_score != null ? Number(score.github_score) : null,
          community: score?.community_score != null ? Number(score.community_score) : null,
          jobs: score?.jobs_score != null ? Number(score.jobs_score) : null,
          ecosystem: score?.ecosystem_score != null ? Number(score.ecosystem_score) : null,
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
          overall: Number(conf.overall ?? 50),
          sourceCoverage: Number(conf.sourceCoverage ?? 50),
          dataRecency: 100,
          historicalDepth: 50,
          signalAgreement: Number(conf.signalAgreement ?? 50),
          grade: (conf.grade as 'C') ?? 'C',
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
        categoryPeers: [],
        categoryRank: 1,
        categoryTotal: 1,
        percentile: 50,
        anomalies: [],
        relatedTechs: [],
        scoreHistory: [],
        allTimeHigh: Number(score?.composite_score ?? 50),
        allTimeLow: Number(score?.composite_score ?? 50),
      }
    })
  )

  // Generate comparison
  try {
    const keyManager = createKeyManager()
    const comparison = await resilientAICall<ComparisonInsight>(
      'comparison',
      (provider) => generateComparisonInsight(contexts, provider, supabase),
      keyManager
    )

    const dataHash = computeDataHash({
      slugs,
      scores: contexts.map((c) => c.compositeScore),
    })

    // Cache the comparison
    await supabase.from('ai_insights').upsert(
      {
        comparison_key: cacheKey,
        insight_type: 'comparison',
        insight_data: comparison,
        input_data_hash: dataHash,
        model_used: 'mixed',
        prompt_version: 1,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'comparison_key,insight_type' }
    )

    // Enforce cache limits (non-blocking)
    enforceComparisonCacheLimit(supabase).catch(console.error)

    logTelemetry(
      {
        event: 'generation',
        provider: 'mixed',
        model: 'mixed',
        use_case: 'comparison',
        latency_ms: Date.now() - startTime,
        token_input: null,
        token_output: null,
        quality_score: null,
        error: null,
        metadata: { slugs, cacheKey },
      },
      supabase
    )

    return NextResponse.json(
      { comparison, cached: false, freshness: 'fresh' },
      { headers: rateLimitHeaders(rlResult) }
    )
  } catch (error) {
    logTelemetry(
      {
        event: 'error',
        provider: 'unknown',
        model: 'unknown',
        use_case: 'comparison',
        latency_ms: Date.now() - startTime,
        token_input: null,
        token_output: null,
        quality_score: null,
        error: (error as Error).message,
        metadata: { slugs },
      },
      supabase
    )

    return NextResponse.json(
      { error: 'Failed to generate comparison', comparison: null },
      { status: 503 }
    )
  }
}
