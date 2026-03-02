import { describe, it, expect } from 'vitest'
import { scorePair, reweightForCareer, reweightForStack } from '@/lib/scoring/pair-scoring'

const highTech = {
  slug: 'react',
  composite_score: 80, github_score: 75, community_score: 80,
  jobs_score: 85, ecosystem_score: 78, momentum: 8, data_completeness: 0.95,
}
const medTech = {
  slug: 'typescript',
  composite_score: 65, github_score: 60, community_score: 65,
  jobs_score: 70, ecosystem_score: 72, momentum: 5, data_completeness: 0.85,
}
const lowTech = {
  slug: 'elm',
  composite_score: 25, github_score: 22, community_score: 18,
  jobs_score: 12, ecosystem_score: 20, momentum: -3, data_completeness: 0.4,
}
const negTech = {
  slug: 'coffeescript',
  composite_score: 30, github_score: 28, community_score: 22,
  jobs_score: 15, ecosystem_score: 25, momentum: -10, data_completeness: 0.5,
}
const hypeTech = {
  slug: 'buzz',
  composite_score: 55, github_score: 50, community_score: 80,
  jobs_score: 10, ecosystem_score: 35, momentum: 12, data_completeness: 0.7,
}

describe('scorePair', () => {
  it('high+medium pair scores above 60', () => {
    const result = scorePair(highTech, medTech)
    expect(result.pairScore).toBeGreaterThan(60)
  })

  it('high+high pair scores better than high+low pair', () => {
    const highMed = scorePair(highTech, medTech)
    const highLow = scorePair(highTech, lowTech)
    expect(highMed.pairScore).toBeGreaterThan(highLow.pairScore)
  })

  it('divergent-momentum flag fires when momenta strongly oppose', () => {
    const pos = { ...highTech, momentum: 12 }
    const neg = { ...negTech, momentum: -10 }
    const result = scorePair(pos, neg)
    expect(result.riskFlags).toContain('divergent-momentum')
  })

  it('both-declining flag fires when both negative and one below -5', () => {
    const d1 = { ...lowTech, momentum: -8 }
    const d2 = { ...negTech, momentum: -7 }
    const result = scorePair(d1, d2)
    expect(result.riskFlags).toContain('both-declining')
  })

  it('hype-without-jobs flag fires when community > 70 and jobs < 25', () => {
    const result = scorePair(highTech, hypeTech)
    expect(result.riskFlags).toContain('hype-without-jobs')
  })

  it('low-data flag fires when min completeness < 0.3', () => {
    const sparse = { ...lowTech, data_completeness: 0.1 }
    const result = scorePair(sparse, lowTech)
    expect(result.riskFlags).toContain('low-data')
  })

  it('confidence is A or B for two high-quality techs', () => {
    const result = scorePair(highTech, medTech)
    expect(['A', 'B']).toContain(result.pairConfidence)
  })

  it('whyPair has at least 1 entry', () => {
    const result = scorePair(highTech, medTech)
    expect(result.whyPair.length).toBeGreaterThanOrEqual(1)
  })

  it('returns all 5 compatibility dimensions', () => {
    const result = scorePair(highTech, medTech)
    expect(result.compatibility).toMatchObject({
      demandSynergy: expect.any(Number),
      momentumAlignment: expect.any(Number),
      ecosystemFit: expect.any(Number),
      communityValidation: expect.any(Number),
      maturityBalance: expect.any(Number),
    })
  })
})

describe('reweightForCareer', () => {
  it('produces a valid score in 0-100 range', () => {
    const base = scorePair(highTech, medTech)
    const result = reweightForCareer(base)
    expect(result.pairScore).toBeGreaterThanOrEqual(0)
    expect(result.pairScore).toBeLessThanOrEqual(100)
  })

  it('career scores high-demand pair above low-demand pair', () => {
    const highDemand = reweightForCareer(scorePair(highTech, medTech))
    const lowDemand = reweightForCareer(scorePair(highTech, lowTech))
    expect(highDemand.pairScore).toBeGreaterThan(lowDemand.pairScore)
  })
})

describe('reweightForStack', () => {
  it('produces a valid score in 0-100 range', () => {
    const base = scorePair(highTech, medTech)
    const result = reweightForStack(base)
    expect(result.pairScore).toBeGreaterThanOrEqual(0)
    expect(result.pairScore).toBeLessThanOrEqual(100)
  })
})
