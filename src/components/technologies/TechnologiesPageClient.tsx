'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTechnologies } from '@/hooks/useTechnologies'
import { useTechStats } from '@/hooks/useTechStats'
import { MoversShakers } from '@/components/technologies/MoversShakers'
import { SmartFilters, applySmartFilter, getFilterEmptyMessage, type SmartFilter } from '@/components/technologies/SmartFilters'
import { TechCard } from '@/components/technologies/TechCard'
import { TechTable } from '@/components/technologies/TechTable'
import { ViewToggle, type ViewMode } from '@/components/technologies/ViewToggle'
import { MarketBubbleMap } from '@/components/technologies/MarketBubbleMap'
import { MarketPulse } from '@/components/technologies/MarketPulse'
import { CategoryHealth } from '@/components/technologies/CategoryHealth'
import { WeeklyDigest } from '@/components/technologies/WeeklyDigest'
import { LiveContextStrip } from '@/components/technologies/LiveContextStrip'
import PopularStacks from '@/components/technologies/PopularStacks'
import MethodologyPanel from '@/components/technologies/MethodologyPanel'
import { Loading } from '@/components/ui/loading'
import { DotPattern } from '@/components/ui/dot-pattern'
import { WordPullUp } from '@/components/ui/word-pull-up'
import type { TechnologyCategory, TechnologyWithScore } from '@/types'
import { CATEGORY_LABELS } from '@/types'

type SortKey = 'score' | 'jobs' | 'momentum' | 'name'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'score',    label: 'Score' },
  { value: 'jobs',     label: 'Job Demand' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'name',     label: 'Name' },
]

function sortTechnologies(techs: TechnologyWithScore[], key: SortKey): TechnologyWithScore[] {
  return [...techs].sort((a, b) => {
    if (key === 'name')     return a.name.localeCompare(b.name)
    if (key === 'jobs')     return (b.jobs_score ?? 0) - (a.jobs_score ?? 0)
    if (key === 'momentum') return (b.momentum ?? 0) - (a.momentum ?? 0)
    return (b.composite_score ?? 0) - (a.composite_score ?? 0)
  })
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function TechnologiesPageClient() {
  const prefersReducedMotion = useReducedMotion()

  const [searchQuery, setSearchQuery]           = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TechnologyCategory | 'all'>('all')
  const [smartFilter, setSmartFilter]           = useState<SmartFilter>('all')
  const [sortKey, setSortKey]                   = useState<SortKey>('score')
  const [viewMode, setViewMode]                 = useState<ViewMode>('cards')

  const { technologies: allTechnologies, lastUpdated, isLoading, isError, error, refetch } = useTechnologies()
  const { stats, isLoading: statsLoading, isError: statsError } = useTechStats()

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
    let result = applySmartFilter([...allTechnologies], smartFilter)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      )
    }

    if (selectedCategory !== 'all' && smartFilter === 'all') {
      result = result.filter((t) => t.category === selectedCategory)
    }

    return sortTechnologies(result, sortKey)
  }, [allTechnologies, searchQuery, selectedCategory, smartFilter, sortKey])

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
    <div className="relative container mx-auto max-w-7xl px-4 py-8">
      <DotPattern className="opacity-40" />

      {/* ① Page Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-8 relative"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          <WordPullUp text="Technology Explorer" />
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground">
            {allTechnologies.length} technologies — find what&apos;s worth learning in 2026
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Updated daily
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground/60">
              Last run:{' '}
              {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </motion.div>

      {/* ② Market Pulse */}
      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <MarketPulse
          data={stats?.market_pulse ?? null}
          isLoading={statsLoading}
          isError={statsError}
        />
      </motion.div>

      {/* ③ Category Health */}
      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mb-8"
      >
        <CategoryHealth
          data={stats?.category_health ?? null}
          isLoading={statsLoading}
          isError={statsError}
          onCategoryClick={handleCategoryClick}
        />
      </motion.div>

      {/* ④ Movers & Shakers */}
      <MoversShakers />

      {/* ⑤ Weekly Digest */}
      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mb-6"
      >
        <WeeklyDigest
          data={stats?.weekly_digest ?? null}
          isLoading={statsLoading}
          isError={statsError}
        />
      </motion.div>

      {/* ⑥ Methodology Panel (collapsed by default) */}
      <div className="mb-8">
        <MethodologyPanel />
      </div>

      {/* ⑦ Smart Filters + Search + View Toggle */}
      <div id="tech-results">
        <SmartFilters activeFilter={smartFilter} onFilterChange={handleSmartFilterChange} />

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
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

            {/* Category */}
            {smartFilter === 'all' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as TechnologyCategory | 'all')}
                className="rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-muted-foreground">Sort by</span>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortKey(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
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

          {/* View Toggle */}
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>

        {/* ⑧ Live context strip */}
        <LiveContextStrip filtered={filtered} total={allTechnologies.length} />

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No technologies match your search' : getFilterEmptyMessage(smartFilter)}
            </p>
          </div>
        )}

        {/* ⑩ Main Content — Cards / Table / Bubble Map */}
        {filtered.length > 0 && (
          <>
            {viewMode === 'overview' && (
              <div className="hidden md:block">
                <MarketBubbleMap technologies={filtered} />
              </div>
            )}
            {viewMode === 'overview' && (
              <div className="md:hidden flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">Switch to cards or table view on mobile</p>
              </div>
            )}
            {viewMode === 'table' && (
              <TechTable technologies={filtered} />
            )}
            {viewMode === 'cards' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {/* ⑪ Popular Stacks (bottom of page) */}
      <motion.div
        variants={prefersReducedMotion ? {} : sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-16"
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
