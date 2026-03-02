import { describe, expect, it } from 'vitest'
import { checkInsightQuality } from '@/lib/ai/quality-monitor'

const inputContext = `
COMPOSITE SCORE: 78
GitHub Activity: 84
Community Buzz: 76
Job Market: 81
Ecosystem Health: 72
CATEGORY RANK: #3 of 24
sourceCoverage: 82
`

describe('checkInsightQuality', () => {
  it('fails when pros/cons are missing', () => {
    const insight = {
      headline: 'React remains a pragmatic frontend pick',
      learningPriority: 'high',
      trendNarrative: 'Score is 78 with #3 rank and stable momentum.',
      careerAdvice: 'Learn it for broad job optionality.',
      riskFactors: 'Crowded talent pool and rapid framework churn.',
      scoreExplanation: 'High GitHub and jobs keep the score elevated.',
      momentumContext: 'Momentum is positive over 30 and 90 days.',
      lifecycleStage: 'mainstream',
      confidenceNote: 'Coverage is 82% across sources.',
      lastUpdated: '2026-03-02T10:00:00.000Z',
    }

    const result = checkInsightQuality(insight, inputContext, 'B')
    expect(result.passed).toBe(false)
  })

  it('fails when pros/cons are generic and low signal', () => {
    const insight = {
      headline: 'React remains a pragmatic frontend pick',
      learningPriority: 'high',
      trendNarrative: 'Score is 78 with #3 rank and stable momentum.',
      careerAdvice: 'Learn it for broad job optionality.',
      riskFactors: 'Crowded talent pool and rapid framework churn.',
      scoreExplanation: 'High GitHub and jobs keep the score elevated.',
      momentumContext: 'Momentum is positive over 30 and 90 days.',
      lifecycleStage: 'mainstream',
      confidenceNote: 'Coverage is 82% across sources.',
      lastUpdated: '2026-03-02T10:00:00.000Z',
      pros: ['Good performance', 'Easy to use', 'Popular'],
      cons: ['Can be hard', 'Not always best', 'Depends on project'],
      practicalAnalysis: {
        bestFitUseCases: 'General web apps.',
        avoidIf: 'You want something else.',
        adoptionRisks: 'It may change.',
        effortEstimate: 'medium',
        outlook90d: 'Likely fine.',
      },
    }

    const result = checkInsightQuality(insight, inputContext, 'B')
    expect(result.passed).toBe(false)
  })
})
