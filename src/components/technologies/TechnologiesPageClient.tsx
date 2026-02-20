'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTechnologies } from '@/hooks/useTechnologies'
import { MoversShakers } from '@/components/technologies/MoversShakers'
import { StackCheckCTA } from '@/components/technologies/StackCheckCTA'
import { SmartFilters, applySmartFilter, getFilterEmptyMessage, type SmartFilter } from '@/components/technologies/SmartFilters'
import { ViewToggle, type ViewMode } from '@/components/technologies/ViewToggle'
import { StrategicOverview } from '@/components/technologies/StrategicOverview'
import { TechTable } from '@/components/technologies/TechTable'
import { TechCard } from '@/components/technologies/TechCard'
import { Loading } from '@/components/ui/loading'
import type { TechnologyCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

export function TechnologiesPageClient() {
  const prefersReducedMotion = useReducedMotion()

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all')
  const [smartFilter, setSmartFilter] = useState<SmartFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  // Use React Query hook — handles caching, dedup, and refetch (OPT-04)
  const { technologies: allTechnologies, lastUpdated, isLoading, isError, error, refetch } = useTechnologies()

  // Handle smart filter change
  const handleSmartFilterChange = useCallback((filter: SmartFilter) => {
    setSmartFilter(filter)
    // Reset category when switching to a smart filter
    if (filter !== 'all') {
      setSelectedCategory('all')
    }
  }, [])

  // Filter and sort technologies
  const filteredAndSorted = useMemo(() => {
    let result = [...allTechnologies]

    // Apply smart filter first
    result = applySmartFilter(result, smartFilter)

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (tech) =>
          tech.name.toLowerCase().includes(query) ||
          tech.description.toLowerCase().includes(query) ||
          tech.slug.toLowerCase().includes(query)
      )
    }

    // Filter by category (only if smart filter is 'all')
    if (selectedCategory !== 'all' && smartFilter === 'all') {
      result = result.filter((tech) => tech.category === selectedCategory)
    }

    return result
  }, [allTechnologies, searchQuery, selectedCategory, smartFilter])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <Loading size="lg" text="Loading technologies..." />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">
              Error: {error instanceof Error ? error.message : 'Failed to load technologies'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Technology Intelligence
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track {allTechnologies.length} technologies across 8 categories
          {lastUpdated && (
            <span className="ml-2 text-xs">
              • Last updated:{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </p>
      </motion.div>

      {/* Movers & Shakers Hero */}
      <MoversShakers />

      {/* Stack Check CTA */}
      <StackCheckCTA technologies={allTechnologies} />

      {/* Smart Filters */}
      <SmartFilters activeFilter={smartFilter} onFilterChange={handleSmartFilterChange} />

      {/* Search + Category + View Toggle */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technologies..."
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Category filter (only when smart filter is 'all') */}
          {smartFilter === 'all' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TechnologyCategory | 'all')}
              className="rounded-lg border bg-background px-4 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Toggle */}
        <ViewToggle view={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'technology' : 'technologies'}
        </p>
      </div>

      {/* Empty state */}
      {filteredAndSorted.length === 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'No technologies match your search'
                : getFilterEmptyMessage(smartFilter)}
            </p>
          </div>
        </div>
      )}

      {/* Content based on view mode */}
      {filteredAndSorted.length > 0 && (
        <>
          {/* Overview */}
          {viewMode === 'overview' && (
            <div className="hidden sm:block">
              <StrategicOverview technologies={filteredAndSorted} />
            </div>
          )}

          {/* Table View (desktop) */}
          {viewMode === 'table' && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.4 }}
              className="hidden md:block"
            >
              <TechTable technologies={filteredAndSorted} />
            </motion.div>
          )}

          {/* Cards View or Mobile fallback */}
          {(viewMode === 'cards' || viewMode === 'table') && (
            <div className={viewMode === 'cards' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-4 md:hidden'}>
              {filteredAndSorted.map((tech, index) => (
                <TechCard key={tech.id} technology={tech} index={index} />
              ))}
            </div>
          )}

          {/* Overview mobile fallback — just show cards, no confusing message */}
          {viewMode === 'overview' && (
            <div className="grid gap-4 sm:hidden">
              {filteredAndSorted.slice(0, 10).map((tech, index) => (
                <TechCard key={tech.id} technology={tech} index={index} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
