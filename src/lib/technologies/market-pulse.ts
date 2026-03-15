export type ScoredPulseEntry = {
  technology_id: string
  composite_score: number
  momentum: number
}

export type PulseEntry = ScoredPulseEntry & {
  score_delta: number
}

type SelectEntryOptions = {
  excludeTechnologyIds?: Iterable<string>
}

type SelectCoolingOptions = {
  hasPreviousData: boolean
  excludeTechnologyIds?: Iterable<string>
}

function filterExcluded<T extends ScoredPulseEntry>(
  entries: T[],
  excludeTechnologyIds?: Iterable<string>
): T[] {
  const excluded = new Set(excludeTechnologyIds ?? [])
  if (excluded.size === 0) return entries
  return entries.filter((entry) => !excluded.has(entry.technology_id))
}

export function selectTopScoreEntry<T extends ScoredPulseEntry>(
  entries: T[],
  options: SelectEntryOptions = {}
): T | null {
  const filtered = filterExcluded(entries, options.excludeTechnologyIds)
  if (filtered.length === 0) return null

  return [...filtered].sort((a, b) => {
    if (b.composite_score !== a.composite_score) {
      return b.composite_score - a.composite_score
    }
    return b.momentum - a.momentum
  })[0]
}

export function selectHottestEntry<T extends PulseEntry>(
  entries: T[],
  options: SelectCoolingOptions
): T | null {
  const filtered = filterExcluded(entries, options.excludeTechnologyIds)
  if (filtered.length === 0) return null

  if (options.hasPreviousData) {
    return [...filtered].sort((a, b) => {
      if (b.score_delta !== a.score_delta) {
        return b.score_delta - a.score_delta
      }
      if (b.momentum !== a.momentum) {
        return b.momentum - a.momentum
      }
      return b.composite_score - a.composite_score
    })[0]
  }

  return [...filtered].sort((a, b) => {
    if (b.momentum !== a.momentum) {
      return b.momentum - a.momentum
    }
    return b.composite_score - a.composite_score
  })[0]
}

export function selectHiddenGemEntry<T extends PulseEntry>(
  entries: T[],
  options: SelectEntryOptions = {}
): T | null {
  const filtered = filterExcluded(entries, options.excludeTechnologyIds)
  if (filtered.length === 0) return null

  const ranked = [...filtered].sort((a, b) => {
    if (b.score_delta !== a.score_delta) {
      return b.score_delta - a.score_delta
    }
    if (b.momentum !== a.momentum) {
      return b.momentum - a.momentum
    }
    return b.composite_score - a.composite_score
  })

  return (
    ranked.find(
      (entry) => entry.composite_score >= 40 && entry.composite_score <= 75
    ) ?? ranked[0] ?? null
  )
}

export function selectCoolingEntry<T extends PulseEntry>(
  entries: T[],
  options: SelectCoolingOptions
): T | null {
  const filtered = filterExcluded(entries, options.excludeTechnologyIds)

  if (filtered.length === 0) return null

  if (options.hasPreviousData) {
    const coolingCandidates = filtered.filter((entry) => entry.score_delta < 0)
    if (coolingCandidates.length === 0) {
      return [...filtered].sort((a, b) => a.score_delta - b.score_delta)[0]
    }
    return [...coolingCandidates].sort(
      (a, b) => a.score_delta - b.score_delta
    )[0]
  }

  const momentumCandidates = filtered.filter((entry) => entry.momentum < 0)
  if (momentumCandidates.length === 0) {
    return [...filtered].sort((a, b) => a.momentum - b.momentum)[0]
  }
  return [...momentumCandidates].sort((a, b) => a.momentum - b.momentum)[0]
}
