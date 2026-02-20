'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LanguageRow } from '@/components/languages/LanguageRow'
import type { LanguageRanking } from '@/components/languages/LanguageRow'
import { Loading } from '@/components/ui/loading'

export function LanguageRankingsClient() {
  const prefersReducedMotion = useReducedMotion()
  const [rankings, setRankings] = React.useState<LanguageRanking[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)
  const [snapshotDate, setSnapshotDate] = React.useState<string | null>(null)

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

  // The top language is always 100; all others are relative to it
  const maxIndex = React.useMemo(
    () => Math.max(...rankings.map((r) => r.popularity_index), 1),
    [rankings]
  )

  const formattedDate = snapshotDate
    ? new Date(snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4 }}
        className="mb-2"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Language Rankings</h1>
            <p className="mt-1 text-muted-foreground">
              {rankings.length || '40'} languages ranked by GitHub repos, Stack Overflow activity, and job demand
            </p>
          </div>
          {formattedDate && (
            <p className="text-xs text-muted-foreground">Updated {formattedDate}</p>
          )}
        </div>
      </motion.div>

      {/* Methodology note */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
        className="mb-5 rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground"
      >
        <span className="font-medium text-foreground">Rating</span> — relative score where the #1 language = 100.
        Weighted across GitHub repositories (40%), Stack Overflow questions (40%), and job listings (20%).
      </motion.div>

      {/* Column headers */}
      {!isLoading && !error && rankings.length > 0 && (
        <div className="mb-1 flex items-center gap-3 px-4 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
          <div className="w-7 text-center">#</div>
          <div className="w-10">Δ</div>
          <div className="w-32 sm:w-36">Language</div>
          <div className="flex-1">Rating</div>
          <div className="hidden w-16 text-right md:block">GitHub</div>
          <div className="hidden w-16 text-right lg:block">S.O. Q's</div>
          <div className="w-16 text-right">Jobs</div>
        </div>
      )}

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
        <div className="flex flex-col gap-1">
          {rankings.map((ranking, i) => (
            <motion.div
              key={ranking.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -16 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.2, delay: i * 0.02 }}
            >
              <LanguageRow ranking={ranking} maxIndex={maxIndex} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
