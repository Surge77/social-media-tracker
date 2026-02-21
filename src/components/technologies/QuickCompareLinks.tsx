import Link from 'next/link'

import type { TechnologyWithScore } from '@/types'

interface QuickCompareLinksProps {
  technology: TechnologyWithScore
  allTechnologies: TechnologyWithScore[]
}

interface Suggestion {
  name: string
  slug: string
}

function getSuggestions(
  technology: TechnologyWithScore,
  allTechnologies: TechnologyWithScore[],
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const usedSlugs = new Set<string>([technology.slug])

  // Candidates in the same category, sorted by closeness of composite_score
  const sameCategory = allTechnologies
    .filter(
      (t) =>
        t.slug !== technology.slug &&
        t.category === technology.category &&
        t.composite_score !== null,
    )
    .sort((a, b) => {
      const aDiff = Math.abs((a.composite_score ?? 0) - (technology.composite_score ?? 0))
      const bDiff = Math.abs((b.composite_score ?? 0) - (technology.composite_score ?? 0))
      return aDiff - bDiff
    })

  // Suggestion 1: same category, closest score
  if (sameCategory[0]) {
    suggestions.push({ name: sameCategory[0].name, slug: sameCategory[0].slug })
    usedSlugs.add(sameCategory[0].slug)
  }

  // Suggestion 2: same category, second closest score
  const secondClosest = sameCategory.find((t) => !usedSlugs.has(t.slug))
  if (secondClosest) {
    suggestions.push({ name: secondClosest.name, slug: secondClosest.slug })
    usedSlugs.add(secondClosest.slug)
  }

  // Suggestion 3: same ecosystem, different category, highest composite_score
  if (technology.ecosystem) {
    const sameEcosystem = allTechnologies
      .filter(
        (t) =>
          !usedSlugs.has(t.slug) &&
          t.ecosystem === technology.ecosystem &&
          t.category !== technology.category &&
          t.composite_score !== null,
      )
      .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))

    if (sameEcosystem[0]) {
      suggestions.push({ name: sameEcosystem[0].name, slug: sameEcosystem[0].slug })
    }
  }

  return suggestions
}

export default function QuickCompareLinks({
  technology,
  allTechnologies,
}: QuickCompareLinksProps) {
  const suggestions = getSuggestions(technology, allTechnologies)

  if (suggestions.length === 0) return null

  return (
    <p className="text-[11px] text-muted-foreground leading-none flex flex-wrap items-center gap-x-1 gap-y-0.5">
      <span className="font-medium text-muted-foreground/70">Compare:</span>
      {suggestions.map((suggestion, index) => (
        <span key={suggestion.slug} className="inline-flex items-center gap-x-1">
          <Link
            href={`/compare?techs=${encodeURIComponent(`${technology.slug},${suggestion.slug}`)}`}
            className="text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-muted-foreground/40 hover:decoration-foreground/60"
          >
            {suggestion.name}
          </Link>
          {index < suggestions.length - 1 && (
            <span className="text-muted-foreground/40" aria-hidden="true">
              ·
            </span>
          )}
        </span>
      ))}
    </p>
  )
}
