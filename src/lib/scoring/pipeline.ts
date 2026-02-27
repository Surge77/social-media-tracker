import type { SupabaseClient } from '@supabase/supabase-js'
import type { TechnologyCategory } from '@/types'
import { percentileRankNormalize } from '@/lib/scoring/normalize'
import {
  computeGitHubScore,
  computeCommunityScore,
  computeJobsScore,
  computeEcosystemScore,
  computeCompositeScore,
} from '@/lib/scoring/composite'
import { bayesianSmooth } from '@/lib/scoring/bayesian'
import { getAdaptiveWeights } from '@/lib/scoring/adaptive-weights'
import { analyzeMomentum, computeLegacyMomentum } from '@/lib/scoring/enhanced-momentum'
import { computeConfidence } from '@/lib/scoring/confidence'
import { classifyLifecycle } from '@/lib/analysis/lifecycle'

interface TechDataPoints {
  technologyId: string
  // GitHub metrics
  stars: number | null
  forks: number | null
  openIssues: number | null
  // GitHub Stats (Source 1)
  activeContributors: number | null
  commitVelocity: number | null
  closedIssues: number | null
  // Community metrics
  hnMentions: number | null
  hnSentiment: number | null
  redditPosts: number | null
  redditSentiment: number | null
  devtoArticles: number | null
  rssMentions: number | null
  // Jobs metrics
  adzunaJobs: number | null
  jsearchJobs: number | null
  remotiveJobs: number | null
  // Ecosystem metrics
  downloads: number | null
  soQuestions: number | null
  soMentions: number | null
  // Libraries.io (Source 2)
  dependentsCount: number | null
  dependentRepos: number | null
  sourcerank: number | null
  // npms.io (Source 5)
  npmsQuality: number | null
  npmsPopularity: number | null
  npmsMaintenance: number | null
}

interface ScoredTechnology {
  technology_id: string
  score_date: string
  composite_score: number
  github_score: number | null
  community_score: number | null
  jobs_score: number | null
  ecosystem_score: number | null
  momentum: number
  data_completeness: number
  raw_sub_scores: Record<string, unknown>
  computed_at: string
}

/**
 * Run the full scoring pipeline for a given date.
 *
 * 1. Query today's data_points for all technologies
 * 2. Z-score normalize each metric across all technologies
 * 3. Compute sub-scores for each technology
 * 4. Compute composite score with weight redistribution
 * 5. Apply Bayesian smoothing for low-data technologies
 * 6. Compute momentum (today vs 30 days ago)
 * 7. Upsert into daily_scores
 */
export async function runScoringPipeline(
  supabase: SupabaseClient,
  date: string // YYYY-MM-DD
): Promise<{ scored: number; errors: string[] }> {
  const errors: string[] = []

  // Step 1: Fetch all active technologies (with category for adaptive weights)
  const { data: technologies, error: techError } = await supabase
    .from('technologies')
    .select('id, category, created_at')
    .eq('is_active', true)

  if (techError || !technologies) {
    throw new Error(`Failed to fetch technologies: ${techError?.message}`)
  }

  const techIds = technologies.map((t) => t.id as string)
  const techCategoryMap = new Map<string, TechnologyCategory>()
  const techCreatedMap = new Map<string, string>()
  for (const t of technologies) {
    techCategoryMap.set(t.id as string, t.category as TechnologyCategory)
    techCreatedMap.set(t.id as string, t.created_at as string)
  }

  // Step 2: Fetch today's data_points for all technologies
  const { data: dataPoints, error: dpError } = await supabase
    .from('data_points')
    .select('technology_id, source, metric, value')
    .eq('measured_at', date)
    .in('technology_id', techIds)

  if (dpError) {
    throw new Error(`Failed to fetch data_points: ${dpError.message}`)
  }

  if (!dataPoints || dataPoints.length === 0) {
    return { scored: 0, errors: ['No data points found for today'] }
  }

  console.log(`[Scoring] Found ${dataPoints.length} data points for ${date}`)

  // Step 2b: Supplement with latest job data from data_points_latest
  // Jobs are fetched weekly, so on most days there are no job data_points for today.
  // We pull the latest job data to ensure jobs_score is always computed.
  const todayHasJobs = dataPoints.some(
    (dp) => dp.metric === 'job_postings'
  )
  if (!todayHasJobs) {
    const { data: latestJobPoints } = await supabase
      .from('data_points_latest')
      .select('technology_id, source, metric, value')
      .eq('metric', 'job_postings')
      .in('technology_id', techIds)

    if (latestJobPoints && latestJobPoints.length > 0) {
      console.log(`[Scoring] Supplemented with ${latestJobPoints.length} latest job data points`)
      dataPoints.push(...latestJobPoints)
    }
  }

  // Step 3: Group data points by technology
  const techData = new Map<string, TechDataPoints>()

  for (const techId of techIds) {
    techData.set(techId, {
      technologyId: techId,
      stars: null,
      forks: null,
      openIssues: null,
      activeContributors: null,
      commitVelocity: null,
      closedIssues: null,
      hnMentions: null,
      hnSentiment: null,
      redditPosts: null,
      redditSentiment: null,
      devtoArticles: null,
      rssMentions: null,
      adzunaJobs: null,
      jsearchJobs: null,
      remotiveJobs: null,
      downloads: null,
      soQuestions: null,
      soMentions: null,
      dependentsCount: null,
      dependentRepos: null,
      sourcerank: null,
      npmsQuality: null,
      npmsPopularity: null,
      npmsMaintenance: null,
    })
  }

  for (const dp of dataPoints) {
    const tech = techData.get(dp.technology_id)
    if (!tech) continue

    const value = Number(dp.value)

    switch (`${dp.source}:${dp.metric}`) {
      case 'github:stars':
        tech.stars = value
        break
      case 'github:forks':
        tech.forks = value
        break
      case 'github:open_issues':
        tech.openIssues = value
        break
      case 'hackernews:mentions':
        tech.hnMentions = value
        break
      case 'hackernews:sentiment':
        tech.hnSentiment = value
        break
      case 'reddit:posts':
        tech.redditPosts = value
        break
      case 'reddit:sentiment':
        tech.redditSentiment = value
        break
      case 'devto:articles':
        tech.devtoArticles = value
        break
      case 'rss:mentions':
        tech.rssMentions = value
        break
      case 'adzuna:job_postings':
        tech.adzunaJobs = value
        break
      case 'jsearch:job_postings':
        tech.jsearchJobs = value
        break
      case 'remotive:job_postings':
        tech.remotiveJobs = value
        break
      case 'npm:downloads':
      case 'pypi:downloads':
      case 'crates:downloads':
      case 'packagist:downloads':
      case 'rubygems:downloads':
      case 'nuget:downloads':
        // Accumulate downloads from all available package registries
        tech.downloads = (tech.downloads ?? 0) + value
        break
      case 'stackoverflow:questions':
        tech.soQuestions = value
        break
      case 'stackoverflow:mentions':
        tech.soMentions = value
        break
      // GitHub Stats (Source 1)
      case 'github:active_contributors':
        tech.activeContributors = value
        break
      case 'github:commit_velocity':
        tech.commitVelocity = value
        break
      case 'github:closed_issues':
        tech.closedIssues = value
        break
      // Libraries.io (Source 2)
      case 'librariesio:dependents_count':
        tech.dependentsCount = value
        break
      case 'librariesio:dependent_repos_count':
        tech.dependentRepos = value
        break
      case 'librariesio:sourcerank':
        tech.sourcerank = value
        break
      // npms.io (Source 5)
      case 'npms:quality_score':
        tech.npmsQuality = value
        break
      case 'npms:popularity_score':
        tech.npmsPopularity = value
        break
      case 'npms:maintenance_score':
        tech.npmsMaintenance = value
        break
    }
  }

  // Step 3b: Fetch downloads from 7 days ago for weekly growth rate (Source 3)
  const sevenDaysAgo = new Date(date)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  const { data: priorDownloadsData } = await supabase
    .from('data_points')
    .select('technology_id, value')
    .eq('measured_at', sevenDaysAgoStr)
    .eq('metric', 'downloads')
    .in('technology_id', techIds)

  const priorDownloadMap = new Map<string, number>()
  if (priorDownloadsData) {
    for (const dp of priorDownloadsData) {
      priorDownloadMap.set(
        dp.technology_id,
        (priorDownloadMap.get(dp.technology_id) ?? 0) + Number(dp.value)
      )
    }
  }

  // Step 4: Collect metric arrays for z-scoring across all techs
  const allTechs = Array.from(techData.values())

  const starsArr = allTechs.map((t) => t.stars ?? 0)
  const forksArr = allTechs.map((t) => t.forks ?? 0)
  const contributorsArr = allTechs.map((t) => t.activeContributors ?? 0)
  const hnArr = allTechs.map((t) => t.hnMentions ?? 0)
  const redditArr = allTechs.map((t) => t.redditPosts ?? 0)
  const devtoArr = allTechs.map((t) => t.devtoArticles ?? 0)
  const rssArr = allTechs.map((t) => t.rssMentions ?? 0)
  const adzunaArr = allTechs.map((t) => t.adzunaJobs ?? 0)
  const jsearchArr = allTechs.map((t) => t.jsearchJobs ?? 0)
  const remotiveArr = allTechs.map((t) => t.remotiveJobs ?? 0)
  const downloadsArr = allTechs.map((t) => t.downloads ?? 0)
  const soArr = allTechs.map((t) => t.soQuestions ?? 0)
  const soMentionsArr = allTechs.map((t) => t.soMentions ?? 0)
  const dependentsArr = allTechs.map((t) => t.dependentsCount ?? 0)

  const starsPct = percentileRankNormalize(starsArr)
  const forksPct = percentileRankNormalize(forksArr)
  const contributorsPct = percentileRankNormalize(contributorsArr)
  const hnPct = percentileRankNormalize(hnArr)
  const redditPct = percentileRankNormalize(redditArr)
  const devtoPct = percentileRankNormalize(devtoArr)
  const rssPct = percentileRankNormalize(rssArr)
  const adzunaPct = percentileRankNormalize(adzunaArr)
  const jsearchPct = percentileRankNormalize(jsearchArr)
  const remotivePct = percentileRankNormalize(remotiveArr)
  const downloadsPct = percentileRankNormalize(downloadsArr)
  const soPct = percentileRankNormalize(soArr)
  const soMentionsPct = percentileRankNormalize(soMentionsArr)
  const dependentsPct = percentileRankNormalize(dependentsArr)

  // Step 5: Fetch historical scores for enhanced momentum (up to 90 days)
  const date90DaysAgo = new Date(date)
  date90DaysAgo.setDate(date90DaysAgo.getDate() - 90)
  const date90Str = date90DaysAgo.toISOString().split('T')[0]

  const { data: historicalScores } = await supabase
    .from('daily_scores')
    .select('technology_id, score_date, composite_score')
    .gte('score_date', date90Str)
    .lt('score_date', date)
    .in('technology_id', techIds)
    .order('score_date', { ascending: true })

  // Group historical scores by technology
  const historyMap = new Map<string, Array<{ date: string; score: number }>>()
  if (historicalScores) {
    for (const s of historicalScores) {
      const techId = s.technology_id as string
      if (!historyMap.has(techId)) historyMap.set(techId, [])
      historyMap.get(techId)!.push({
        date: s.score_date as string,
        score: Number(s.composite_score),
      })
    }
  }

  // Step 6: Compute sub-scores and composite for each technology

  // Pre-build dpCount and sourceSet maps to avoid O(n²) filters inside the loop (OPT-01, OPT-02)
  const dpCountMap = new Map<string, number>()
  const sourceMap = new Map<string, Set<string>>()
  for (const dp of dataPoints) {
    dpCountMap.set(dp.technology_id, (dpCountMap.get(dp.technology_id) ?? 0) + 1)
    if (!sourceMap.has(dp.technology_id)) sourceMap.set(dp.technology_id, new Set())
    sourceMap.get(dp.technology_id)!.add(dp.source)
  }

  const scoredRows: ScoredTechnology[] = []
  const rawComposites: number[] = []
  const dataPointCounts: number[] = []

  for (let i = 0; i < allTechs.length; i++) {
    const tech = allTechs[i]

    // GitHub score — null if no GitHub data at all
    let githubScore: number | null = null
    if (tech.stars !== null || tech.forks !== null) {
      // Real issueCloseRate: closed / (closed + open). Falls back to 0 if not yet fetched.
      const closedIssues = tech.closedIssues ?? null
      const openIssues = tech.openIssues ?? null
      const issueCloseRate =
        closedIssues !== null && openIssues !== null && (closedIssues + openIssues) > 0
          ? closedIssues / (closedIssues + openIssues)
          : openIssues === 0 ? 1.0 : 0
      githubScore = computeGitHubScore(starsPct[i], forksPct[i], issueCloseRate, contributorsPct[i])
    }

    // Community score — null if no community data
    let communityScore: number | null = null
    if (
      tech.hnMentions !== null ||
      tech.redditPosts !== null ||
      tech.devtoArticles !== null ||
      tech.rssMentions !== null
    ) {
      communityScore = computeCommunityScore(
        hnPct[i],
        tech.hnSentiment ?? 0.5,
        redditPct[i],
        devtoPct[i],
        tech.redditSentiment ?? 0.5,
        rssPct[i]
      )
    }

    // Jobs score — null if no job data
    // Each source is now stored separately, so z-score arrays are independent.
    let jobsScore: number | null = null
    if (tech.adzunaJobs !== null || tech.jsearchJobs !== null || tech.remotiveJobs !== null) {
      jobsScore = computeJobsScore(adzunaPct[i], jsearchPct[i], remotivePct[i])
    }

    // Ecosystem score — null if no download/SO/dependents data
    let ecosystemScore: number | null = null
    if (
      tech.downloads !== null ||
      tech.soQuestions !== null ||
      tech.soMentions !== null ||
      tech.dependentsCount !== null
    ) {
      // Source 3: compute real download growth rate (week-over-week)
      let downloadGrowthRate = 0
      const todayDl = tech.downloads
      const priorDl = priorDownloadMap.get(tech.technologyId)
      if (todayDl !== null && priorDl && priorDl > 0) {
        downloadGrowthRate = (todayDl - priorDl) / priorDl
        // Clamp to reasonable range (-50% to +100% weekly)
        downloadGrowthRate = Math.max(-0.5, Math.min(1.0, downloadGrowthRate))
      }

      ecosystemScore = computeEcosystemScore(
        downloadsPct[i],
        downloadGrowthRate,
        soPct[i],
        soMentionsPct[i],
        dependentsPct[i]
      )

      // Source 5: optional maintenance penalty for abandoned npm packages
      if (tech.npmsMaintenance !== null && tech.npmsMaintenance < 0.3) {
        ecosystemScore = Math.round(ecosystemScore * 0.85 * 100) / 100
      }
    }

    // Compute adaptive weights based on category and maturity
    const category = techCategoryMap.get(tech.technologyId) ?? 'language'
    const createdAt = techCreatedMap.get(tech.technologyId)
    const dataAgeDays = createdAt
      ? Math.floor((new Date(date).getTime() - new Date(createdAt).getTime()) / 86400000)
      : 365

    // Count how many data points this tech has today (O(1) via pre-built map)
    const dpCount = dpCountMap.get(tech.technologyId) ?? 0
    const dpCompleteness = dpCount / 12 // 12 is max possible metrics

    const adaptiveWeights = getAdaptiveWeights(category, dataAgeDays, dpCompleteness)

    const { composite, completeness } = computeCompositeScore(
      {
        github: githubScore,
        community: communityScore,
        jobs: jobsScore,
        ecosystem: ecosystemScore,
      },
      adaptiveWeights,
      category
    )

    rawComposites.push(composite)
    dataPointCounts.push(dpCount)

    scoredRows.push({
      technology_id: tech.technologyId,
      score_date: date,
      composite_score: composite,
      github_score: githubScore,
      community_score: communityScore,
      jobs_score: jobsScore,
      ecosystem_score: ecosystemScore,
      momentum: 0, // computed after Bayesian smoothing
      data_completeness: completeness,
      raw_sub_scores: {
        github: githubScore,
        community: communityScore,
        jobs: jobsScore,
        ecosystem: ecosystemScore,
        // Libraries.io signals (Source 2)
        librariesio: tech.sourcerank !== null || tech.dependentsCount !== null
          ? {
            sourcerank: tech.sourcerank ?? null,
            dependents_count: tech.dependentsCount ?? null,
            latest_release_age_days: null, // populated from librariesio API metadata
          }
          : undefined,
        // npms.io signals (Source 5)
        npms: tech.npmsQuality !== null || tech.npmsMaintenance !== null
          ? {
            quality: tech.npmsQuality ?? null,
            popularity: tech.npmsPopularity ?? null,
            maintenance: tech.npmsMaintenance ?? null,
          }
          : undefined,
      },
      computed_at: new Date().toISOString(),
    })
  }

  // Step 7: Bayesian smoothing
  const globalMean =
    rawComposites.length > 0
      ? rawComposites.reduce((a, b) => a + b, 0) / rawComposites.length
      : 50

  for (let i = 0; i < scoredRows.length; i++) {
    const row = scoredRows[i]
    const dpCount = dataPointCounts[i]
    row.composite_score = Math.round(bayesianSmooth(row.composite_score, dpCount, globalMean) * 100) / 100
  }

  // Step 8: Enhanced momentum + confidence scoring
  const momentumRows: Array<Record<string, unknown>> = []

  for (const row of scoredRows) {
    // Build score history for this tech (historical + today's score)
    const history = historyMap.get(row.technology_id) ?? []
    history.push({ date, score: row.composite_score })

    // Enhanced momentum analysis
    const momentum = analyzeMomentum(history)
    row.momentum = computeLegacyMomentum(momentum)

    // Confidence scoring
    const category = techCategoryMap.get(row.technology_id) ?? 'language'
    const activeSources = sourceMap.get(row.technology_id)?.size ?? 0
    const latestDpAge = 0 // Today's data is 0 hours old
    const historyDays = history.length

    const confidence = computeConfidence(
      category,
      activeSources,
      latestDpAge,
      historyDays,
      {
        github: row.github_score,
        community: row.community_score,
        jobs: row.jobs_score,
        ecosystem: row.ecosystem_score,
      }
    )

    // Lifecycle classification
    const recentScores = history.slice(-30).map((h) => h.score)
    const createdAt = techCreatedMap.get(row.technology_id)
    const dataAgeDays = createdAt
      ? Math.floor((new Date(date).getTime() - new Date(createdAt).getTime()) / 86400000)
      : 365

    const lifecycle = classifyLifecycle({
      compositeScore: row.composite_score,
      momentum,
      confidence,
      dataAgeDays,
      category,
      recentScores,
    })

    // Store enhanced momentum + confidence + lifecycle in raw_sub_scores
    row.raw_sub_scores = {
      ...row.raw_sub_scores,
      momentum_detail: {
        shortTerm: momentum.shortTerm,
        mediumTerm: momentum.mediumTerm,
        longTerm: momentum.longTerm,
        trend: momentum.trend,
        acceleration: momentum.acceleration,
        volatility: momentum.volatility,
        streak: momentum.streak,
      },
      confidence: {
        overall: confidence.overall,
        grade: confidence.grade,
        sourceCoverage: confidence.sourceCoverage,
        signalAgreement: confidence.signalAgreement,
      },
      lifecycle: {
        stage: lifecycle.stage,
        confidence: lifecycle.confidence,
        reasoning: lifecycle.reasoning,
        daysInStage: lifecycle.daysInStage,
        transitionProbability: lifecycle.stageTransitionProbability,
      },
    }

    // Prepare momentum_analysis row for upsert
    momentumRows.push({
      technology_id: row.technology_id,
      analysis_date: date,
      short_term: momentum.shortTerm,
      medium_term: momentum.mediumTerm,
      long_term: momentum.longTerm,
      acceleration: momentum.acceleration,
      volatility: momentum.volatility,
      trend: momentum.trend,
      confidence: momentum.confidence,
      streak: momentum.streak,
    })
  }

  // Step 9: Upsert into daily_scores + momentum_analysis
  const BATCH_SIZE = 500
  let upsertedTotal = 0

  for (let i = 0; i < scoredRows.length; i += BATCH_SIZE) {
    const batch = scoredRows.slice(i, i + BATCH_SIZE)
    const { error: upsertError } = await supabase
      .from('daily_scores')
      .upsert(batch, { onConflict: 'technology_id,score_date' })

    if (upsertError) {
      errors.push(`Upsert batch ${Math.floor(i / BATCH_SIZE) + 1}: ${upsertError.message}`)
    } else {
      upsertedTotal += batch.length
    }
  }

  console.log(`[Scoring] Upserted ${upsertedTotal} daily scores`)

  // Upsert momentum_analysis rows
  for (let i = 0; i < momentumRows.length; i += BATCH_SIZE) {
    const batch = momentumRows.slice(i, i + BATCH_SIZE)
    const { error: momError } = await supabase
      .from('momentum_analysis')
      .upsert(batch, { onConflict: 'technology_id,analysis_date' })

    if (momError) {
      errors.push(`Momentum upsert batch ${Math.floor(i / BATCH_SIZE) + 1}: ${momError.message}`)
    }
  }

  return { scored: upsertedTotal, errors }
}
