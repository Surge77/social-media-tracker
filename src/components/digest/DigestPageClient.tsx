'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { DigestHeader } from '@/components/digest/DigestHeader'
import { DigestCard } from '@/components/digest/DigestCard'
import { Loading } from '@/components/ui/loading'
import type { WeeklyDigest } from '@/lib/ai/generators/weekly-digest'

interface AvailableWeek {
  week_start: string
  generated_at: string
}

// ─── TL;DR Banner ─────────────────────────────────────────────────────────────

function TLDRBanner({ takeaways }: { takeaways: string[] }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.4, delay: 0.1 }}
      className="rounded-lg border border-primary/25 bg-primary/5 p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          TL;DR — This week's key takeaways
        </span>
      </div>
      <ul className="space-y-2">
        {takeaways.map((t, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-foreground">{t}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// ─── Section anchor nav ───────────────────────────────────────────────────────

function SectionNav({ sections }: { sections: { title: string; id: string }[] }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className="rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-card hover:text-foreground"
        >
          {s.title}
        </button>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-10 text-center">
      <p className="text-base font-medium text-foreground">No digest available yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Check back Monday — weekly intelligence reports are generated every Monday at 3 am UTC.
      </p>
    </div>
  )
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function DigestPageClient() {
  const prefersReducedMotion = useReducedMotion()

  const [digest, setDigest] = React.useState<WeeklyDigest | null>(null)
  const [availableWeeks, setAvailableWeeks] = React.useState<AvailableWeek[]>([])
  const [selectedWeek, setSelectedWeek] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch list of available weeks on mount
  React.useEffect(() => {
    fetch('/api/ai/digest/list')
      .then((r) => r.json())
      .then((data) => {
        const weeks: AvailableWeek[] = data.weeks || []
        setAvailableWeeks(weeks)
        if (weeks.length > 0 && !selectedWeek) {
          setSelectedWeek(weeks[0].week_start)
        }
      })
      .catch(() => {
        // If list fails, still attempt to load latest
        setIsLoading(false)
      })
  }, [])

  // Fetch digest whenever selectedWeek changes
  React.useEffect(() => {
    if (!selectedWeek && availableWeeks.length === 0) {
      // No weeks available, try fetching latest anyway
      setIsLoading(true)
      fetch('/api/ai/digest/latest')
        .then((r) => r.json())
        .then((data) => {
          setDigest(data.digest ?? null)
        })
        .catch((err) => setError((err as Error).message))
        .finally(() => setIsLoading(false))
      return
    }

    if (!selectedWeek) return

    setIsLoading(true)
    setError(null)

    const url = `/api/ai/digest/latest?week=${selectedWeek}`
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch digest')
        return r.json()
      })
      .then((data) => setDigest(data.digest ?? null))
      .catch((err) => setError((err as Error).message))
      .finally(() => setIsLoading(false))
  }, [selectedWeek])

  // Build section IDs for anchors
  const sectionsWithIds = React.useMemo(() => {
    if (!digest) return []
    return digest.sections.map((s, i) => ({
      ...s,
      id: `section-${i}`,
    }))
  }, [digest])

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <Loading size="lg" text="Loading weekly digest..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-sm text-destructive">Failed to load digest: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedWeek || 'empty'}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
          transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header (always shown if we have week data) */}
          {digest && (
            <DigestHeader
              weekStart={digest.weekStart}
              generatedAt={digest.generatedAt}
              digest={digest}
              availableWeeks={availableWeeks}
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
            />
          )}

          {!digest ? (
            <EmptyState />
          ) : (
            <>
              {/* TL;DR — key takeaways at the top */}
              {digest.keyTakeaways?.length > 0 && (
                <TLDRBanner takeaways={digest.keyTakeaways} />
              )}

              {/* Section anchor nav */}
              {sectionsWithIds.length > 1 && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1 }}
                  transition={prefersReducedMotion ? {} : { duration: 0.3, delay: 0.15 }}
                >
                  <SectionNav
                    sections={sectionsWithIds.map((s) => ({ title: s.title, id: s.id }))}
                  />
                </motion.div>
              )}

              {/* Section cards */}
              <div className="space-y-4">
                {sectionsWithIds.map((section, index) => (
                  <DigestCard
                    key={`${selectedWeek}-${index}`}
                    section={section}
                    index={index}
                    sectionId={section.id}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
