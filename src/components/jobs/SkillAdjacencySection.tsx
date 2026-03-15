'use client'

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { JobsSectionHeader } from '@/components/jobs/JobsSectionHeader'
import { Skeleton } from '@/components/ui/skeleton'
import type { SkillAdjacencyEntry } from '@/hooks/useJobsIntelligence'

interface SkillAdjacencySectionProps {
  entries: SkillAdjacencyEntry[]
  isLoading: boolean
}

function formatLift(value: number) {
  return `${value.toFixed(1)}x`
}

export function SkillAdjacencySection({ entries, isLoading }: SkillAdjacencySectionProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>('')

  const selectedEntry = useMemo(() => {
    if (entries.length === 0) return null
    return entries.find((entry) => entry.technologySlug === selectedSlug) ?? entries[0]
  }, [entries, selectedSlug])

  return (
    <section className="space-y-4">
      <JobsSectionHeader
        eyebrow="Skill adjacency"
        title="What skills tend to travel with each stack"
        description="Adjacency surfaces what employers keep pairing together, helping candidates stack the right supporting skills instead of learning in isolation."
      />

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracked stacks</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-24 rounded-full" />
                ))
              : entries.map((entry) => (
                <button
                  key={entry.technologySlug}
                  onClick={() => setSelectedSlug(entry.technologySlug)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    selectedEntry?.technologySlug === entry.technologySlug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                  }`}
                >
                  {entry.technologyName}
                </button>
                ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-44" />
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : selectedEntry ? (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Best supporting signals for {selectedEntry.technologyName}
                </p>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
                Strongest co-mentioned skills
              </h3>

              <div className="mt-5 space-y-3">
                {selectedEntry.skills.slice(0, 6).map((skill) => (
                  <div key={skill.slug} className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{skill.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {skill.cooccurrenceCount.toLocaleString()} co-mentions in tracked openings
                        </p>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400">
                        {formatLift(skill.liftScore)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No adjacency data available yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
