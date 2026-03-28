export interface RoutingFixtureCaseReport {
  id: string
  chosenProvider: string | null
  attemptedProviders: string[]
  passed: boolean
  score: number
  maxScore: number
  failures: string[]
}

export interface RoutingFixtureReport {
  track: 'routing'
  metric: number
  failures: string[]
  cases: RoutingFixtureCaseReport[]
}

export function evaluateRoutingFixtureSet(
  fixturePath?: string,
): Promise<RoutingFixtureReport>
