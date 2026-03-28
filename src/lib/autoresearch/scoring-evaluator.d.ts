export interface ScoringFixtureSectionReport {
  id: string
  weight: number
  passed: boolean
  score: number
  failures: string[]
}

export interface ScoringFixtureReport {
  track: 'scoring'
  metric: number
  failures: string[]
  sections: ScoringFixtureSectionReport[]
}

export function evaluateScoringFixtureSet(
  fixturePath?: string,
): Promise<ScoringFixtureReport>
