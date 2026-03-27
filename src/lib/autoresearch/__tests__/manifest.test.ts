import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildTrackRunPlan,
  loadAutoresearchManifest,
  validateChangedFilesForTrack,
} from '@/lib/autoresearch/manifest'

const manifestPath = path.resolve(process.cwd(), 'autoresearch', 'manifest.json')

describe('autoresearch manifest', () => {
  it('loads scoring and routing track definitions from the committed manifest', async () => {
    const manifest = await loadAutoresearchManifest(manifestPath)

    expect(Object.keys(manifest.tracks)).toEqual(['scoring', 'routing'])
    expect(manifest.results.file).toBe('autoresearch/results.tsv')
    expect(manifest.tracks.scoring.fixture).toContain('fixtures/scoring')
    expect(manifest.tracks.routing.fixture).toContain('fixtures/routing')
  })

  it('flags changed files outside the selected track allowlist', async () => {
    const manifest = await loadAutoresearchManifest(manifestPath)

    expect(
      validateChangedFilesForTrack(manifest, 'scoring', [
        'src/lib/scoring/adaptive-weights.ts',
      ]),
    ).toEqual([])

    expect(
      validateChangedFilesForTrack(manifest, 'scoring', ['src/lib/ai/router.ts']),
    ).toEqual(['src/lib/ai/router.ts'])

    expect(
      validateChangedFilesForTrack(manifest, 'routing', ['src/lib/ai/router.ts']),
    ).toEqual([])
  })

  it('builds a dry-run plan that points at the correct evaluator and results file', async () => {
    const manifest = await loadAutoresearchManifest(manifestPath)
    const plan = buildTrackRunPlan(manifest, 'routing', true)

    expect(plan.track).toBe('routing')
    expect(plan.dryRun).toBe(true)
    expect(plan.evaluatorScript).toBe('scripts/autoresearch-eval-routing.mjs')
    expect(plan.resultsFile).toBe('autoresearch/results.tsv')
  })
})
