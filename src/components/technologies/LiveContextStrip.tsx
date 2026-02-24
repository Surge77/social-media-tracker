'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { TechnologyWithScore } from '@/types'

interface LiveContextStripProps {
  filtered: TechnologyWithScore[]
  total: number
}

function Divider() {
  return <span className="text-border">·</span>
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  )
}

export function LiveContextStrip({ filtered, total }: LiveContextStripProps) {
  const prefersReducedMotion = useReducedMotion()

  const stats = useMemo(() => {
    if (filtered.length === 0) return null

    const withScore    = filtered.filter((t) => t.composite_score != null)
    const withMomentum = filtered.filter((t) => t.momentum != null)
    const withJobs     = filtered.filter((t) => t.jobs_score != null)

    const avgScore = withScore.length
      ? Math.round(withScore.reduce((s, t) => s + t.composite_score!, 0) / withScore.length)
      : null

    const topMomentum = withMomentum.length
      ? withMomentum.reduce((best, t) => (t.momentum! > best.momentum! ? t : best))
      : null

    const topJobs = withJobs.length
      ? withJobs.reduce((best, t) => (t.jobs_score! > best.jobs_score! ? t : best))
      : null

    const isFiltered = filtered.length < total

    return { avgScore, topMomentum, topJobs, isFiltered }
  }, [filtered, total])

  // Stable key so AnimatePresence replaces on meaningful change
  const animKey = `${filtered.length}-${stats?.avgScore}`

  return (
    <div className="mb-4 min-h-[38px]">
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? null : (
          <motion.div
            key={animKey}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -4 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-muted/20 px-4 py-2 text-sm"
          >
            {/* Count */}
            <Stat
              label=""
              value={
                <span>
                  {filtered.length}{' '}
                  <span className="font-normal text-muted-foreground">
                    {filtered.length === 1 ? 'technology' : 'technologies'}
                  </span>
                </span>
              }
            />

            {stats?.avgScore != null && (
              <>
                <Divider />
                <Stat label="Avg score" value={stats.avgScore} />
              </>
            )}

            {stats?.topMomentum && (
              <>
                <Divider />
                <Stat
                  label="Fastest rising"
                  value={
                    <span className="flex items-center gap-1">
                      {stats.topMomentum.name}
                      <span className="text-emerald-500">
                        ↑{Math.abs(Math.round(stats.topMomentum.momentum!))}
                      </span>
                    </span>
                  }
                />
              </>
            )}

            {stats?.topJobs && stats.topJobs.id !== stats?.topMomentum?.id && (
              <>
                <Divider />
                <Stat label="Most hired" value={stats.topJobs.name} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
