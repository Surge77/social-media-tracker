'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RepoCard } from '@/components/repos/RepoCard'
import { RepoTable } from '@/components/repos/RepoTable'
import { RepoFilters } from '@/components/repos/RepoFilters'
import { RisingStarsSection } from '@/components/repos/RisingStarsSection'
import { LegendaryReposSection } from '@/components/repos/LegendaryReposSection'
import { getRepoGridClassName, getRepoViewToggleClassName } from '@/components/repos/repo-layout-styles'
import { WordPullUp } from '@/components/ui/word-pull-up'
import { Loading } from '@/components/ui/loading'
import type { TrendingRepo } from '@/lib/api/github-trending'
import type { LegendaryRepo } from '@/app/api/repos/legendary/route'

const PAGE_SIZE = 30

type ViewMode = 'grid' | 'table'

export function TrendingReposClient() {
  const prefersReducedMotion = useReducedMotion()
  const repoGridClassName = getRepoGridClassName()
  const viewToggleClassName = getRepoViewToggleClassName()
  const [language, setLanguage] = React.useState('all')
  const [period, setPeriod] = React.useState('7d')
  const [repos, setRepos] = React.useState<TrendingRepo[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [view, setView] = React.useState<ViewMode>('grid')
  const [legendaryByStars, setLegendaryByStars] = React.useState<LegendaryRepo[]>([])
  const [legendaryByForks, setLegendaryByForks] = React.useState<LegendaryRepo[]>([])
  const [legendaryLoaded, setLegendaryLoaded] = React.useState(false)

  // Fetch legendary repos once on mount
  React.useEffect(() => {
    fetch('/api/repos/legendary')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setLegendaryByStars(data.byStars ?? [])
          setLegendaryByForks(data.byForks ?? [])
        }
        setLegendaryLoaded(true)
      })
      .catch(() => setLegendaryLoaded(true))
  }, [])

  // Reset to page 1 whenever filters change
  React.useEffect(() => {
    setPage(1)
  }, [language, period])

  React.useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetch(`/api/repos/trending?lang=${encodeURIComponent(language)}&period=${period}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setRepos(data.repos ?? [])
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [language, period])

  const totalPages = Math.ceil(repos.length / PAGE_SIZE)
  const pageRepos = repos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goToPage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-5 max-w-2xl sm:mb-6"
      >
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <WordPullUp text="Trending Repos" />
        </h1>
        <p className="text-muted-foreground">Open-source repositories gaining momentum on GitHub</p>
      </motion.div>

      {/* GitHub Legends */}
      {legendaryLoaded && (legendaryByStars.length > 0 || legendaryByForks.length > 0) && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <LegendaryReposSection byStars={legendaryByStars} byForks={legendaryByForks} />
        </motion.div>
      )}

      {/* Filters + view toggle */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="mb-6 rounded-2xl border border-border/60 bg-card/20 p-3 sm:mb-8 sm:p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:flex-1">
            <RepoFilters
              language={language}
              period={period}
              onLanguageChange={(l) => { setLanguage(l); setPage(1) }}
              onPeriodChange={(p) => { setPeriod(p); setPage(1) }}
            />
          </div>

          {/* View toggle */}
          <div className={viewToggleClassName}>
            <button
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`flex h-9 items-center justify-center rounded-lg transition-all duration-200 sm:h-8 sm:w-10 sm:rounded-full ${
                view === 'grid'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={15} />
              <span className="ml-2 text-xs font-medium sm:hidden">Grid</span>
            </button>
            <button
              onClick={() => setView('table')}
              aria-label="Table view"
              className={`flex h-9 items-center justify-center rounded-lg transition-all duration-200 sm:h-8 sm:w-10 sm:rounded-full ${
                view === 'table'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={15} />
              <span className="ml-2 text-xs font-medium sm:hidden">List</span>
            </button>
          </div>
        </div>
      </motion.div>

      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loading size="lg" text="Loading trending repos..." />
        </div>
      )}

      {error && (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Rising Stars — only on page 1 */}
          {page === 1 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.15 }}
              className="mb-6"
            >
              <RisingStarsSection repos={repos} />
            </motion.div>
          )}

          {/* Page label */}
          {totalPages > 1 && (
            <div className="mb-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, repos.length)} of {repos.length} repos
              </p>
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            </div>
          )}

          {/* Grid or Table */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${language}-${period}-${page}-${view}`}
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
            >
              {view === 'grid' ? (
                <div className={repoGridClassName}>
                  {pageRepos.map((repo, i) => (
                    <motion.div
                      key={repo.github_id}
                      initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? {} : { duration: 0.25, delay: i * 0.03 }}
                    >
                      <RepoCard repo={repo} rank={(page - 1) * PAGE_SIZE + i + 1} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <RepoTable repos={pageRepos} page={page} pageSize={PAGE_SIZE} />
              )}
            </motion.div>
          </AnimatePresence>

          {repos.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border">
              <p className="text-sm text-muted-foreground">No repos found for this filter combination</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10 sm:gap-3">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex h-10 min-w-[2.75rem] items-center justify-center gap-1.5 rounded-full border border-border/60 bg-card/30 px-4 text-sm font-medium text-foreground transition-all hover:bg-muted/50 hover:border-border disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="order-first flex w-full items-center justify-center gap-1.5 sm:order-none sm:w-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-muted-foreground/50">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item as number)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                          item === page
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'border border-border/60 bg-card/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="flex h-10 min-w-[2.75rem] items-center justify-center gap-1.5 rounded-full border border-border/60 bg-card/30 px-4 text-sm font-medium text-foreground transition-all hover:bg-muted/50 hover:border-border disabled:pointer-events-none disabled:opacity-40"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
