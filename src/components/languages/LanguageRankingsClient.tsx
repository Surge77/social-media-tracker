'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LanguageRow } from '@/components/languages/LanguageRow'
import { LanguageRisingStars } from '@/components/languages/LanguageRisingStars'
import { LanguagePodium } from '@/components/languages/LanguagePodium'
import { LanguageStatsBar } from '@/components/languages/LanguageStatsBar'
import {
  getLanguageCategoryTrackClassName,
  getLanguageLeaderboardInnerClassName,
  getLanguageLeaderboardScrollerClassName,
  getLanguageResultsHeaderClassName,
  getLanguageResultsListClassName,
  getLanguageTrendTrackClassName,
} from '@/components/languages/language-layout-styles'
import { LANG_CATEGORIES, CATEGORIES, LANG_COLORS } from '@/components/languages/constants'
import { Loading } from '@/components/ui/loading'
import type { LanguageRanking, MarketFit } from '@/components/languages/LanguageRow'

type SortField = 'popularity_index' | 'github_repos_count' | 'stackoverflow_questions' | 'job_listings'
type SortDir = 'asc' | 'desc'
type Trend = 'all' | 'rising' | 'stable' | 'falling'

function SortIcon({ field, active, dir }: { field: string; active: string; dir: SortDir }) {
  if (field !== active) return <ChevronsUpDown size={11} className="text-muted-foreground/40" />

  return dir === 'asc'
    ? <ChevronUp size={11} className="text-foreground" />
    : <ChevronDown size={11} className="text-foreground" />
}

function useCategoryLeaders(rankings: LanguageRanking[]) {
  return React.useMemo(() => {
    const leaders: Record<string, LanguageRanking> = {}

    for (const ranking of rankings) {
      const category = LANG_CATEGORIES[ranking.language]
      if (!category) continue
      if (!leaders[category] || ranking.rank < leaders[category].rank) {
        leaders[category] = ranking
      }
    }

    return CATEGORIES
      .filter((category) => category !== 'All' && leaders[category])
      .map((category) => ({ category, leader: leaders[category] }))
  }, [rankings])
}

function useMarketFit(rankings: LanguageRanking[]): Map<number, MarketFit> {
  return React.useMemo(() => {
    if (rankings.length === 0) return new Map()

    const ratios = rankings.map((ranking) => ({
      id: ranking.id,
      ratio: ranking.job_listings / Math.max(ranking.popularity_index, 0.01),
    }))
    const sorted = [...ratios].sort((a, b) => a.ratio - b.ratio)
    const highThreshold = sorted[Math.floor(sorted.length * 0.67)].ratio
    const lowThreshold = sorted[Math.floor(sorted.length * 0.33)].ratio
    const fitMap = new Map<number, MarketFit>()

    for (const { id, ratio } of ratios) {
      fitMap.set(id, ratio >= highThreshold ? 'high' : ratio >= lowThreshold ? 'competitive' : 'niche')
    }

    return fitMap
  }, [rankings])
}

export function LanguageRankingsClient() {
  const prefersReducedMotion = useReducedMotion()

  const [rankings, setRankings] = React.useState<LanguageRanking[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)
  const [snapshotDate, setSnapshotDate] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('All')
  const [trend, setTrend] = React.useState<Trend>('all')
  const [sortField, setSortField] = React.useState<SortField>('popularity_index')
  const [sortDir, setSortDir] = React.useState<SortDir>('desc')

  React.useEffect(() => {
    fetch('/api/languages/rankings')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((data) => {
        setRankings(data.rankings ?? [])
        if (data.note) setNote(data.note)
        if (data.rankings?.[0]?.snapshot_date) setSnapshotDate(data.rankings[0].snapshot_date)
        setIsLoading(false)
      })
      .catch((fetchError) => {
        setError(fetchError.message)
        setIsLoading(false)
      })
  }, [])

  const maxIndex = React.useMemo(() => Math.max(...rankings.map((ranking) => ranking.popularity_index), 1), [rankings])
  const maxGithub = React.useMemo(() => Math.max(...rankings.map((ranking) => ranking.github_repos_count), 1), [rankings])
  const maxSO = React.useMemo(() => Math.max(...rankings.map((ranking) => ranking.stackoverflow_questions), 1), [rankings])
  const maxJobs = React.useMemo(() => Math.max(...rankings.map((ranking) => ranking.job_listings), 1), [rankings])

  const categoryLeaders = useCategoryLeaders(rankings)
  const marketFitMap = useMarketFit(rankings)

  const formattedDate = snapshotDate
    ? new Date(snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  const processed = React.useMemo(() => {
    const list = [...rankings]

    const searchTerm = search.trim().toLowerCase()
    const filtered = list
      .filter((ranking) => !searchTerm || ranking.language.toLowerCase().includes(searchTerm))
      .filter((ranking) => category === 'All' || (LANG_CATEGORIES[ranking.language] ?? 'Other') === category)
      .filter((ranking) => {
        if (trend === 'rising') return ranking.prev_rank !== null && ranking.prev_rank - ranking.rank > 0
        if (trend === 'falling') return ranking.prev_rank !== null && ranking.prev_rank - ranking.rank < 0
        if (trend === 'stable') return ranking.prev_rank === null || ranking.prev_rank - ranking.rank === 0
        return true
      })

    filtered.sort((a, b) => {
      const diff = a[sortField] - b[sortField]
      return sortDir === 'asc' ? diff : -diff
    })

    return filtered
  }, [rankings, search, category, trend, sortField, sortDir])

  const isFiltered = search.trim() !== '' || category !== 'All' || trend !== 'all'
  const hasRankHistory = React.useMemo(() => rankings.some((ranking) => ranking.prev_rank !== null), [rankings])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((currentDir) => (currentDir === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDir('desc')
  }

  const trendOptions: { value: Trend; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: null },
    { value: 'rising', label: 'Rising', icon: <TrendingUp size={11} /> },
    { value: 'stable', label: 'Stable', icon: <Minus size={11} /> },
    { value: 'falling', label: 'Falling', icon: <TrendingDown size={11} /> },
  ]

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-5"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Language Rankings</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {rankings.length || '40'} languages ranked by GitHub repos, Stack Overflow activity, and job demand
            </p>
          </div>
          {formattedDate && <p className="text-xs text-muted-foreground">Updated {formattedDate}</p>}
        </div>
      </motion.div>

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
          <LanguageStatsBar rankings={rankings} />

          {!isFiltered && rankings.length >= 3 && (
            <LanguagePodium top3={rankings.slice(0, 3)} maxIndex={maxIndex} />
          )}

          {categoryLeaders.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.35 }}
              className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0 sm:pr-0"
            >
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                Leaders
              </span>
              {categoryLeaders.map(({ category: leaderCategory, leader }) => {
                const leaderColor = LANG_COLORS[leader.language] ?? '#6b7280'

                return (
                  <button
                    key={leaderCategory}
                    onClick={() => setCategory(leaderCategory)}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-card/60"
                    style={{ borderColor: `${leaderColor}30`, background: `${leaderColor}08` }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: leaderColor }} />
                    <span className="text-muted-foreground">{leaderCategory}</span>
                    <span className="font-semibold text-foreground">{leader.language}</span>
                  </button>
                )
              })}
            </motion.div>
          )}

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? {} : { duration: 0.35, delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-9 w-full rounded-full border border-border/60 bg-muted/20 pl-9 pr-9 text-sm text-foreground transition-all placeholder:text-muted-foreground/70 hover:bg-muted/40 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className={`${getLanguageTrendTrackClassName()} rounded-full border border-border/60 bg-muted/20 p-1`}>
                  {trendOptions.map(({ value, label, icon }) => {
                    const needsHistory = value === 'rising' || value === 'falling' || value === 'stable'
                    const isDisabled = needsHistory && !hasRankHistory

                    return (
                      <button
                        key={value}
                        onClick={() => !isDisabled && setTrend(value)}
                        title={isDisabled ? 'No rank history yet - requires 2+ days of data' : undefined}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
                          trend !== value && !isDisabled ? 'hover:text-foreground' : ''
                        }`}
                        style={
                          trend === value
                            ? {
                                backgroundColor: 'hsl(var(--foreground))',
                                color: 'hsl(var(--background))',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              }
                            : isDisabled
                              ? { color: 'hsl(var(--muted-foreground))', opacity: 0.4, cursor: 'not-allowed' }
                              : { color: 'hsl(var(--muted-foreground))' }
                        }
                      >
                        <span className="flex items-center gap-1.5">
                          {icon}
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="hidden max-w-xs text-right text-[11px] text-muted-foreground/80 xl:block">
                <span className="font-semibold text-foreground/70">Rating</span> based on GitHub (40%), Stack
                Overflow (40%), and Jobs (20%).
              </div>
            </div>

            <div className={getLanguageCategoryTrackClassName()}>
              {CATEGORIES.map((categoryOption) => (
                <button
                  key={categoryOption}
                  onClick={() => setCategory(categoryOption)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                    category === categoryOption
                      ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {categoryOption}
                </button>
              ))}
            </div>

          </motion.div>

          {!isFiltered && <LanguageRisingStars rankings={rankings} />}

          {isFiltered && processed.length > 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              {processed.length} language{processed.length !== 1 ? 's' : ''}
              {category !== 'All' && ` in ${category}`}
              {trend !== 'all' && ` - ${trend}`}
              {search.trim() && ` matching "${search.trim()}"`}
            </p>
          )}

          {processed.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">
                {(trend === 'rising' || trend === 'falling') && !hasRankHistory
                  ? 'No rank history yet - run the cron job on two consecutive days to enable trend filters.'
                  : 'No languages match your filters.'}
              </p>
            </div>
          ) : (
            <div className={getLanguageLeaderboardScrollerClassName()}>
              <div className={getLanguageLeaderboardInnerClassName()}>
                <div className={getLanguageResultsHeaderClassName()}>
                  <div className="mb-1 flex items-center gap-3 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    <div className="w-8 text-center">#</div>
                    <div className="w-10">Delta</div>
                    <div className="w-40">Language</div>
                    {(
                      [
                        { field: 'popularity_index' as SortField, label: 'Rating', cls: 'flex flex-1 items-center gap-1' },
                        { field: 'github_repos_count' as SortField, label: 'GitHub', cls: 'flex w-[76px] items-center justify-end gap-1 text-right' },
                        { field: 'stackoverflow_questions' as SortField, label: "S.O. Q's", cls: 'flex w-[86px] items-center justify-end gap-1 text-right' },
                        { field: 'job_listings' as SortField, label: 'Jobs', cls: 'flex w-[72px] items-center justify-end gap-1 text-right' },
                      ] as const
                    ).map(({ field, label, cls }) => (
                      <button
                        key={field}
                        onClick={() => handleSort(field)}
                        className={`${cls} cursor-pointer transition-colors hover:text-foreground`}
                      >
                        {label}
                        <SortIcon field={field} active={sortField} dir={sortDir} />
                      </button>
                    ))}
                    <div className="w-[96px] text-right">Market</div>
                    <div className="w-6" />
                  </div>
                </div>

                <div className={getLanguageResultsListClassName()}>
                  {processed.map((ranking, index) => (
                    <motion.div
                      key={ranking.id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -14 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? {} : { duration: 0.2, delay: index * 0.02 }}
                    >
                      <LanguageRow
                        ranking={ranking}
                        maxIndex={maxIndex}
                        maxGithub={maxGithub}
                        maxSO={maxSO}
                        maxJobs={maxJobs}
                        marketFit={marketFitMap.get(ranking.id) ?? 'competitive'}
                        animationDelay={index * 30}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
