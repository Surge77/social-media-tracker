// Decision Quiz Engine - Help choose between competing technologies

import type { QuizAnswer, QuizRecommendation } from './types'
import type { TechnologyWithScore } from '@/types'
import { generateQuizAI, validateAIResponse, getFallback } from './ai-helper'

interface DecisionContext {
  useCase: string
  experienceLevel: string
  projectConstraints: string
  teamSize: string
  mustHaves: string[]
}

interface ScoredOption {
  tech: TechnologyWithScore
  score: number
  pros: string[]
  cons: string[]
  fitScore: number
}

/**
 * Generate technology decision recommendation
 */
export async function generateTechnologyDecision(
  answers: QuizAnswer[],
  technologies: TechnologyWithScore[]
): Promise<QuizRecommendation> {
  const context = parseAnswers(answers)

  // Get candidate technologies based on use case
  const candidates = filterByUseCase(technologies, context.useCase)

  if (candidates.length === 0) {
    return generateNoOptionsRecommendation(context)
  }

  // Score each candidate based on context
  const scored = scoreCandidates(candidates, context)

  // Pick top 3 options
  const topPick = scored[0]
  const alternative1 = scored[1]
  const alternative2 = scored[2]

  // Generate AI comparison
  let aiComparison: string
  try {
    aiComparison = await generateAIComparison({
      topPick: topPick.tech,
      alternatives: [alternative1?.tech, alternative2?.tech].filter(Boolean) as TechnologyWithScore[],
      context
    })
  } catch (error) {
    console.error('AI comparison failed, using template:', error)
    aiComparison = generateTemplateComparison(topPick, context)
  }

  return {
    primary: {
      action: `Recommended: ${topPick.tech.name}`,
      technology: topPick.tech.slug,
      reasoning: [
        aiComparison,
        `Fit score: ${topPick.fitScore}/100 for your situation`,
        ...topPick.pros.slice(0, 2).map(pro => `✓ ${pro}`)
      ],
      score: topPick.fitScore
    },
    secondary: alternative1 ? {
      action: `Alternative: ${alternative1.tech.name}`,
      technology: alternative1.tech.slug,
      reasoning: [
        `Fit score: ${alternative1.fitScore}/100`,
        ...alternative1.pros.slice(0, 2).map(pro => `✓ ${pro}`)
      ]
    } : undefined,
    warnings: topPick.cons.length > 0 ? topPick.cons.map(con => `⚠️ ${con}`) : undefined,
    nextSteps: [
      `Deep compare: ${topPick.tech.name} vs ${alternative1?.tech.name || 'alternatives'}`,
      `Check ${topPick.tech.name} ecosystem and tooling`,
      `Review real-world examples and case studies`,
      `Verify team has required expertise or training plan`,
      alternative2 ? `Also consider: ${alternative2.tech.name} (fit: ${alternative2.fitScore})` : null
    ].filter(Boolean) as string[],
    relatedLinks: [
      {
        label: `Deep compare: ${topPick.tech.name} vs ${alternative1?.tech.name || 'others'} →`,
        href: `/compare?techs=${[topPick.tech.slug, alternative1?.tech.slug, alternative2?.tech.slug].filter(Boolean).join(',')}`
      },
      { label: `View ${topPick.tech.name} details →`, href: `/technologies/${topPick.tech.slug}` },
      { label: 'Check stack health →', href: '/quiz/stack-health' },
      { label: 'Ask AI for advice →', href: '/ask' }
    ]
  }
}

/**
 * Parse quiz answers
 */
function parseAnswers(answers: QuizAnswer[]): DecisionContext {
  return {
    useCase: (answers.find(a => a.questionId === 'use-case')?.value as string) || 'web-app',
    experienceLevel: (answers.find(a => a.questionId === 'experience-level')?.value as string) || 'intermediate',
    projectConstraints: (answers.find(a => a.questionId === 'project-constraints')?.value as string) || 'balanced',
    teamSize: (answers.find(a => a.questionId === 'team-size')?.value as string) || 'small',
    mustHaves: (answers.find(a => a.questionId === 'must-haves')?.value as string[]) || []
  }
}

/**
 * Filter technologies by use case
 */
function filterByUseCase(
  technologies: TechnologyWithScore[],
  useCase: string
): TechnologyWithScore[] {
  const useCaseMap: Record<string, string[]> = {
    'web-app': ['frontend', 'backend'],
    'mobile-app': ['mobile'],
    'api': ['backend'],
    'static-site': ['frontend'],
    'fullstack': ['frontend', 'backend'],
    'data-viz': ['frontend'],
    'real-time': ['backend', 'frontend']
  }

  const relevantCategories = useCaseMap[useCase] || ['frontend', 'backend']

  // For frontend use cases, filter to frontend frameworks
  if (useCase === 'web-app' || useCase === 'static-site' || useCase === 'data-viz') {
    return technologies.filter(t =>
      t.category === 'frontend' &&
      (t.name.includes('React') || t.name.includes('Vue') || t.name.includes('Angular') ||
       t.name.includes('Svelte') || t.name.includes('Solid') || t.name === 'Next.js' ||
       t.name === 'Nuxt' || t.name === 'Astro' || t.name === 'Qwik')
    )
  }

  return technologies.filter(t => relevantCategories.includes(t.category))
}

/**
 * Score candidates based on context
 */
function scoreCandidates(
  candidates: TechnologyWithScore[],
  context: DecisionContext
): ScoredOption[] {
  const scored = candidates.map(tech => {
    let score = 0
    const pros: string[] = []
    const cons: string[] = []

    // Base score from composite
    score += (tech.composite_score ?? 0) * 0.3

    // Experience level weighting
    if (context.experienceLevel === 'beginner') {
      // Favor popular, well-documented technologies
      score += (tech.community_score ?? 0) * 0.3
      score += (tech.ecosystem_score ?? 0) * 0.2

      if ((tech.community_score ?? 0) > 70) {
        pros.push('Large community for help')
      }
      if ((tech.ecosystem_score ?? 0) > 70) {
        pros.push('Rich ecosystem and tooling')
      }
    } else if (context.experienceLevel === 'expert') {
      // Favor cutting-edge, high-performance options
      score += (tech.momentum ?? 0) * 5 // Favor rising technologies

      if ((tech.momentum ?? 0) > 5) {
        pros.push('Cutting-edge technology')
      }
    }

    // Project constraints
    if (context.projectConstraints === 'time-to-market') {
      // Favor mature, stable options
      score += (tech.jobs_score ?? 0) * 0.3
      score += (tech.ecosystem_score ?? 0) * 0.3

      if ((tech.ecosystem_score ?? 0) > 70) {
        pros.push('Fast development with rich tooling')
      }
      if ((tech.momentum ?? 0) < -5) {
        cons.push('Declining momentum may affect long-term support')
      }
    } else if (context.projectConstraints === 'performance') {
      // Check for performance-oriented technologies
      if (tech.name === 'Solid' || tech.name === 'Svelte' || tech.name === 'Qwik') {
        score += 20
        pros.push('Excellent performance characteristics')
      }
    } else if (context.projectConstraints === 'team-familiarity') {
      // Favor popular, mainstream options
      score += (tech.jobs_score ?? 0) * 0.4

      if ((tech.jobs_score ?? 0) > 70) {
        pros.push('Easy to hire developers')
      }
    }

    // Team size considerations
    if (context.teamSize === 'solo') {
      // Favor simple, batteries-included options
      if ((tech.ecosystem_score ?? 0) > 70) {
        pros.push('Good for solo developers')
      }
    } else if (context.teamSize === 'large') {
      // Favor technologies with strong typing and tooling
      if (tech.name.includes('Type') || tech.name === 'Angular') {
        score += 15
        pros.push('Strong typing for large teams')
      }
    }

    // Must-haves
    context.mustHaves.forEach(mustHave => {
      if (mustHave === 'typescript' && (tech.name.includes('Type') || tech.name === 'Angular')) {
        score += 20
        pros.push('Built-in TypeScript support')
      }
      if (mustHave === 'ssr' && (tech.name === 'Next.js' || tech.name === 'Nuxt' || tech.name === 'Astro')) {
        score += 20
        pros.push('Excellent SSR support')
      }
      if (mustHave === 'mobile' && tech.category === 'mobile') {
        score += 20
        pros.push('Built for mobile development')
      }
    })

    // Identify cons
    if ((tech.jobs_score ?? 0) < 30) {
      cons.push('Limited job market')
    }
    if ((tech.momentum ?? 0) < -8) {
      cons.push('Rapidly declining')
    }
    if ((tech.community_score ?? 0) < 40) {
      cons.push('Small community')
    }

    const fitScore = Math.min(100, Math.max(0, score))

    return {
      tech,
      score,
      pros: pros.slice(0, 4),
      cons: cons.slice(0, 3),
      fitScore: Math.round(fitScore)
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Generate AI comparison
 */
async function generateAIComparison(context: {
  topPick: TechnologyWithScore
  alternatives: TechnologyWithScore[]
  context: DecisionContext
}): Promise<string> {
  const prompt = `Help a developer choose between technology options:

THEIR SITUATION:
- Use case: ${context.context.useCase}
- Experience level: ${context.context.experienceLevel}
- Main constraint: ${context.context.projectConstraints}
- Team size: ${context.context.teamSize}
- Must-haves: ${context.context.mustHaves.join(', ') || 'none'}

TOP RECOMMENDATION: ${context.topPick.name}
- Composite Score: ${context.topPick.composite_score}/100
- Jobs: ${context.topPick.jobs_score}/100
- Momentum: ${context.topPick.momentum}

ALTERNATIVES:
${context.alternatives.map(alt => `- ${alt.name} (Score: ${alt.composite_score}, Jobs: ${alt.jobs_score})`).join('\n')}

Write 2-3 sentences explaining why ${context.topPick.name} is the best choice for THEIR specific situation. Be honest about tradeoffs.

Example: "For your solo project with time constraints, Next.js gives you the fastest path to production with built-in SSR and huge ecosystem. React's job market means you can easily find help. The only tradeoff is higher initial learning curve than simpler options."

Return ONLY the explanation, no preamble.`

  const response = await generateQuizAI('reasoning', prompt, {
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
 * Generate template comparison (fallback)
 */
function generateTemplateComparison(
  topPick: ScoredOption,
  context: DecisionContext
): string {
  const reasons = []

  if (context.projectConstraints === 'time-to-market') {
    reasons.push(`${topPick.tech.name} offers the fastest time to market with its mature ecosystem`)
  } else if (context.projectConstraints === 'performance') {
    reasons.push(`${topPick.tech.name} provides excellent performance for your use case`)
  } else {
    reasons.push(`${topPick.tech.name} best balances your requirements`)
  }

  if ((topPick.tech.jobs_score ?? 0) > 60) {
    reasons.push('strong job market makes hiring easier')
  }

  if (topPick.pros.length > 0) {
    reasons.push(topPick.pros[0].toLowerCase())
  }

  return reasons.join(', ') + '.'
}

/**
 * No options recommendation
 */
function generateNoOptionsRecommendation(context: DecisionContext): QuizRecommendation {
  return {
    primary: {
      action: 'No suitable options found',
      reasoning: [
        'We couldn\'t find technologies matching your criteria',
        'Try adjusting your requirements or must-haves'
      ]
    },
    nextSteps: [
      'Retake the quiz with different criteria',
      'Browse all technologies',
      'Ask AI for recommendations'
    ],
    relatedLinks: [
      { label: 'View all technologies →', href: '/technologies' },
      { label: 'What should I learn? →', href: '/quiz/learn-next' },
      { label: 'Ask AI →', href: '/ask' }
    ]
  }
}
