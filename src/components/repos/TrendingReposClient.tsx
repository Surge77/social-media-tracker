'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { RepoCard } from '@/components/repos/RepoCard'
import { RepoFilters } from '@/components/repos/RepoFilters'
import { RisingStarsSection } from '@/components/repos/RisingStarsSection'
import { CommunityBuzzSection } from '@/components/repos/CommunityBuzzSection'
import { Loading } from '@/components/ui/loading'
import type { TrendingRepo, BuzzItem } from '@/lib/api/github-trending'

const PAGE_SIZE = 30

export function TrendingReposClient() {
  const prefersReducedMotion = useReducedMotion()
  const [language, setLanguage] = React.useState('all')
  const [period, setPeriod] = React.useState('7d')
  const [repos, setRepos] = React.useState<TrendingRepo[]>([])
  const [buzz, setBuzz] = React.useState<BuzzItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)

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
        setBuzz(data.buzz ?? [])
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">Trending Repos</h1>
        <p className="text-muted-foreground">Open-source repositories gaining momentum on GitHub</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <RepoFilters
          language={language}
          period={period}
          onLanguageChange={(l) => { setLanguage(l); setPage(1) }}
          onPeriodChange={(p) => { setPeriod(p); setPage(1) }}
        />
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
          {/* Community Buzz — only on page 1 */}
          {page === 1 && buzz.length > 0 && (
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.12 }}
            >
              <CommunityBuzzSection buzz={buzz} />
            </motion.div>
          )}

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
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, repos.length)} of {repos.length} repos
              </p>
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
            </div>
          )}

          {/* Repo Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${language}-${period}-${page}`}
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={prefersReducedMotion ? {} : { opacity: 1 }}
              exit={prefersReducedMotion ? {} : { opacity: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
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
            </motion.div>
          </AnimatePresence>

          {repos.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">No repos found for this filter combination</p>
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card/30 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/60 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              {/* Page number pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => goToPage(item as number)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                          item === page
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-card/30 text-foreground hover:bg-card/60'
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
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card/30 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/60 disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
