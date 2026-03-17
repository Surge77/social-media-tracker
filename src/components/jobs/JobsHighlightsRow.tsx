'use client'

import { BrainCircuit } from 'lucide-react'
import type { JobsHighlight } from '@/hooks/useJobsAggregator'

export function JobsHighlightsRow({ highlights }: { highlights: JobsHighlight[] }) {
  if (highlights.length === 0) return null

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
          Hiring analysis
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          AI-assisted takeaways from the live openings feed
        </h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{highlight.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{highlight.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
