import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { z } from 'zod'

const trackConfigSchema = z.object({
  description: z.string(),
  evaluatorScript: z.string(),
  fixture: z.string(),
  editable: z.array(z.string()).min(1),
})

const manifestSchema = z.object({
  version: z.literal(1),
  results: z.object({
    file: z.string(),
    reportDir: z.string(),
    template: z.string(),
  }),
  tracks: z.object({
    scoring: trackConfigSchema,
    routing: trackConfigSchema,
  }),
})

export function getDefaultManifestPath() {
  return path.resolve(process.cwd(), 'autoresearch', 'manifest.json')
}

export async function loadAutoresearchManifest(manifestPath = getDefaultManifestPath()) {
  const raw = await readFile(manifestPath, 'utf8')
  return manifestSchema.parse(JSON.parse(raw))
}

function normalizeRelativePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '')
}

export function validateChangedFilesForTrack(manifest, track, changedFiles) {
  const editable = new Set(manifest.tracks[track].editable.map(normalizeRelativePath))

  return changedFiles
    .map(normalizeRelativePath)
    .filter((filePath) => !editable.has(filePath))
}

export function buildTrackRunPlan(manifest, track, dryRun = false) {
  const config = manifest.tracks[track]

  return {
    track,
    dryRun,
    fixture: config.fixture,
    evaluatorScript: config.evaluatorScript,
    editable: [...config.editable],
    resultsFile: manifest.results.file,
    reportDir: manifest.results.reportDir,
  }
}
