export type AutoresearchTrackName = 'scoring' | 'routing'

export interface AutoresearchTrackConfig {
  description: string
  evaluatorScript: string
  fixture: string
  editable: string[]
}

export interface AutoresearchManifest {
  version: 1
  results: {
    file: string
    reportDir: string
    template: string
  }
  tracks: Record<AutoresearchTrackName, AutoresearchTrackConfig>
}

export interface AutoresearchTrackRunPlan {
  track: AutoresearchTrackName
  dryRun: boolean
  fixture: string
  evaluatorScript: string
  editable: string[]
  resultsFile: string
  reportDir: string
}

export function getDefaultManifestPath(): string
export function loadAutoresearchManifest(
  manifestPath?: string,
): Promise<AutoresearchManifest>
export function validateChangedFilesForTrack(
  manifest: AutoresearchManifest,
  track: AutoresearchTrackName,
  changedFiles: string[],
): string[]
export function buildTrackRunPlan(
  manifest: AutoresearchManifest,
  track: AutoresearchTrackName,
  dryRun?: boolean,
): AutoresearchTrackRunPlan
