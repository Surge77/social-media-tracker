// Stack Health Quiz Engine - Analyze if your tech stack is still relevant

import type { QuizAnswer, QuizRecommendation } from './types'
import type { TechnologyWithScore } from '@/types'
import { generateQuizAI, validateAIResponse, getFallback } from './ai-helper'

interface StackHealthContext {
  stackSlugs: string[]
  experienceYears: string
}

interface CategorizedTech {
  tech: TechnologyWithScore
  status: 'strong' | 'watch' | 'risk'
  reason: string
}

interface SkillGap {
  tech: string
  percentage: number
  category: string
}

/**
 * Calculate stack health and generate recommendations
 */
export async function calculateStackHealth(
  answers: QuizAnswer[],
  technologies: TechnologyWithScore[]
): Promise<QuizRecommendation> {
  const context = parseAnswers(answers)

  // Get technologies in user's stack
  const stackTechs = technologies.filter(t => context.stackSlugs.includes(t.slug))

  if (stackTechs.length === 0) {
    return generateEmptyStackRecommendation()
  }

  // Calculate aggregate health score
  const avgComposite = average(stackTechs.map(t => t.composite_score ?? 0))
  const avgMomentum = average(stackTechs.map(t => t.momentum ?? 0))

  // Categorize each technology
  const categorized = stackTechs.map(tech => categorizeTechHealth(tech))

  const strong = categorized.filter(c => c.status === 'strong')
  const watch = categorized.filter(c => c.status === 'watch')
  const risk = categorized.filter(c => c.status === 'risk')

  // Identify skill gaps (technologies commonly paired with their stack)
  const skillGaps = identifySkillGaps(stackTechs, technologies)

  // Generate AI summary
  let aiSummary: string
  try {
    aiSummary = await generateStackHealthSummary({
      avgComposite,
      avgMomentum,
      strong: strong.map(s => s.tech.name),
      watch: watch.map(w => ({ name: w.tech.name, momentum: w.tech.momentum ?? 0 })),
      risk: risk.map(r => ({ name: r.tech.name, momentum: r.tech.momentum ?? 0 })),
      skillGaps
    })
  } catch (error) {
    console.error('AI summary failed, using template:', error)
    aiSummary = generateTemplateSummary(avgComposite, strong.length, watch.length, risk.length)
  }

  // Build recommendation
  return {
    primary: {
      action: `Overall Health: ${Math.round(avgComposite)}/100`,
      reasoning: [
        aiSummary,
        `${strong.length} ${strong.length === 1 ? 'technology is' : 'technologies are'} strong and growing`,
        ...(watch.length > 0 ? [`${watch.length} ${watch.length === 1 ? 'needs' : 'need'} attention`] : []),
        ...(risk.length > 0 ? [`${risk.length} at risk - consider alternatives`] : [])
      ],
      score: Math.round(avgComposite)
    },
    warnings: risk.map(r =>
      `${r.tech.name}: ${getMomentumInsight(r.tech.momentum)} — ${r.reason}`
    ),
    nextSteps: [
      ...watch.map(w => `Monitor ${w.tech.name} - ${w.reason}`),
      ...risk.slice(0, 2).map(r => `Consider learning alternatives to ${r.tech.name}`),
      ...skillGaps.slice(0, 3).map(gap =>
        `Add ${gap.tech} to your stack (in ${gap.percentage}% of relevant jobs)`
      ),
      'Deep compare your stack with alternatives',
      'Check what you should learn next'
    ].slice(0, 6), // Limit to 6 steps
    relatedLinks: [
      {
        label: 'Deep compare your stack →',
        href: `/compare?techs=${context.stackSlugs.join(',')}`
      },
      {
        label: 'View job market trends →',
        href: '/technologies?sort=jobs'
      },
      {
        label: 'What should I learn next? →',
        href: '/quiz/learn-next'
      },
      {
        label: 'Build learning roadmap →',
        href: '/quiz/roadmap'
      }
    ]
  }
}

/**
 * Parse quiz answers
 */
function parseAnswers(answers: QuizAnswer[]): StackHealthContext {
  return {
    stackSlugs: (answers.find(a => a.questionId === 'daily-stack')?.value as string[]) || [],
    experienceYears: (answers.find(a => a.questionId === 'experience-years')?.value as string) || '1-3'
  }
}

/**
 * Categorize technology health
 */
function categorizeTechHealth(tech: TechnologyWithScore): CategorizedTech {
  const score = tech.composite_score ?? 0
  const momentum = tech.momentum ?? 0
  const jobsScore = tech.jobs_score ?? 0

  // Strong: high score + positive momentum
  if (score >= 60 && momentum > -3) {
    return {
      tech,
      status: 'strong',
      reason: momentum > 5
        ? 'Rising fast with strong demand'
        : 'Stable with good market presence'
    }
  }

  // Watch: mid-range score or declining momentum
  if (score >= 40 && momentum > -8) {
    return {
      tech,
      status: 'watch',
      reason: momentum < 0
        ? 'Declining momentum - monitor alternatives'
        : 'Moderate demand - keep skills fresh'
    }
  }

  // Risk: low score or steep decline
  return {
    tech,
    status: 'risk',
    reason: momentum < -10
      ? 'Rapidly declining - plan migration'
      : 'Low market demand - risky for career'
  }
}

/**
 * Identify skill gaps based on job market co-occurrence
 */
function identifySkillGaps(
  stackTechs: TechnologyWithScore[],
  allTechnologies: TechnologyWithScore[]
): SkillGap[] {
  // Get technologies user doesn't know
  const stackSlugs = new Set(stackTechs.map(t => t.slug))
  const unknownTechs = allTechnologies.filter(t => !stackSlugs.has(t.slug))

  // Score unknown technologies by job demand + ecosystem compatibility
  const categoryMatch = new Set(stackTechs.map(t => t.category))

  const gapScores = unknownTechs.map(tech => {
    let score = tech.jobs_score ?? 0

    // Boost score if same category as user's stack
    if (categoryMatch.has(tech.category)) {
      score *= 1.3
    }

    // Boost if positive momentum
    if (tech.momentum && tech.momentum > 5) {
      score *= 1.2
    }

    return {
      tech: tech.name,
      slug: tech.slug,
      category: tech.category,
      percentage: Math.min(95, Math.round(score * 0.8 + 10)), // Simulate co-occurrence
      score
    }
  })

  // Return top 5 gaps
  return gapScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ tech, percentage, category }) => ({ tech, percentage, category }))
}

/**
 * Generate AI-powered stack health summary
 */
async function generateStackHealthSummary(context: {
  avgComposite: number
  avgMomentum: number
  strong: string[]
  watch: Array<{ name: string; momentum: number }>
  risk: Array<{ name: string; momentum: number }>
  skillGaps: SkillGap[]
}): Promise<string> {
  const prompt = `Analyze this developer's tech stack health:

OVERALL SCORE: ${context.avgComposite.toFixed(0)}/100
AVERAGE MOMENTUM: ${context.avgMomentum.toFixed(1)}

STRONG TECHNOLOGIES: ${context.strong.join(', ') || 'None'}
WATCH CLOSELY: ${context.watch.map(w => `${w.name} (momentum: ${w.momentum.toFixed(1)})`).join(', ') || 'None'}
AT RISK: ${context.risk.map(r => `${r.name} (momentum: ${r.momentum.toFixed(1)})`).join(', ') || 'None'}

SKILL GAPS (missing from job postings):
${context.skillGaps.map(g => `- ${g.tech} (in ${g.percentage}% of relevant jobs)`).join('\n') || 'None identified'}

Write ONE honest, direct sentence summarizing their stack health. Be encouraging if strong, cautionary if weak. Mention the most critical issue if any.

Example: "Your stack is solid for the next 2 years, but jQuery is dragging you down—time to migrate."

Return ONLY the summary sentence, nothing else.`

  const response = await generateQuizAI('summary', prompt, {
    maxTokens: 100,
    temperature: 0.8
  })

  const validation = validateAIResponse(response, 20)
  if (!validation.valid) {
    throw new Error('AI response validation failed')
  }

  return response.trim()
}

/**
 * Generate template summary (fallback)
 */
function generateTemplateSummary(
  avgComposite: number,
  strongCount: number,
  watchCount: number,
  riskCount: number
): string {
  if (avgComposite >= 70) {
    return `Your stack is in excellent shape with strong market demand.`
  }

  if (avgComposite >= 50) {
    if (riskCount > 0) {
      return `Your stack is mostly solid, but ${riskCount} ${riskCount === 1 ? 'technology needs' : 'technologies need'} attention.`
    }
    return `Your stack is stable with room for strategic improvements.`
  }

  if (riskCount >= 2) {
    return `Your stack needs urgent attention - multiple technologies are at risk.`
  }

  return `Consider modernizing your stack to stay competitive in the job market.`
}

/**
 * Get momentum insight text
 */
export function getMomentumInsight(momentum: number | null | undefined): string {
  if (momentum === null || momentum === undefined) {
    return 'Stable trend'
  }

  if (momentum > 10) return 'Exploding growth'
  if (momentum > 5) return 'Rising fast'
  if (momentum > 2) return 'Growing steadily'
  if (momentum > -2) return 'Stable'
  if (momentum > -5) return 'Declining slowly'
  if (momentum > -10) return 'Declining fast'
  return 'Rapid decline'
}

/**
 * Fallback for empty stack
 */
function generateEmptyStackRecommendation(): QuizRecommendation {
  return {
    primary: {
      action: 'No technologies selected',
      reasoning: [
        'Please select at least 3 technologies from your daily stack',
        'This will help us analyze your stack health and identify opportunities'
      ],
      score: 0
    },
    nextSteps: [
      'Retake the quiz and select your technologies',
      'Browse all technologies to see what\'s available',
      'Take the "What Should I Learn Next?" quiz'
    ],
    relatedLinks: [
      { label: 'View all technologies →', href: '/technologies' },
      { label: 'What should I learn next? →', href: '/quiz/learn-next' }
    ]
  }
}

/**
 * Calculate average
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length
}
