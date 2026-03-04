import { describe, it, expect } from 'vitest'
import { selectPath, computeWeb3PathRecommendation } from '@/lib/quiz/web3-path-engine'
import type { QuizAnswer } from '@/lib/quiz/types'

function makeAnswers(overrides: Partial<Record<string, string>> = {}): QuizAnswer[] {
  const defaults: Record<string, string> = {
    goal: 'defi',
    background: 'web-dev',
    ecosystem: 'evm',
    priority: 'jobs',
    timeline: '3mo',
    ...overrides,
  }
  return Object.entries(defaults).map(([questionId, value]) => ({ questionId, value }))
}

describe('selectPath()', () => {
  it('returns ethereum as top chain when ecosystem=evm and goal=defi', () => {
    const ranked = selectPath(makeAnswers({ ecosystem: 'evm', goal: 'defi' }))
    expect(ranked[0].chain.id).toBe('ethereum')
  })

  it('returns solana as top chain when ecosystem=solana and goal=nft-game', () => {
    // priority='startup' avoids ethereum jobs bonus; background='systems' boosts rust chains
    const ranked = selectPath(makeAnswers({ ecosystem: 'solana', goal: 'nft-game', priority: 'startup', background: 'systems' }))
    expect(ranked[0].chain.id).toBe('solana')
  })

  it('returns starknet as top chain when ecosystem=zk', () => {
    // priority='research' boosts starknet; background='systems' avoids web-dev intermediate bonus
    const ranked = selectPath(makeAnswers({ ecosystem: 'zk', goal: 'infra', priority: 'research', background: 'systems' }))
    expect(ranked[0].chain.id).toBe('starknet')
  })

  it('boosts ethereum for ecosystem=no-pref', () => {
    const ranked = selectPath(makeAnswers({ ecosystem: 'no-pref', goal: 'dapp' }))
    // Ethereum gets 10pt bonus for no-pref + 15pt for dapp goal
    expect(ranked[0].chain.id).toBe('ethereum')
  })

  it('returns 4 ranked chains (one per profile)', () => {
    const ranked = selectPath(makeAnswers())
    expect(ranked).toHaveLength(4)
  })

  it('ranks chains in descending score order', () => {
    const ranked = selectPath(makeAnswers())
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score)
    }
  })

  it('penalises advanced chains for beginner+1mo timeline', () => {
    const ranked = selectPath(makeAnswers({
      background: 'beginner',
      timeline: '1mo',
      ecosystem: 'no-pref',
      priority: 'learn',
      goal: 'dapp',
    }))
    // Ethereum (intermediate difficulty) should beat solana/starknet (advanced) for beginners
    expect(ranked[0].chain.difficulty).toBe('intermediate')
  })
})

describe('computeWeb3PathRecommendation()', () => {
  it('returns required top-level shape', () => {
    const result = computeWeb3PathRecommendation(makeAnswers())
    expect(result.primary).toBeDefined()
    expect(result.primary.action).toBeTruthy()
    expect(Array.isArray(result.primary.reasoning)).toBe(true)
    expect(result.primary.reasoning!.length).toBeGreaterThan(0)
    expect(Array.isArray(result.nextSteps)).toBe(true)
    expect(Array.isArray(result.relatedLinks)).toBe(true)
  })

  it('nextSteps is non-empty for all three ecosystem paths', () => {
    for (const ecosystem of ['evm', 'solana', 'zk'] as const) {
      const result = computeWeb3PathRecommendation(makeAnswers({ ecosystem }))
      expect(result.nextSteps.length).toBeGreaterThan(0)
    }
  })

  it('includes secondary recommendation', () => {
    const result = computeWeb3PathRecommendation(makeAnswers())
    expect(result.secondary).toBeDefined()
    expect(result.secondary!.action).toBeTruthy()
  })

  it('sets technology slug from chain techSlugs[0]', () => {
    const result = computeWeb3PathRecommendation(makeAnswers({ ecosystem: 'evm', goal: 'defi' }))
    // Ethereum → first techSlug is 'solidity'
    expect(result.primary.technology).toBe('solidity')
  })

  it('includes relatedLinks with /technologies paths', () => {
    const result = computeWeb3PathRecommendation(makeAnswers())
    const techLinks = result.relatedLinks.filter((l) => l.href.startsWith('/technologies/'))
    expect(techLinks.length).toBeGreaterThan(0)
  })

  it('emits warnings for beginner + advanced chain combination', () => {
    // Force starknet (advanced) as top: zk ecosystem + research priority + infra goal
    const result = computeWeb3PathRecommendation(makeAnswers({
      background: 'beginner',
      ecosystem: 'zk',
      priority: 'research',
      goal: 'infra',
    }))
    expect(Array.isArray(result.warnings)).toBe(true)
    expect(result.warnings!.length).toBeGreaterThan(0)
  })
})
