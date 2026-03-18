import { describe, expect, it } from 'vitest'

import { buildDecisionFirstSummary } from '@/lib/insights'

describe('buildDecisionFirstSummary', () => {
  it('produces a user-facing decision summary with actions', () => {
    const result = buildDecisionFirstSummary({
      techName: 'React',
      techSlug: 'react',
      category: 'frontend',
      compositeScore: 52.28,
      momentum: 14.7,
      jobsScore: 75.08,
      githubScore: 44,
      communityScore: 53.98,
      ecosystemScore: 56,
      confidenceGrade: 'C',
      rank: 13,
      totalRanked: 121,
    })

    expect(result.verdict).toMatch(/worth learning/i)
    expect(result.bestFor.length).toBeGreaterThan(0)
    expect(result.notIdealFor.length).toBeGreaterThan(0)
    expect(result.whyThisIsMoving.length).toBeGreaterThan(0)
    expect(result.nextActions).toHaveLength(3)
    expect(result.nextActions[0]?.href).toBe('/compare?a=react')
  })

  it('calls out demand-vs-buzz divergence when hiring is stronger than community', () => {
    const result = buildDecisionFirstSummary({
      techName: 'Go',
      techSlug: 'go',
      category: 'backend',
      compositeScore: 61,
      momentum: 4,
      jobsScore: 78,
      githubScore: 58,
      communityScore: 49,
      ecosystemScore: 63,
      confidenceGrade: 'B',
      rank: 7,
      totalRanked: 121,
    })

    expect(result.whyThisIsMoving.join(' ')).toMatch(/hiring demand/i)
    expect(result.whyThisIsMoving.join(' ')).toMatch(/community buzz/i)
  })

  it('prefers AI-generated insight content for the verdict and summary bullets when available', () => {
    const result = buildDecisionFirstSummary({
      techName: 'Svelte',
      techSlug: 'svelte',
      category: 'frontend',
      compositeScore: 58,
      momentum: 9,
      jobsScore: 42,
      githubScore: 61,
      communityScore: 76,
      ecosystemScore: 51,
      confidenceGrade: 'B',
      rank: 21,
      totalRanked: 121,
      aiInsight: {
        headline: 'High upside, but still a selective bet',
        careerAdvice: 'Strong choice if you value DX and can tolerate lower hiring breadth.',
        trendNarrative: 'Community enthusiasm is running ahead of employer demand.',
        scoreExplanation: 'Developer excitement is strong, but the job market signal is still narrower than bigger frontend frameworks.',
        momentumContext: 'Momentum is accelerating from the community side more than the hiring side.',
        riskFactors: 'The main downside is lower hiring volume than React or Next.js.',
        pros: ['Excellent developer experience.', 'Strong community affinity.'],
        cons: ['Smaller hiring market.', 'Less default-enterprise adoption.'],
        practicalAnalysis: {
          bestFitUseCases: 'Teams that care about simplicity, developer experience, and fast UI iteration.',
          avoidIf: 'Organizations that need the safest hiring and ecosystem default.',
          adoptionRisks: 'The biggest risk is narrower employer demand and fewer default-enterprise patterns.',
          effortEstimate: 'medium',
          outlook90d: 'Likely to stay well-liked, but not guaranteed to break into top-tier hiring demand soon.',
        },
      },
    })

    expect(result.verdict).toMatch(/high upside/i)
    expect(result.bestFor.join(' ')).toMatch(/developer experience/i)
    expect(result.notIdealFor.join(' ')).toMatch(/safest hiring/i)
    expect(result.whyThisIsMoving.join(' ')).toMatch(/community enthusiasm/i)
  })

  it('synthesizes a differentiated verdict when the AI headline is generic', () => {
    const result = buildDecisionFirstSummary({
      techName: 'Go',
      techSlug: 'go',
      category: 'language',
      compositeScore: 54.82,
      momentum: -8.21,
      jobsScore: 67.75,
      githubScore: 71.38,
      communityScore: 64.83,
      ecosystemScore: null,
      confidenceGrade: 'B',
      rank: 1,
      totalRanked: 20,
      aiInsight: {
        headline: 'Go AI analysis',
        trendNarrative: 'Go ranks #1 of 20 in language. Momentum is volatile, with 7d -1.9, 30d -0.1, and 90d -1.0 movement.',
        riskFactors: 'Weakest dimension is community buzz at 64.83/100.',
        careerAdvice: 'Go is better treated as situational than core right now.',
      },
    })

    expect(result.verdict).toContain('Go ranks #1 of 20 in language.')
    expect(result.verdict).toContain('Main caveat:')
    expect(result.verdict).toContain('weakest dimension is community buzz')
  })
})
