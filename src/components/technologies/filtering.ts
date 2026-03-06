import type { TechnologyCategory, TechnologyWithScore } from '@/types'
import { applySmartFilter, type SmartFilter } from '@/components/technologies/SmartFilters'

export type SortKey = 'score' | 'jobs' | 'momentum' | 'name'

export function sortTechnologies(techs: TechnologyWithScore[], key: SortKey): TechnologyWithScore[] {
  return [...techs].sort((a, b) => {
    if (key === 'name') return a.name.localeCompare(b.name)
    if (key === 'jobs') return (b.jobs_score ?? 0) - (a.jobs_score ?? 0)
    if (key === 'momentum') return (b.momentum ?? 0) - (a.momentum ?? 0)
    return (b.composite_score ?? 0) - (a.composite_score ?? 0)
  })
}

type FilterOptions = {
  searchQuery: string
  selectedCategory: TechnologyCategory | 'all'
  smartFilter: SmartFilter
  sortKey: SortKey
}

export function filterTechnologiesForDisplay(
  allTechnologies: TechnologyWithScore[],
  options: FilterOptions
): TechnologyWithScore[] {
  const { searchQuery, selectedCategory, smartFilter, sortKey } = options

  let result = smartFilter === 'all'
    ? [...allTechnologies]
    : applySmartFilter([...allTechnologies], smartFilter)

  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }

  if (selectedCategory !== 'all' && smartFilter === 'all') {
    result = result.filter((t) => t.category === selectedCategory)
  }

  return smartFilter === 'all'
    ? sortTechnologies(result, sortKey)
    : result
}
