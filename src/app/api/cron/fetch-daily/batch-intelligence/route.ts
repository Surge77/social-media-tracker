/**
 * POST /api/cron/fetch-daily/batch-intelligence
 *
 * Runs after batch-scoring completes. Generates AI insights for techs
 * that had score changes > 5% or anomalies detected.
 *
 * Flow:
 * 1. Find techs with significant score changes
 * 2. Generate AI insights for those techs (batch, using Gemini)
 * 3. Cache results in ai_insights table
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createKeyManager } from '@/lib/ai/key-manager'
import { resilientAICall } from '@/lib/ai/resilient-call'
import { generateTechInsight } from '@/lib/ai/generators/tech-insight'
import type { TechInsightContext } from '@/lib/ai/generators/tech-insight'
import { checkInsightQuality } from '@/lib/ai/quality-monitor'
import { computeDataHash } from '@/lib/ai/cache-strategy'
import { logTelemetry } from '@/lib/ai/telemetry'
import { analyzeMomentum } from '@/lib/scoring/enhanced-momentum'
import { detectAnomalies } from '@/lib/detection/anomaly'
import { analyzeRelationships } from '@/lib/analysis/relationships'
import { generateAnomalyExplanation } from '@/lib/ai/generators/anomaly-explanation'
import type { DailyScore } from '@/types'

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const keyManager = createKeyManager()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split('T')[0]

  const errors: string[] = []
  let generated = 0

  // Find techs with significant score changes
  const { data: todayScores } = await supabase
    .from('daily_scores')
    .select('technology_id, composite_score, github_score, community_score, jobs_score, ecosystem_score, momentum, raw_sub_scores')
    .eq('score_date', today)

  const { data: yesterdayScores } = await supabase
    .from('daily_scores')
    .select('technology_id, composite_score')
    .eq('score_date', yesterday)

  if (!todayScores || todayScores.length === 0) {
    return NextResponse.json({
      message: 'No scores found for today',
      generated: 0,
      errors: [],
    })
  }

  const yesterdayMap = new Map(
    (yesterdayScores ?? []).map((s) => [
      s.technology_id,
      Number(s.composite_score),
    ])
  )

  // Fetch technology details
  const { data: techs } = await supabase
    .from('technologies')
    .select('id, name, slug, category, description, ecosystem')
    .eq('is_active', true)

  const techMap = new Map(techs?.map((t) => [t.id, t]) ?? [])

  // Filter to techs needing insight generation
  const needsInsight = todayScores.filter((score) => {
    const oldScore = yesterdayMap.get(score.technology_id)
    if (!oldScore) return true // New tech, no previous score
    const change = Math.abs(
      Number(score.composite_score) - oldScore
    )
    return change >= 2.5 // Generate for changes >= 2.5 points
  })

  console.log(
    `[BatchIntelligence] ${needsInsight.length} techs need insight generation`
  )

  // ========== PHASE 4: Enhanced Intelligence ===========

  // 1. Momentum Analysis for all techs
  console.log('[BatchIntelligence] Running momentum analysis...')
  let momentumAnalyzed = 0

  for (const score of todayScores) {
    const tech = techMap.get(score.technology_id)
    if (!tech) continue

    // Fetch 90-day history for this tech
    const { data: history } = await supabase
      .from('daily_scores')
      .select('score_date, composite_score')
      .eq('technology_id', score.technology_id)
      .gte('score_date', new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0])
      .order('score_date', { ascending: true })

    if (history && history.length >= 3) {
      const scores = history.map(h => ({
        date: h.score_date,
        score: Number(h.composite_score)
      }))

      const momentum = analyzeMomentum(scores)

      await supabase.from('momentum_analysis').upsert({
        technology_id: score.technology_id,
        analysis_date: today,
        short_term: momentum.shortTerm,
        medium_term: momentum.mediumTerm,
        long_term: momentum.longTerm,
        acceleration: momentum.acceleration,
        volatility: momentum.volatility,
        trend: momentum.trend,
        streak: momentum.streak,
        confidence: momentum.confidence
      }, {
        onConflict: 'technology_id,analysis_date'
      })

      momentumAnalyzed++
    }
  }

  console.log(`[BatchIntelligence] Analyzed momentum for ${momentumAnalyzed} techs`)

  // 2. Anomaly Detection for all techs
  console.log('[BatchIntelligence] Running anomaly detection...')
  let anomaliesDetected = 0
  const allAnomalies: Array<{
    techId: string
    techName: string
    anomaly: ReturnType<typeof detectAnomalies>[0]
  }> = []

  for (const score of todayScores) {
    const tech = techMap.get(score.technology_id)
    if (!tech) continue

    // Fetch 90-day history for anomaly detection
    const { data: history } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('technology_id', score.technology_id)
      .gte('score_date', new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0])
      .order('score_date', { ascending: true })

    if (history && history.length >= 7) {
      // Get momentum analysis for this tech
      const { data: momentumData } = await supabase
        .from('momentum_analysis')
        .select('*')
        .eq('technology_id', score.technology_id)
        .eq('analysis_date', today)
        .single()

      const signals = {
        githubScore: Number(score.github_score ?? 0),
        communityScore: Number(score.community_score ?? 0),
        jobsScore: Number(score.jobs_score ?? 0),
        ecosystemScore: Number(score.ecosystem_score ?? 0),
        momentum: Number(score.momentum ?? 0),
        shortTermMomentum: momentumData?.short_term ?? undefined,
        mediumTermMomentum: momentumData?.medium_term ?? undefined,
        longTermMomentum: momentumData?.long_term ?? undefined
      }

      const anomalies = detectAnomalies(
        score as DailyScore,
        history as DailyScore[],
        signals
      )

      for (const anomaly of anomalies) {
        await supabase.from('anomaly_events').insert({
          technology_id: score.technology_id,
          detected_at: new Date().toISOString(),
          anomaly_type: anomaly.type,
          severity: anomaly.severity,
          source: anomaly.source,
          metric: anomaly.metric,
          expected_value: anomaly.expectedValue,
          actual_value: anomaly.actualValue,
          deviation_sigma: anomaly.deviationSigma,
          related_headlines: anomaly.relatedHeadlines,
          ai_explanation: null,
          resolved: false
        })

        anomaliesDetected++
        allAnomalies.push({
          techId: score.technology_id,
          techName: tech.name,
          anomaly
        })
      }
    }
  }

  console.log(`[BatchIntelligence] Detected ${anomaliesDetected} anomalies`)

  // 3. Relationship Analysis (run once for all techs)
  console.log('[BatchIntelligence] Running relationship analysis...')

  const techList = Array.from(techMap.values())
  const signalsMap = new Map(
    todayScores.map(score => {
      const tech = techMap.get(score.technology_id)
      return [score.technology_id, {
        category: tech?.category ?? 'backend',
        compositeScore: Number(score.composite_score),
        hnMentions: undefined,
        githubStars: undefined,
        communityScore: Number(score.community_score ?? 0)
      }]
    })
  )

  const relationships = await analyzeRelationships(techList, signalsMap)

  if (relationships.length > 0) {
    await supabase.from('tech_relationships').upsert(
      relationships.map(rel => ({
        source_technology_id: rel.sourceTechnologyId,
        target_technology_id: rel.targetTechnologyId,
        relationship_type: rel.relationshipType,
        strength: rel.strength,
        co_occurrence_rate: rel.coOccurrenceRate,
        last_computed: new Date().toISOString()
      })),
      { onConflict: 'source_technology_id,target_technology_id,relationship_type' }
    )
  }

  console.log(`[BatchIntelligence] Analyzed ${relationships.length} relationships`)

  // 4. Generate Anomaly Explanations for top 5 anomalies (by severity)
  console.log('[BatchIntelligence] Generating anomaly explanations...')
  let anomalyExplanationsGenerated = 0

  const topAnomalies = allAnomalies
    .sort((a, b) => {
      const severityOrder = { critical: 4, significant: 3, notable: 2, info: 1 }
      return severityOrder[b.anomaly.severity] - severityOrder[a.anomaly.severity]
    })
    .slice(0, 5)

  for (const { techId, techName, anomaly } of topAnomalies) {
    try {
      // Fetch recent HN stories for context
      const { data: recentNews } = await supabase
        .from('data_points')
        .select('metadata')
        .eq('technology_id', techId)
        .eq('source', 'hackernews')
        .gte('measured_at', new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0])
        .limit(5)

      const headlines = (recentNews ?? [])
        .map(dp => (dp.metadata as { title?: string })?.title)
        .filter(Boolean) as string[]

      const explanation = await resilientAICall(
        'anomaly_explain',
        (provider) => generateAnomalyExplanation({
          technologyName: techName,
          anomalyType: anomaly.type,
          severity: anomaly.severity,
          metric: anomaly.metric,
          expectedValue: anomaly.expectedValue,
          actualValue: anomaly.actualValue,
          deviationSigma: anomaly.deviationSigma,
          recentNews: headlines,
          recentCommits: null,
          recentReleases: []
        }, provider),
        keyManager
      )

      // Update the anomaly with AI explanation
      await supabase
        .from('anomaly_events')
        .update({ ai_explanation: explanation.explanation })
        .eq('technology_id', techId)
        .eq('anomaly_type', anomaly.type)
        .eq('metric', anomaly.metric)
        .is('ai_explanation', null)
        .order('detected_at', { ascending: false })
        .limit(1)

      anomalyExplanationsGenerated++

      // Rate limit: wait 2s between explanations
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Failed to generate explanation for ${techName}:`, error)
    }
  }

  console.log(`[BatchIntelligence] Generated ${anomalyExplanationsGenerated} anomaly explanations`)

  // ========== End Phase 4 ===========

  // Generate insights (rate-limited: max 10 per cron run to stay within free tiers)
  const batch = needsInsight.slice(0, 10)

  for (const score of batch) {
    const tech = techMap.get(score.technology_id)
    if (!tech) continue

    const startTime = Date.now()

    try {
      // Build minimal context
      const rawSubScores = (score.raw_sub_scores ?? {}) as Record<string, unknown>
      const conf = (rawSubScores.confidence ?? {}) as Record<string, unknown>
      const momDetail = (rawSubScores.momentum_detail ?? {}) as Record<string, unknown>

      const context: TechInsightContext = {
        name: tech.name,
        slug: tech.slug,
        category: tech.category,
        description: tech.description ?? '',
        compositeScore: Number(score.composite_score),
        subScores: {
          github: score.github_score != null ? Number(score.github_score) : null,
          community: score.community_score != null ? Number(score.community_score) : null,
          jobs: score.jobs_score != null ? Number(score.jobs_score) : null,
          ecosystem: score.ecosystem_score != null ? Number(score.ecosystem_score) : null,
        },
        momentum: {
          shortTerm: Number(momDetail.shortTerm ?? 0),
          mediumTerm: Number(momDetail.mediumTerm ?? 0),
          longTerm: Number(momDetail.longTerm ?? 0),
          acceleration: Number(momDetail.acceleration ?? 0),
          volatility: Number(momDetail.volatility ?? 0),
          trend: (momDetail.trend as 'stable') ?? 'stable',
          confidence: 0.5,
          streak: Number(momDetail.streak ?? 0),
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
        allTimeHigh: Number(score.composite_score),
        allTimeLow: Number(score.composite_score),
      }

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

      if (quality.passed) {
        const dataHash = computeDataHash({
          score: score.composite_score,
          github: score.github_score,
          community: score.community_score,
          jobs: score.jobs_score,
          ecosystem: score.ecosystem_score,
        })

        await supabase.from('ai_insights').upsert(
          {
            technology_id: score.technology_id,
            insight_type: 'tech_single',
            insight_data: insight,
            input_data_hash: dataHash,
            model_used: 'mixed',
            prompt_version: 1,
            quality_score: quality.score,
            generated_at: new Date().toISOString(),
          },
          { onConflict: 'technology_id,insight_type' }
        )
        generated++
      }

      logTelemetry(
        {
          event: quality.passed ? 'generation' : 'quality_fail',
          provider: 'mixed',
          model: 'mixed',
          use_case: 'batch_insight',
          latency_ms: Date.now() - startTime,
          token_input: null,
          token_output: null,
          quality_score: quality.score,
          error: null,
          metadata: { slug: tech.slug },
        },
        supabase
      )

      // Rate limit: wait 2s between generations to stay within free tiers
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      errors.push(`${tech.slug}: ${(error as Error).message}`)
      logTelemetry(
        {
          event: 'error',
          provider: 'unknown',
          model: 'unknown',
          use_case: 'batch_insight',
          latency_ms: Date.now() - startTime,
          token_input: null,
          token_output: null,
          quality_score: null,
          error: (error as Error).message,
          metadata: { slug: tech.slug },
        },
        supabase
      )
    }
  }

  console.log(
    `[BatchIntelligence] Generated ${generated} insights, ${errors.length} errors`
  )

  return NextResponse.json({
    message: `Batch intelligence complete`,
    generated,
    total: needsInsight.length,
    errors,
  })
}
