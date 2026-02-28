// Learn Next Quiz Engine - Personalized learning recommendations

import type { QuizAnswer, QuizRecommendation } from './types'
import type { TechnologyWithScore, TechnologyCategory } from '@/types'
import { generateQuizAI, validateAIResponse, parseBulletPoints, getFallback } from './ai-helper'

interface LearnNextContext {
  currentSkills: string[]
  goal: string
  timeCommitment: string
  interestArea: string
}

interface ScoredTechnology {
  tech: TechnologyWithScore
  score: number
  reasoning: string
}

/**
 * Generate personalized learning recommendation
 */
export async function generateLearnNextRecommendation(
  answers: QuizAnswer[],
  technologies: TechnologyWithScore[]
): Promise<QuizRecommendation> {
  const context = parseAnswers(answers)

  // 1. Filter technologies by interest area (category)
  const candidates = filterByCategory(technologies, context.interestArea)

  // 2. Exclude technologies they already know
  const filtered = candidates.filter(t => !context.currentSkills.includes(t.slug))

  // 3. Score each candidate based on goal
  const scored = scoreByGoal(filtered, context.goal)

  // 4. Pick top recommendations
  const topPick = scored[0]
  const alternative = scored[1]

  if (!topPick) {
    // Edge case: user already knows everything in their interest area
    return generateFallbackRecommendation(context, technologies)
  }

  // 5. Estimate learning time
  const timeline = estimateLearningTime(topPick.tech, context.timeCommitment)

  // 6. Generate AI reasoning
  let aiReasoning: string[]
  try {
    aiReasoning = await generateAIReasoning(topPick.tech, context)
  } catch (error) {
    console.error('AI reasoning failed, using template:', error)
    aiReasoning = generateTemplateReasoning(topPick.tech, context)
  }

  return {
    primary: {
      action: `Learn ${topPick.tech.name}`,
      technology: topPick.tech.slug,
      reasoning: aiReasoning,
      score: Math.round(topPick.score),
      timeline
    },
    secondary: alternative ? {
      action: `Alternative: ${alternative.tech.name}`,
      technology: alternative.tech.slug,
      reasoning: [
        generateAlternativeReason(topPick.tech, alternative.tech)
      ]
    } : undefined,
    nextSteps: [
      `View ${topPick.tech.name} details and trends`,
      `Compare ${topPick.tech.name} with alternatives`,
      `Check if your stack is still relevant`,
      `Find learning resources and roadmaps`
    ],
    relatedLinks: [
      { label: `View ${topPick.tech.name} →`, href: `/technologies/${topPick.tech.slug}` },
      ...(alternative ? [{ label: `Compare: ${topPick.tech.name} vs ${alternative.tech.name} →`, href: `/compare?techs=${topPick.tech.slug},${alternative.tech.slug}` }] : []),
      { label: 'Check my stack health →', href: '/quiz/stack-health' },
      { label: 'Ask AI for advice →', href: '/ask' }
    ]
  }
}

/**
 * Parse quiz answers into context
 */
function parseAnswers(answers: QuizAnswer[]): LearnNextContext {
  return {
    currentSkills: (answers.find(a => a.questionId === 'current-skills')?.value as string[]) || [],
    goal: (answers.find(a => a.questionId === 'goal')?.value as string) || 'stay-relevant',
    timeCommitment: (answers.find(a => a.questionId === 'time-commitment')?.value as string) || '5hrs',
    interestArea: (answers.find(a => a.questionId === 'interest-area')?.value as string) || 'frontend'
  }
}

/**
 * Filter technologies by interest area
 */
function filterByCategory(
  technologies: TechnologyWithScore[],
  interestArea: string
): TechnologyWithScore[] {
  const categoryMap: Record<string, TechnologyCategory[]> = {
    'frontend': ['frontend'],
    'backend': ['backend'],
    'data': ['database', 'ai_ml'],
    'mobile': ['mobile'],
    'devops': ['devops', 'cloud'],
    'ai-ml': ['ai_ml']
  }

  const relevantCategories = categoryMap[interestArea] || []

  if (relevantCategories.length === 0) {
    return technologies
  }

  return technologies.filter(t => relevantCategories.includes(t.category))
}

/**
 * Score technologies based on user's goal
 */
function scoreByGoal(
  technologies: TechnologyWithScore[],
  goal: string
): ScoredTechnology[] {
  const goalWeights: Record<string, { jobs: number; momentum: number; ecosystem: number; community: number }> = {
    'get-job': { jobs: 0.6, momentum: 0.2, ecosystem: 0.15, community: 0.05 },
    'better-job': { jobs: 0.5, momentum: 0.3, ecosystem: 0.15, community: 0.05 },
    'side-project': { jobs: 0.1, momentum: 0.3, ecosystem: 0.4, community: 0.2 },
    'stay-relevant': { jobs: 0.3, momentum: 0.5, ecosystem: 0.15, community: 0.05 },
    'switch-fields': { jobs: 0.5, momentum: 0.3, ecosystem: 0.15, community: 0.05 }
  }

  const weights = goalWeights[goal] || goalWeights['stay-relevant']

  const scored = technologies.map(tech => {
    const jobsScore = tech.jobs_score ?? 0
    const momentumScore = normalizeMomentum(tech.momentum ?? 0)
    const ecosystemScore = tech.ecosystem_score ?? 0
    const communityScore = tech.community_score ?? 0

    const score =
      jobsScore * weights.jobs +
      momentumScore * weights.momentum +
      ecosystemScore * weights.ecosystem +
      communityScore * weights.community

    return {
      tech,
      score,
      reasoning: explainScore(tech, weights)
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Normalize momentum to 0-100 scale
 */
function normalizeMomentum(momentum: number): number {
  // Momentum typically ranges from -20 to +20
  // Map to 0-100 scale
  const normalized = ((momentum + 20) / 40) * 100
  return Math.max(0, Math.min(100, normalized))
}

/**
 * Explain score calculation
 */
function explainScore(
  tech: TechnologyWithScore,
  weights: { jobs: number; momentum: number; ecosystem: number; community: number }
): string {
  const factors = []

  if (weights.jobs > 0.4) {
    factors.push(`${tech.jobs_score?.toFixed(0)}/100 job demand`)
  }
  if (weights.momentum > 0.3) {
    const trend = (tech.momentum ?? 0) > 0 ? 'rising' : 'stable'
    factors.push(`${trend} trend`)
  }
  if (weights.ecosystem > 0.3) {
    factors.push(`${tech.ecosystem_score?.toFixed(0)}/100 ecosystem`)
  }

  return factors.join(', ')
}

/**
 * Estimate learning time based on commitment
 */
function estimateLearningTime(tech: TechnologyWithScore, timeCommitment: string): string {
  const baseHours: Record<TechnologyCategory, number> = {
    language: 60,
    frontend: 40,
    backend: 50,
    database: 30,
    devops: 60,
    cloud: 50,
    mobile: 60,
    ai_ml: 80,
    blockchain: 70,
  }

  const hoursPerWeek: Record<string, number> = {
    '2hrs': 2,
    '5hrs': 5,
    '10hrs': 10,
    'fulltime': 40
  }

  const totalHours = baseHours[tech.category] || 40
  const weeklyHours = hoursPerWeek[timeCommitment] || 5
  const weeks = Math.ceil(totalHours / weeklyHours)

  if (weeks <= 4) return `${weeks} weeks at your pace`
  if (weeks <= 12) return `${Math.round(weeks / 4)} months at your pace`
  return `${Math.round(weeks / 12)} years at your pace`
}

/**
 * Generate AI-powered reasoning
 */
async function generateAIReasoning(
  tech: TechnologyWithScore,
  context: LearnNextContext
): Promise<string[]> {
  const prompt = `You are a career advisor helping a developer decide what to learn next.

THEIR SITUATION:
- Current skills: ${context.currentSkills.join(', ') || 'beginner'}
- Goal: ${getGoalLabel(context.goal)}
- Time available: ${context.timeCommitment}
- Interest: ${getInterestLabel(context.interestArea)}

RECOMMENDATION: ${tech.name}
- Composite Score: ${tech.composite_score}/100
- Jobs Score: ${tech.jobs_score}/100
- Momentum: ${tech.momentum?.toFixed(1)} (${tech.momentum && tech.momentum > 0 ? 'rising' : 'stable'})
- Category: ${tech.category}

Generate 3 concise, honest bullet points explaining WHY this is the right choice for THEIR specific situation. Focus on:
1. How it connects to their current skills
2. How it aligns with their goal
3. Realistic timeline given their time commitment

Be direct and honest. If there are tradeoffs, mention them.

Format: Return ONLY 3 bullet points, no preamble. Start each with a dash (-).`

  const response = await generateQuizAI('reasoning', prompt, {
    maxTokens: 200,
    temperature: 0.7
  })

  const validation = validateAIResponse(response, 30)
  if (!validation.valid) {
    throw new Error('AI response validation failed')
  }

  const bulletPoints = parseBulletPoints(response)

  if (bulletPoints.length < 2) {
    throw new Error('Insufficient bullet points')
  }

  return bulletPoints.slice(0, 3)
}

/**
 * Generate template reasoning (fallback)
 */
function generateTemplateReasoning(
  tech: TechnologyWithScore,
  context: LearnNextContext
): string[] {
  const reasons = []

  // Reason 1: Job market
  if (context.goal === 'get-job' || context.goal === 'better-job') {
    reasons.push(
      `Strong job market with ${tech.jobs_score?.toFixed(0)}/100 demand score`
    )
  } else {
    reasons.push(
      `Growing adoption in the ${context.interestArea} space`
    )
  }

  // Reason 2: Momentum
  if (tech.momentum && tech.momentum > 5) {
    reasons.push(`Rapidly rising trend (+${tech.momentum.toFixed(1)} momentum)`)
  } else if (tech.momentum && tech.momentum > 0) {
    reasons.push(`Steady positive growth (+${tech.momentum.toFixed(1)} momentum)`)
  } else {
    reasons.push(`Stable and mature technology with proven track record`)
  }

  // Reason 3: Learning curve
  const timeline = estimateLearningTime(tech, context.timeCommitment)
  reasons.push(`Achievable in ${timeline} with consistent practice`)

  return reasons
}

/**
 * Generate alternative reason
 */
function generateAlternativeReason(
  primary: TechnologyWithScore,
  alternative: TechnologyWithScore
): string {
  const jobsDiff = (primary.jobs_score ?? 0) - (alternative.jobs_score ?? 0)

  if (Math.abs(jobsDiff) < 10) {
    return `Similar job prospects but different ecosystem - consider based on preference`
  }

  if (jobsDiff > 0) {
    return `${Math.round(Math.abs(jobsDiff))} points lower job demand, but may be easier to learn`
  }

  return `Actually has ${Math.round(Math.abs(jobsDiff))} points higher job demand - worth considering`
}

/**
 * Fallback recommendation when no suitable match
 */
function generateFallbackRecommendation(
  context: LearnNextContext,
  allTechnologies: TechnologyWithScore[]
): QuizRecommendation {
  // Just pick the top technology overall
  const top = allTechnologies
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))[0]

  return {
    primary: {
      action: `Consider exploring ${top.name}`,
      technology: top.slug,
      reasoning: [
        `Based on your current skills, you might benefit from exploring adjacent areas`,
        `${top.name} is a top-rated technology in our analysis`,
        `Broadening your skill set can open new opportunities`
      ],
      score: Math.round(top.composite_score ?? 0)
    },
    nextSteps: [
      'Review all technologies in your interest area',
      'Check which skills are most in-demand',
      'Consider taking the Stack Health quiz'
    ],
    relatedLinks: [
      { label: 'View all technologies →', href: '/technologies' },
      { label: 'Check stack health →', href: '/quiz/stack-health' }
    ]
  }
}

/**
 * Helper: Get readable goal label
 */
function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    'get-job': 'Get a job',
    'better-job': 'Get a better job',
    'side-project': 'Build a side project',
    'stay-relevant': 'Stay relevant',
    'switch-fields': 'Switch fields'
  }
  return labels[goal] || goal
}

/**
 * Helper: Get readable interest label
 */
function getInterestLabel(interest: string): string {
  const labels: Record<string, string> = {
    'frontend': 'Frontend development',
    'backend': 'Backend development',
    'data': 'Data engineering',
    'mobile': 'Mobile development',
    'devops': 'DevOps/Infrastructure',
    'ai-ml': 'AI/Machine Learning'
  }
  return labels[interest] || interest
}
