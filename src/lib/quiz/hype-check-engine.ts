// Hype Check Quiz Engine - Separate hype from reality

import type { QuizAnswer, QuizRecommendation } from './types'
import type { TechnologyWithScore } from '@/types'
import { generateQuizAI, validateAIResponse, getFallback } from './ai-helper'

type HypeLevel = 'real' | 'early' | 'overhyped' | 'fading'

interface HypeAnalysis {
  level: HypeLevel
  hypeGap: number
  verdict: {
    title: string
    explanation: string
    emoji: string
  }
}

interface HistoricalPattern {
  tech: string
  outcome: string
  similarity: number
}

/**
 * Analyze if a technology is hype or real
 */
export async function analyzeHype(
  answers: QuizAnswer[],
  technologies: TechnologyWithScore[]
): Promise<QuizRecommendation> {
  const techSlug = answers.find(a => a.questionId === 'technology')?.value as string

  if (!techSlug) {
    return generateEmptyRecommendation()
  }

  const tech = technologies.find(t => t.slug === techSlug)

  if (!tech) {
    return generateNotFoundRecommendation(techSlug)
  }

  // Calculate hype metrics
  const hypeGap = calculateHypeGap(tech)
  const hypeLevel = classifyHype(hypeGap, tech.momentum ?? 0, tech.composite_score ?? 0)

  // Find similar historical patterns
  const historicalPatterns = findSimilarPatterns(tech, technologies)

  // Generate verdict
  const verdict = generateVerdict(hypeLevel, tech, hypeGap)

  // Generate AI "honest take"
  let honestTake: string
  try {
    honestTake = await generateHonestTake({
      tech,
      hypeGap,
      hypeLevel,
      historicalPatterns
    })
  } catch (error) {
    console.error('AI honest take failed, using template:', error)
    honestTake = generateTemplateHonestTake(hypeLevel, tech, hypeGap)
  }

  return {
    primary: {
      action: verdict.title,
      technology: tech.slug,
      reasoning: [
        `Community Buzz: ${tech.community_score?.toFixed(0) ?? 'N/A'}/100`,
        `Job Demand: ${tech.jobs_score?.toFixed(0) ?? 'N/A'}/100`,
        `Hype Gap: ${Math.abs(hypeGap)} points (${hypeGap > 0 ? 'buzz exceeds jobs' : 'jobs exceed buzz'})`,
        `Momentum: ${formatMomentum(tech.momentum)} ${getMomentumEmoji(tech.momentum)}`,
        verdict.explanation
      ],
      score: tech.composite_score ? Math.round(tech.composite_score) : undefined
    },
    warnings: hypeGap > 40 ? [
      'Large gap between buzz and jobs',
      'High risk for career-critical decisions',
      'Consider waiting for market maturity'
    ] : undefined,
    nextSteps: [
      honestTake,
      ...generateRecommendations(hypeLevel, tech),
      `View ${tech.name} detailed trends`,
      'Compare with established alternatives'
    ],
    relatedLinks: [
      { label: `View ${tech.name} details →`, href: `/technologies/${tech.slug}` },
      { label: 'Compare alternatives →', href: `/compare?techs=${tech.slug}` },
      { label: 'What should I learn? →', href: '/quiz/learn-next' },
      { label: 'Check my stack health →', href: '/quiz/stack-health' }
    ]
  }
}

/**
 * Calculate hype gap (community buzz vs job demand)
 */
function calculateHypeGap(tech: TechnologyWithScore): number {
  const communityScore = tech.community_score ?? 0
  const jobsScore = tech.jobs_score ?? 0
  return communityScore - jobsScore
}

/**
 * Classify hype level
 */
function classifyHype(
  gap: number,
  momentum: number,
  compositeScore: number
): HypeLevel {
  // Real: low gap + strong momentum + decent score
  if (Math.abs(gap) < 15 && momentum > 5 && compositeScore > 50) {
    return 'real'
  }

  // Early: high gap + strong momentum (buzz ahead of jobs)
  if (gap > 30 && momentum > 8) {
    return 'early'
  }

  // Overhyped: huge gap + slowing momentum
  if (gap > 40 && momentum < 5) {
    return 'overhyped'
  }

  // Fading: negative gap (jobs > buzz) + declining momentum
  if (gap < -10 && momentum < -5) {
    return 'fading'
  }

  // Default to early if gap exists
  return gap > 0 ? 'early' : 'real'
}

/**
 * Generate verdict based on hype level
 */
function generateVerdict(
  level: HypeLevel,
  tech: TechnologyWithScore,
  hypeGap: number
): HypeAnalysis['verdict'] {
  const verdicts: Record<HypeLevel, HypeAnalysis['verdict']> = {
    real: {
      title: '✅ REAL DEAL',
      explanation: `${tech.name} has balanced growth - community excitement matches actual job demand. This is sustainable momentum.`,
      emoji: '✅'
    },
    early: {
      title: '🔮 REAL POTENTIAL, BUT EARLY',
      explanation: `${tech.name} has strong developer buzz but limited job opportunities. This could be the future, but it's risky for career moves today.`,
      emoji: '🔮'
    },
    overhyped: {
      title: '🎪 OVERHYPED',
      explanation: `${tech.name} has massive buzz (${tech.community_score?.toFixed(0)}/100) but weak job market (${tech.jobs_score?.toFixed(0)}/100). The gap of ${Math.abs(hypeGap)} points suggests disconnect from reality.`,
      emoji: '🎪'
    },
    fading: {
      title: '📉 FADING',
      explanation: `${tech.name} is losing developer interest while jobs still exist. The market may be moving on to alternatives.`,
      emoji: '📉'
    }
  }

  return verdicts[level]
}

/**
 * Find similar historical patterns
 */
function findSimilarPatterns(
  tech: TechnologyWithScore,
  allTechnologies: TechnologyWithScore[]
): HistoricalPattern[] {
  const currentGap = calculateHypeGap(tech)
  const currentMomentum = tech.momentum ?? 0

  // Find technologies with similar patterns (high gap in the past)
  const patterns = allTechnologies
    .filter(t => t.slug !== tech.slug)
    .map(t => {
      const gap = calculateHypeGap(t)
      const momentum = t.momentum ?? 0

      // Calculate similarity score
      const gapSimilarity = 1 - Math.abs(gap - currentGap) / 100
      const momentumSimilarity = 1 - Math.abs(momentum - currentMomentum) / 40
      const similarity = (gapSimilarity + momentumSimilarity) / 2

      return {
        tech: t.name,
        gap,
        momentum,
        similarity,
        outcome: determineOutcome(t)
      }
    })
    .filter(p => p.similarity > 0.5) // Only similar patterns
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)

  return patterns
}

/**
 * Determine outcome for historical pattern
 */
function determineOutcome(tech: TechnologyWithScore): string {
  const gap = calculateHypeGap(tech)
  const momentum = tech.momentum ?? 0
  const jobs = tech.jobs_score ?? 0

  if (jobs > 60 && Math.abs(gap) < 20) {
    return 'Matured into real jobs'
  }

  if (gap > 40 && momentum < 0) {
    return 'Hype faded, jobs never came'
  }

  if (gap > 20 && momentum > 5) {
    return 'Still early, watch closely'
  }

  if (momentum < -10) {
    return 'Declined and moved on'
  }

  return 'Mixed signals'
}

/**
 * Generate AI-powered honest take
 */
async function generateHonestTake(context: {
  tech: TechnologyWithScore
  hypeGap: number
  hypeLevel: HypeLevel
  historicalPatterns: HistoricalPattern[]
}): Promise<string> {
  const { tech, hypeGap, hypeLevel } = context

  const prompt = `Analyze if this technology is hype or real:

TECHNOLOGY: ${tech.name}
- Community Buzz: ${tech.community_score}/100
- Job Demand: ${tech.jobs_score}/100
- Hype Gap: ${hypeGap} points
- Momentum: ${tech.momentum}
- Composite Score: ${tech.composite_score}/100

CLASSIFICATION: ${hypeLevel}

SIMILAR PATTERNS:
${context.historicalPatterns.map(p => `- ${p.tech}: ${p.outcome}`).join('\n')}

Write 2-3 sentences giving the HONEST take. Be direct about whether this is worth learning now, or if they should wait. Include a "Learn it if..." and "Skip it if..." recommendation.

Be brutally honest. This is career advice, not marketing.

Examples:
- "Bun is a real technical achievement, not vaporware. But the gap between developer excitement and employer adoption is massive. Learn it if you enjoy being early, skip it if you're job hunting."
- "Svelte had similar hype in 2019, and now has meaningful jobs. This could follow the same path, but give it 1-2 years."

Return ONLY the honest take, no preamble.`

  const response = await generateQuizAI('hype-analysis', prompt, {
    maxTokens: 200,
    temperature: 0.7
  })

  const validation = validateAIResponse(response, 30)
  if (!validation.valid) {
    throw new Error('AI response validation failed')
  }

  return response.trim()
}

/**
 * Generate template honest take (fallback)
 */
function generateTemplateHonestTake(
  level: HypeLevel,
  tech: TechnologyWithScore,
  hypeGap: number
): string {
  const templates: Record<HypeLevel, string> = {
    real: `${tech.name} shows balanced growth with real job opportunities. Safe to learn if it aligns with your goals.`,

    early: `${tech.name} has strong technical merit but limited employer adoption. Learn it if you're passionate about the tech, skip it if you need jobs now. Gap of ${Math.abs(hypeGap)} points suggests 1-2 year wait for job market maturity.`,

    overhyped: `${tech.name} buzz far exceeds reality. The ${Math.abs(hypeGap)}-point gap between community (${tech.community_score?.toFixed(0)}) and jobs (${tech.jobs_score?.toFixed(0)}) is concerning. Skip unless you're experimenting for fun.`,

    fading: `${tech.name} is losing momentum while alternatives gain traction. Not recommended for new learning - consider more active technologies in this space.`
  }

  return templates[level]
}

/**
 * Generate recommendations based on hype level
 */
function generateRecommendations(level: HypeLevel, tech: TechnologyWithScore): string[] {
  const recommendations: Record<HypeLevel, string[]> = {
    real: [
      'Strong choice for learning and career',
      'Job market is active and growing',
      'Safe bet for skill investment'
    ],
    early: [
      'Experiment in side projects first',
      'Monitor job market growth over 6-12 months',
      'Keep primary skills in established tech'
    ],
    overhyped: [
      'Wait for job market to catch up',
      'Focus on proven alternatives first',
      'Revisit in 1-2 years if momentum sustains'
    ],
    fading: [
      'Consider learning alternatives instead',
      'Existing users should plan transition',
      'Not recommended for new projects'
    ]
  }

  return recommendations[level].slice(0, 2) // Return top 2
}

/**
 * Format momentum for display
 */
function formatMomentum(momentum: number | null | undefined): string {
  if (momentum === null || momentum === undefined) {
    return 'Unknown'
  }

  if (momentum > 10) return `+${momentum.toFixed(1)} (Exploding)`
  if (momentum > 5) return `+${momentum.toFixed(1)} (Rising Fast)`
  if (momentum > 0) return `+${momentum.toFixed(1)} (Growing)`
  if (momentum > -5) return `${momentum.toFixed(1)} (Declining)`
  return `${momentum.toFixed(1)} (Rapid Decline)`
}

/**
 * Get momentum emoji
 */
function getMomentumEmoji(momentum: number | null | undefined): string {
  if (momentum === null || momentum === undefined) return '➖'
  if (momentum > 10) return '🚀'
  if (momentum > 5) return '📈'
  if (momentum > 0) return '↗️'
  if (momentum > -5) return '↘️'
  return '📉'
}

/**
 * Empty recommendation (no tech selected)
 */
function generateEmptyRecommendation(): QuizRecommendation {
  return {
    primary: {
      action: 'No technology selected',
      reasoning: [
        'Please select a technology to analyze',
        'We\'ll check if it\'s hype or real based on market data'
      ]
    },
    nextSteps: [
      'Retake the quiz and select a technology',
      'Browse trending technologies',
      'Check what you should learn next'
    ],
    relatedLinks: [
      { label: 'View all technologies →', href: '/technologies' },
      { label: 'What should I learn? →', href: '/quiz/learn-next' }
    ]
  }
}

/**
 * Not found recommendation
 */
function generateNotFoundRecommendation(slug: string): QuizRecommendation {
  return {
    primary: {
      action: `Technology "${slug}" not found`,
      reasoning: [
        'This technology is not in our database yet',
        'We track 200+ technologies - it may be too new or niche'
      ]
    },
    nextSteps: [
      'Try searching for a similar technology',
      'Browse all tracked technologies',
      'Check what you should learn instead'
    ],
    relatedLinks: [
      { label: 'View all technologies →', href: '/technologies' },
      { label: 'What should I learn? →', href: '/quiz/learn-next' }
    ]
  }
}
