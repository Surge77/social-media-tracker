'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTechnologies } from '@/hooks/useTechnologies'
import { useTechStats } from '@/hooks/useTechStats'
import { MoversShakers } from '@/components/technologies/MoversShakers'
import { SmartFilters, getFilterEmptyMessage, type SmartFilter } from '@/components/technologies/SmartFilters'
import { TechCard } from '@/components/technologies/TechCard'
import { TechTable } from '@/components/technologies/TechTable'
import { ViewToggle, type ViewMode } from '@/components/technologies/ViewToggle'
import { TechHeatmap } from '@/components/technologies/TechHeatmap'
import { MarketPulse } from '@/components/technologies/MarketPulse'
import { CategoryHealth } from '@/components/technologies/CategoryHealth'
import { WeeklyDigest } from '@/components/technologies/WeeklyDigest'
import { LiveContextStrip } from '@/components/technologies/LiveContextStrip'
import PopularStacks from '@/components/technologies/PopularStacks'
import MethodologyPanel from '@/components/technologies/MethodologyPanel'
import { MetricsGlossary } from '@/components/technologies/MetricsGlossary'
import { Loading } from '@/components/ui/loading'
import { DotPattern } from '@/components/ui/dot-pattern'
import { WordPullUp } from '@/components/ui/word-pull-up'
import type { TechnologyCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { filterTechnologiesForDisplay, type SortKey } from '@/components/technologies/filtering'
import type {
  TechnologiesResponse,
  TechStatsResponse,
} from '@/lib/server/technology-data'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'score', label: 'Score' },
  { value: 'jobs', label: 'Job Demand' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'name', label: 'Name' },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

type TechnologiesPageClientProps = {
  initialTechnologies?: TechnologiesResponse | null
  initialStats?: TechStatsResponse | null
}

export function TechnologiesPageClient({
  initialTechnologies = null,
  initialStats = null,
}: TechnologiesPageClientProps) {
  const prefersReducedMotion = useReducedMotion()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all')
  const [smartFilter, setSmartFilter] = useState<SmartFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')

  const {
    technologies: allTechnologies,
    lastUpdated,
    isLoading,
    isError,
    error,
    refetch,
  } = useTechnologies({ initialData: initialTechnologies })
  const { stats, isLoading: statsLoading, isError: statsError } = useTechStats(initialStats)

  const handleSmartFilterChange = useCallback((filter: SmartFilter) => {
    setSmartFilter(filter)
    if (filter !== 'all') setSelectedCategory('all')
  }, [])

  const handleCategoryClick = useCallback((category: TechnologyCategory) => {
    setSelectedCategory(category)
    setSmartFilter('all')
    document.getElementById('tech-results')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const filtered = useMemo(() => {
    return filterTechnologiesForDisplay(allTechnologies, {
      searchQuery,
      selectedCategory,
      smartFilter,
      sortKey,
    })
  }, [allTechnologies, searchQuery, selectedCategory, smartFilter, sortKey])

  if (isLoading) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <Loading size="lg" text="Loading technologies..." />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="app-page py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load technologies'}
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
    <div className="relative app-page py-6 sm:py-8 lg:py-10">
      <DotPattern className="mobile-noise-hidden opacity-30" />

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="app-section relative"
      >
        <p className="app-eyebrow mb-3">Technology intelligence</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          <WordPullUp text="Technology Explorer" />
        </h1>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <p className="app-muted-copy">
            {allTechnologies.length} technologies - find what is worth learning in 2026
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Updated daily
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground/60">
              Last run:{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <div className="mt-4">
          <MetricsGlossary variant="list" />
        </div>
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        animate="visible"
        className="app-section-tight"
      >
        <MarketPulse
          data={stats?.market_pulse ?? null}
          isLoading={statsLoading}
          isError={statsError}
        />
      </motion.div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="app-section"
      >
        <CategoryHealth
          data={stats?.category_health ?? null}
          isLoading={statsLoading}
          isError={statsError}
          onCategoryClick={handleCategoryClick}
        />
      </motion.div>

      <MoversShakers />

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="app-section-tight"
      >
        <WeeklyDigest
          data={stats?.weekly_digest ?? null}
          isLoading={statsLoading}
          isError={statsError}
        />
      </motion.div>

      <div className="app-section">
        <MethodologyPanel />
      </div>

      <div id="tech-results">
        <SmartFilters activeFilter={smartFilter} onFilterChange={handleSmartFilterChange} />

        <div className="app-toolbar app-section-tight">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search technologies..."
                  className="w-full rounded-2xl border bg-background py-3 pl-10 pr-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {smartFilter === 'all' && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TechnologyCategory | 'all')}
                  className="rounded-2xl border bg-background px-3 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring lg:min-w-[13rem]"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <span className="shrink-0 text-xs text-muted-foreground">Sort by</span>
                <div className="app-chip-scroll rounded-2xl border border-border bg-background/70 p-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortKey(opt.value)}
                      className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                        sortKey === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        <LiveContextStrip filtered={filtered} total={allTechnologies.length} />

        {filtered.length === 0 && (
          <div className="app-surface-muted flex min-h-[300px] items-center justify-center border-dashed">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No technologies match your search' : getFilterEmptyMessage(smartFilter)}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {viewMode === 'overview' && <TechHeatmap technologies={filtered} />}
            {viewMode === 'table' && <TechTable technologies={filtered} />}
            {viewMode === 'cards' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((tech, i) => (
                  <TechCard
                    key={tech.id}
                    technology={tech}
                    rank={i + 1}
                    index={i}
                    allTechnologies={filtered}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 sm:mt-16"
      >
        <PopularStacks
          data={stats?.popular_stacks ?? null}
          isLoading={statsLoading}
          isError={statsError}
        />
      </motion.div>
    </div>
  )
}
