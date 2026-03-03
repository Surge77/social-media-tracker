export type PulseEntry = {
  technology_id: string
  momentum: number
  score_delta: number
}

type SelectCoolingOptions = {
  hasPreviousData: boolean
  hottestTechnologyId?: string
}

export function selectCoolingEntry<T extends PulseEntry>(
  entries: T[],
  options: SelectCoolingOptions
): T | null {
  const filtered = entries.filter(
    (entry) => entry.technology_id !== options.hottestTechnologyId
  )

  if (filtered.length === 0) return null

  if (options.hasPreviousData) {
    const coolingCandidates = filtered.filter((entry) => entry.score_delta < 0)
    if (coolingCandidates.length === 0) return null
    return [...coolingCandidates].sort(
      (a, b) => a.score_delta - b.score_delta
    )[0]
  }

  const momentumCandidates = filtered.filter((entry) => entry.momentum < 0)
  if (momentumCandidates.length === 0) return null
  return [...momentumCandidates].sort((a, b) => a.momentum - b.momentum)[0]
}
