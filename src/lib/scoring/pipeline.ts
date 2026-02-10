import type { SupabaseClient } from '@supabase/supabase-js'
import { zScoreNormalize } from '@/lib/scoring/normalize'
import {
  computeGitHubScore,
  computeCommunityScore,
  computeJobsScore,
  computeEcosystemScore,
  computeCompositeScore,
} from '@/lib/scoring/composite'
import { bayesianSmooth } from '@/lib/scoring/bayesian'
import { computeMomentum } from '@/lib/scoring/momentum'

interface TechDataPoints {
  technologyId: string
  // GitHub metrics
  stars: number | null
  forks: number | null
  openIssues: number | null
  // Community metrics
  hnMentions: number | null
  hnSentiment: number | null
  redditPosts: number | null
  devtoArticles: number | null
  // Jobs metrics
  adzunaJobs: number | null
  jsearchJobs: number | null
  remotiveJobs: number | null
  // Ecosystem metrics
  downloads: number | null
  soQuestions: number | null
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

  // Step 1: Fetch all active technology IDs
  const { data: technologies, error: techError } = await supabase
    .from('technologies')
    .select('id')
    .eq('is_active', true)

  if (techError || !technologies) {
    throw new Error(`Failed to fetch technologies: ${techError?.message}`)
  }

  const techIds = technologies.map((t) => t.id as string)

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

  // Step 3: Group data points by technology
  const techData = new Map<string, TechDataPoints>()

  for (const techId of techIds) {
    techData.set(techId, {
      technologyId: techId,
      stars: null,
      forks: null,
      openIssues: null,
      hnMentions: null,
      hnSentiment: null,
      redditPosts: null,
      devtoArticles: null,
      adzunaJobs: null,
      jsearchJobs: null,
      remotiveJobs: null,
      downloads: null,
      soQuestions: null,
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
      case 'devto:articles':
        tech.devtoArticles = value
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
        // Use whichever download source is available
        tech.downloads = value
        break
      case 'stackoverflow:questions':
        tech.soQuestions = value
        break
    }
  }

  // Step 4: Collect metric arrays for z-scoring across all techs
  const allTechs = Array.from(techData.values())

  const starsArr = allTechs.map((t) => t.stars ?? 0)
  const forksArr = allTechs.map((t) => t.forks ?? 0)
  const hnArr = allTechs.map((t) => t.hnMentions ?? 0)
  const redditArr = allTechs.map((t) => t.redditPosts ?? 0)
  const devtoArr = allTechs.map((t) => t.devtoArticles ?? 0)
  const adzunaArr = allTechs.map((t) => t.adzunaJobs ?? 0)
  const jsearchArr = allTechs.map((t) => t.jsearchJobs ?? 0)
  const remotiveArr = allTechs.map((t) => t.remotiveJobs ?? 0)
  const downloadsArr = allTechs.map((t) => t.downloads ?? 0)
  const soArr = allTechs.map((t) => t.soQuestions ?? 0)

  const starsZ = zScoreNormalize(starsArr)
  const forksZ = zScoreNormalize(forksArr)
  const hnZ = zScoreNormalize(hnArr)
  const redditZ = zScoreNormalize(redditArr)
  const devtoZ = zScoreNormalize(devtoArr)
  const adzunaZ = zScoreNormalize(adzunaArr)
  const jsearchZ = zScoreNormalize(jsearchArr)
  const remotiveZ = zScoreNormalize(remotiveArr)
  const downloadsZ = zScoreNormalize(downloadsArr)
  const soZ = zScoreNormalize(soArr)

  // Step 5: Fetch scores from 30 days ago for momentum
  const date30DaysAgo = new Date(date)
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30)
  const date30Str = date30DaysAgo.toISOString().split('T')[0]

  const { data: oldScores } = await supabase
    .from('daily_scores')
    .select('technology_id, composite_score')
    .eq('score_date', date30Str)

  const oldScoreMap = new Map<string, number>()
  if (oldScores) {
    for (const s of oldScores) {
      oldScoreMap.set(s.technology_id, Number(s.composite_score))
    }
  }

  // Step 6: Compute sub-scores and composite for each technology
  const scoredRows: ScoredTechnology[] = []
  const rawComposites: number[] = []
  const dataPointCounts: number[] = []

  for (let i = 0; i < allTechs.length; i++) {
    const tech = allTechs[i]

    // GitHub score — null if no GitHub data at all
    let githubScore: number | null = null
    if (tech.stars !== null || tech.forks !== null) {
      const issueCloseRate =
        tech.openIssues !== null && tech.openIssues > 0
          ? 0.5 // Approximate — we don't have closed issues count in MVP
          : tech.openIssues === 0
            ? 1.0
            : 0.5
      githubScore = computeGitHubScore(starsZ[i], forksZ[i], issueCloseRate)
    }

    // Community score — null if no community data
    let communityScore: number | null = null
    if (tech.hnMentions !== null || tech.redditPosts !== null || tech.devtoArticles !== null) {
      communityScore = computeCommunityScore(
        hnZ[i],
        tech.hnSentiment ?? 0.5,
        redditZ[i],
        devtoZ[i]
      )
    }

    // Jobs score — null if no job data
    let jobsScore: number | null = null
    if (tech.adzunaJobs !== null || tech.jsearchJobs !== null || tech.remotiveJobs !== null) {
      jobsScore = computeJobsScore(adzunaZ[i], jsearchZ[i], remotiveZ[i])
    }

    // Ecosystem score — null if no download/SO data
    let ecosystemScore: number | null = null
    if (tech.downloads !== null || tech.soQuestions !== null) {
      // No download growth rate on day 1, use 0
      ecosystemScore = computeEcosystemScore(downloadsZ[i], 0, soZ[i])
    }

    const { composite, completeness } = computeCompositeScore({
      github: githubScore,
      community: communityScore,
      jobs: jobsScore,
      ecosystem: ecosystemScore,
    })

    // Count how many data points this tech has today
    const dpCount = dataPoints.filter((dp) => dp.technology_id === tech.technologyId).length

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

  // Step 8: Momentum
  for (const row of scoredRows) {
    const old = oldScoreMap.get(row.technology_id) ?? null
    row.momentum = computeMomentum(row.composite_score, old)
  }

  // Step 9: Upsert into daily_scores
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

  return { scored: upsertedTotal, errors }
}
