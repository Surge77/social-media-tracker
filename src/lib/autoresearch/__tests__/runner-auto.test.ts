import { describe, expect, it, vi } from 'vitest'

import { runAutoresearchIteration } from '@/lib/autoresearch/runner.mjs'

const manifest = {
  version: 1,
  results: {
    file: 'autoresearch/results.tsv',
    reportDir: 'autoresearch/reports',
    template: 'autoresearch/results.template.tsv',
  },
  tracks: {
    scoring: {
      description: 'score experiments',
      evaluatorScript: 'scripts/autoresearch-eval-scoring.mjs',
      fixture: 'autoresearch/fixtures/scoring/baseline.json',
      editable: ['src/lib/scoring/adaptive-weights.ts'],
    },
    routing: {
      description: 'routing experiments',
      evaluatorScript: 'scripts/autoresearch-eval-routing.mjs',
      fixture: 'autoresearch/fixtures/routing/baseline.json',
      editable: ['src/lib/ai/router.ts'],
    },
  },
} as const

describe('runAutoresearchIteration', () => {
  it('keeps a candidate commit when the metric improves on the best kept score', async () => {
    const git = {
      getBranch: vi.fn().mockResolvedValue('autoresearch/scoring-mar27'),
      getChangedFiles: vi.fn().mockResolvedValue(['src/lib/scoring/adaptive-weights.ts']),
      getHeadCommit: vi.fn()
        .mockResolvedValueOnce('abc1234')
        .mockResolvedValueOnce('def5678'),
      addFiles: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      resetHardToHeadParent: vi.fn().mockResolvedValue(undefined),
    }
    const logging = {
      bestMetric: vi.fn().mockResolvedValue(91),
      writeReport: vi.fn().mockResolvedValue('autoresearch/reports/scoring-1.json'),
      appendResult: vi.fn().mockResolvedValue(undefined),
    }
    const evaluate = vi.fn().mockResolvedValue({ metric: 97.5, failures: [] })

    const result = await runAutoresearchIteration({
      manifest,
      track: 'scoring',
      description: 'boost sparse-data handling',
      git,
      logging,
      evaluate,
    })

    expect(result.decision).toBe('keep')
    expect(result.metric).toBe(97.5)
    expect(git.addFiles).toHaveBeenCalledWith(['src/lib/scoring/adaptive-weights.ts'])
    expect(git.commit).toHaveBeenCalledWith('autoresearch(scoring): boost sparse-data handling')
    expect(git.resetHardToHeadParent).not.toHaveBeenCalled()
    expect(logging.appendResult).toHaveBeenCalledWith({
      commit: 'def5678',
      track: 'scoring',
      metric: 97.5,
      status: 'keep',
      description: 'boost sparse-data handling',
      reportPath: 'autoresearch/reports/scoring-1.json',
    })
  })

  it('discards a candidate commit when the metric does not beat the best kept score', async () => {
    const git = {
      getBranch: vi.fn().mockResolvedValue('autoresearch/routing-mar27'),
      getChangedFiles: vi.fn().mockResolvedValue(['src/lib/ai/router.ts']),
      getHeadCommit: vi.fn()
        .mockResolvedValueOnce('abc1234')
        .mockResolvedValueOnce('fedcba9'),
      addFiles: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      resetHardToHeadParent: vi.fn().mockResolvedValue(undefined),
    }
    const logging = {
      bestMetric: vi.fn().mockResolvedValue(100),
      writeReport: vi.fn().mockResolvedValue('autoresearch/reports/routing-1.json'),
      appendResult: vi.fn().mockResolvedValue(undefined),
    }
    const evaluate = vi.fn().mockResolvedValue({ metric: 99.25, failures: [] })

    const result = await runAutoresearchIteration({
      manifest,
      track: 'routing',
      description: 'swap fallback order',
      git,
      logging,
      evaluate,
    })

    expect(result.decision).toBe('discard')
    expect(git.commit).toHaveBeenCalledWith('autoresearch(routing): swap fallback order')
    expect(git.resetHardToHeadParent).toHaveBeenCalledOnce()
    expect(logging.appendResult).toHaveBeenCalledWith({
      commit: 'fedcba9',
      track: 'routing',
      metric: 99.25,
      status: 'discard',
      description: 'swap fallback order',
      reportPath: 'autoresearch/reports/routing-1.json',
    })
  })

  it('refuses to run on main even when the changed files are allowlisted', async () => {
    const git = {
      getBranch: vi.fn().mockResolvedValue('main'),
      getChangedFiles: vi.fn().mockResolvedValue(['src/lib/scoring/adaptive-weights.ts']),
      getHeadCommit: vi.fn(),
      addFiles: vi.fn(),
      commit: vi.fn(),
      resetHardToHeadParent: vi.fn(),
    }
    const logging = {
      bestMetric: vi.fn(),
      writeReport: vi.fn(),
      appendResult: vi.fn(),
    }
    const evaluate = vi.fn()

    await expect(
      runAutoresearchIteration({
        manifest,
        track: 'scoring',
        description: 'unsafe branch attempt',
        git,
        logging,
        evaluate,
      }),
    ).rejects.toThrow(/non-main branch/i)
  })
})
