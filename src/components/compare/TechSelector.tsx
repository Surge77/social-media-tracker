'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Check, X, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TechnologyWithScore } from '@/types'

interface TechSelectorProps {
  availableTechnologies: TechnologyWithScore[]
  selectedSlugs: string[]
  onAdd: (slug: string) => void
  onRemove: (slug: string) => void
  maxSelections?: number
  className?: string
}

export const TechSelector = React.forwardRef<HTMLDivElement, TechSelectorProps>(
  ({ availableTechnologies, selectedSlugs, onAdd, onRemove, maxSelections = 4, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedTechs = availableTechnologies.filter((tech) =>
      selectedSlugs.includes(tech.slug)
    )

    const canAddMore = selectedSlugs.length < maxSelections

    // Smart suggestions based on selected technologies
    const getSuggestions = () => {
      if (selectedSlugs.length === 0 || searchQuery) return []

      const firstSelected = selectedTechs[0]
      if (!firstSelected) return []

      // Same category suggestions
      const sameCategorySuggestions = availableTechnologies
        .filter(tech =>
          tech.category === firstSelected.category &&
          !selectedSlugs.includes(tech.slug) &&
          tech.composite_score !== null
        )
        .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
        .slice(0, 3)

      return sameCategorySuggestions
    }

    const suggestions = getSuggestions()

    // Filter technologies for search results
    const filteredTechs = availableTechnologies
      .filter((tech) => !selectedSlugs.includes(tech.slug))
      .filter((tech) => {
        if (!searchQuery) return false // Only show when searching
        const query = searchQuery.toLowerCase()
        return (
          tech.name.toLowerCase().includes(query) ||
          tech.slug.toLowerCase().includes(query) ||
          tech.description.toLowerCase().includes(query)
        )
      })
      .slice(0, 10) // Limit to 10 results

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-2', className)}>
        {/* Selected tech badges */}
        {selectedTechs.map((tech) => (
          <div
            key={tech.slug}
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5',
              'text-sm font-medium text-foreground transition-all hover:border-primary/50'
            )}
          >
            <span>{tech.name}</span>
            <button
              onClick={() => onRemove(tech.slug)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Remove ${tech.name}`}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        ))}

        {/* Add button / Dropdown */}
        {canAddMore && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-1.5',
                'text-sm font-medium text-muted-foreground transition-all',
                'hover:border-primary hover:text-primary hover:bg-primary/5'
              )}
            >
              <Plus size={14} strokeWidth={2.5} />
              Add Technology
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div
                className={cn(
                  'absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-border',
                  'bg-card/95 backdrop-blur-xl shadow-2xl'
                )}
              >
                {/* Search input */}
                <div className="border-b border-border p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search technologies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        'h-9 w-full rounded-md border border-border bg-background/50 pl-9 pr-3 text-sm',
                        'placeholder:text-muted-foreground',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                      )}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto">
                  {/* Show suggestions when not searching */}
                  {!searchQuery && suggestions.length > 0 && (
                    <div className="p-1">
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Frequently Compared With {selectedTechs[0]?.name}
                      </div>
                      {suggestions.map((tech) => (
                        <button
                          key={tech.slug}
                          onClick={() => {
                            onAdd(tech.slug)
                            setSearchQuery('')
                            setIsOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left',
                            'transition-colors hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{tech.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              Same category: {tech.category}
                            </div>
                          </div>
                          {tech.composite_score !== null && (
                            <div className="flex-shrink-0 font-mono text-sm font-semibold text-primary">
                              {Math.round(tech.composite_score)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Show search results when searching */}
                  {searchQuery && filteredTechs.length > 0 && (
                    <div className="p-1">
                      {filteredTechs.map((tech) => (
                        <button
                          key={tech.slug}
                          onClick={() => {
                            onAdd(tech.slug)
                            setSearchQuery('')
                            setIsOpen(false)
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left',
                            'transition-colors hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{tech.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {tech.description}
                            </div>
                          </div>
                          {tech.composite_score !== null && (
                            <div className="flex-shrink-0 font-mono text-sm font-semibold text-primary">
                              {Math.round(tech.composite_score)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Empty states */}
                  {!searchQuery && suggestions.length === 0 && selectedSlugs.length > 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Search to add more technologies
                    </div>
                  )}

                  {!searchQuery && selectedSlugs.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      Search for technologies to compare
                    </div>
                  )}

                  {searchQuery && filteredTechs.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No technologies found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!canAddMore && (
          <div className="text-xs text-muted-foreground">
            Maximum {maxSelections} technologies
          </div>
        )}
      </div>
    )
  }
)

TechSelector.displayName = 'TechSelector'
