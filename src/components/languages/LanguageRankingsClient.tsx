'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LanguageRow } from '@/components/languages/LanguageRow'
import { LanguageRisingStars } from '@/components/languages/LanguageRisingStars'
import { LANG_CATEGORIES, CATEGORIES, LANG_COLORS } from '@/components/languages/constants'
import { Loading } from '@/components/ui/loading'
import type { LanguageRanking, MarketFit } from '@/components/languages/LanguageRow'

type SortField = 'popularity_index' | 'github_repos_count' | 'stackoverflow_questions' | 'job_listings'
type SortDir   = 'asc' | 'desc'
type Trend     = 'all' | 'rising' | 'stable' | 'falling'

function SortIcon({ field, active, dir }: { field: string; active: string; dir: SortDir }) {
  if (field !== active) return <ChevronsUpDown size={11} className="text-muted-foreground/40" />
  return dir === 'asc'
    ? <ChevronUp size={11} className="text-foreground" />
    : <ChevronDown size={11} className="text-foreground" />
}

/** Top language per category, ordered by rank */
function useCategoryLeaders(rankings: LanguageRanking[]) {
  return React.useMemo(() => {
    const leaders: Record<string, LanguageRanking> = {}
    for (const r of rankings) {
      const cat = LANG_CATEGORIES[r.language]
      if (!cat) continue
      if (!leaders[cat] || r.rank < leaders[cat].rank) leaders[cat] = r
    }
    return CATEGORIES
      .filter((c) => c !== 'All' && leaders[c])
      .map((c) => ({ category: c, leader: leaders[c] }))
  }, [rankings])
}

/** Market fit tier per language — top third = High Demand, bottom third = Niche */
function useMarketFit(rankings: LanguageRanking[]): Map<number, MarketFit> {
  return React.useMemo(() => {
    if (rankings.length === 0) return new Map()
    const ratios = rankings.map((r) => ({
      id: r.id,
      ratio: r.job_listings / Math.max(r.popularity_index, 0.01),
    }))
    const sorted = [...ratios].sort((a, b) => a.ratio - b.ratio)
    const highThreshold = sorted[Math.floor(sorted.length * 0.67)].ratio
    const lowThreshold  = sorted[Math.floor(sorted.length * 0.33)].ratio
    const map = new Map<number, MarketFit>()
    for (const { id, ratio } of ratios) {
      map.set(id, ratio >= highThreshold ? 'high' : ratio >= lowThreshold ? 'competitive' : 'niche')
    }
    return map
  }, [rankings])
}

export function LanguageRankingsClient() {
  const prefersReducedMotion = useReducedMotion()

  const [rankings, setRankings]       = React.useState<LanguageRanking[]>([])
  const [isLoading, setIsLoading]     = React.useState(true)
  const [error, setError]             = React.useState<string | null>(null)
  const [note, setNote]               = React.useState<string | null>(null)
  const [snapshotDate, setSnapshotDate] = React.useState<string | null>(null)

  const [search, setSearch]       = React.useState('')
  const [category, setCategory]   = React.useState('All')
  const [trend, setTrend]         = React.useState<Trend>('all')
  const [sortField, setSortField] = React.useState<SortField>('popularity_index')
  const [sortDir, setSortDir]     = React.useState<SortDir>('desc')

  React.useEffect(() => {
    fetch('/api/languages/rankings')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setRankings(data.rankings ?? [])
        if (data.note) setNote(data.note)
        if (data.rankings?.[0]?.snapshot_date) setSnapshotDate(data.rankings[0].snapshot_date)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const maxIndex  = React.useMemo(() => Math.max(...rankings.map((r) => r.popularity_index), 1), [rankings])
  const maxGithub = React.useMemo(() => Math.max(...rankings.map((r) => r.github_repos_count), 1), [rankings])
  const maxSO     = React.useMemo(() => Math.max(...rankings.map((r) => r.stackoverflow_questions), 1), [rankings])
  const maxJobs   = React.useMemo(() => Math.max(...rankings.map((r) => r.job_listings), 1), [rankings])

  const categoryLeaders = useCategoryLeaders(rankings)
  const marketFitMap    = useMarketFit(rankings)

  const formattedDate = snapshotDate
    ? new Date(snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const processed = React.useMemo(() => {
    let list = [...rankings]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((r) => r.language.toLowerCase().includes(q))
    }
    if (category !== 'All') {
      list = list.filter((r) => (LANG_CATEGORIES[r.language] ?? 'Other') === category)
    }
    if (trend === 'rising') {
      list = list.filter((r) => r.prev_rank !== null && r.prev_rank - r.rank > 0)
    } else if (trend === 'falling') {
      list = list.filter((r) => r.prev_rank !== null && r.prev_rank - r.rank < 0)
    } else if (trend === 'stable') {
      list = list.filter((r) => r.prev_rank === null || r.prev_rank - r.rank === 0)
    }

    list.sort((a, b) => {
      const diff = a[sortField] - b[sortField]
      return sortDir === 'asc' ? diff : -diff
    })

    return list
  }, [rankings, search, category, trend, sortField, sortDir])

  const isFiltered = search.trim() !== '' || category !== 'All' || trend !== 'all'

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const TREND_OPTIONS: { value: Trend; label: string; icon: React.ReactNode }[] = [
    { value: 'all',     label: 'All',     icon: null },
    { value: 'rising',  label: 'Rising',  icon: <TrendingUp size={11} /> },
    { value: 'stable',  label: 'Stable',  icon: <Minus size={11} /> },
    { value: 'falling', label: 'Falling', icon: <TrendingDown size={11} /> },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">

      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Language Rankings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rankings.length || '40'} languages ranked by GitHub repos, Stack Overflow activity, and job demand
            </p>
          </div>
          {formattedDate && (
            <p className="text-xs text-muted-foreground">Updated {formattedDate}</p>
          )}
        </div>
      </motion.div>

      {/* Loading / Error / Empty */}
      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loading size="lg" text="Loading rankings..." />
        </div>
      )}
      {error && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {!isLoading && !error && rankings.length === 0 && (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            {note ?? 'No rankings data yet. Run the daily cron job to populate rankings.'}
          </p>
        </div>
      )}

      {!isLoading && !error && rankings.length > 0 && (
        <>
          {/* Category leaders strip */}
          {categoryLeaders.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.35 }}
              className="mb-5 flex flex-wrap items-center gap-x-1 gap-y-2"
            >
              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                Leaders
              </span>
              {categoryLeaders.map(({ category: cat, leader }) => {
                const langColor = LANG_COLORS[leader.language] ?? '#6b7280'
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-card/60"
                    style={{ borderColor: `${langColor}30`, background: `${langColor}08` }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: langColor }} />
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-semibold text-foreground">{leader.language}</span>
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Methodology */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.08 }}
            className="mb-5 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground"
          >
            <span className="font-medium text-foreground">Rating</span> — relative score where #1 = 100.
            Weighted: GitHub repos (40%), Stack Overflow questions (40%), job listings (20%).{' '}
            <span className="font-medium text-foreground">Market Fit</span> — job demand relative to community size.
            Click any row to see the full breakdown.
          </motion.div>

          {/* Controls: search + trend filter + category pills */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.35, delay: 0.1 }}
            className="mb-5 space-y-2.5"
          >
            {/* Row 1: search + trend */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-52 rounded-md border border-border bg-background pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Trend filter */}
              <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
                {TREND_OPTIONS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setTrend(value)}
                    className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors"
                    style={
                      trend === value
                        ? { backgroundColor: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }
                        : { color: 'hsl(var(--muted-foreground))' }
                    }
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: category pills */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
                  style={
                    category === cat
                      ? { borderColor: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                      : { borderColor: 'hsl(var(--border))', backgroundColor: 'transparent', color: 'hsl(var(--muted-foreground))' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Rising stars (only when unfiltered) */}
          {!isFiltered && <LanguageRisingStars rankings={rankings} />}

          {/* Results count when filtered */}
          {isFiltered && processed.length > 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              {processed.length} language{processed.length !== 1 ? 's' : ''}
              {category !== 'All' && ` in ${category}`}
              {trend !== 'all' && ` · ${trend}`}
              {search.trim() && ` matching "${search.trim()}"`}
            </p>
          )}

          {/* Column headers */}
          {processed.length > 0 && (
            <div className="mb-1 flex items-center gap-3 px-4 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
              <div className="w-7 text-center">#</div>
              <div className="w-10">Δ</div>
              <div className="w-32 sm:w-36">Language</div>
              {(
                [
                  { field: 'popularity_index' as SortField,      label: 'Rating',   cls: 'flex-1 flex' },
                  { field: 'github_repos_count' as SortField,    label: 'GitHub',   cls: 'hidden w-16 text-right md:flex' },
                  { field: 'stackoverflow_questions' as SortField, label: "S.O. Q's", cls: 'hidden w-16 text-right lg:flex' },
                  { field: 'job_listings' as SortField,          label: 'Jobs',     cls: 'w-16 text-right flex' },
                ] as const
              ).map(({ field, label, cls }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`${cls} cursor-pointer items-center gap-0.5 transition-colors hover:text-foreground justify-end`}
                  style={field === 'popularity_index' ? { justifyContent: 'flex-start' } : undefined}
                >
                  {label}
                  <SortIcon field={field} active={sortField} dir={sortDir} />
                </button>
              ))}
              <div className="hidden w-20 text-right lg:block">Market</div>
              <div className="w-4" /> {/* chevron spacer */}
            </div>
          )}

          {/* List */}
          {processed.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">No languages match your filters.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {processed.map((ranking, i) => (
                <motion.div
                  key={ranking.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -14 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.2, delay: i * 0.02 }}
                >
                  <LanguageRow
                    ranking={ranking}
                    maxIndex={maxIndex}
                    maxGithub={maxGithub}
                    maxSO={maxSO}
                    maxJobs={maxJobs}
                    marketFit={marketFitMap.get(ranking.id) ?? 'competitive'}
                    animationDelay={i * 30}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
