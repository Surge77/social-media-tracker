'use client'

import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface JobsAISummary {
  headline: string
  summary: string
  bullets: string[]
}

async function fetchJobsSummary(): Promise<JobsAISummary> {
  const response = await fetch('/api/ai/jobs-summary')
  if (!response.ok) {
    throw new Error('Failed to fetch jobs AI summary')
  }
  const payload = await response.json()
  return payload.summary as JobsAISummary
}

export function JobsAISummaryCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['jobs-ai-summary'],
    queryFn: fetchJobsSummary,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
    retry: 1,
  })

  return (
    <section className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            AI summary
          </p>
          {isLoading ? (
            <div className="mt-3 space-y-3">
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[88%]" />
            </div>
          ) : data ? (
            <>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{data.headline}</h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-[15px]">{data.summary}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {data.bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground">
                    {bullet}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              AI summary is temporarily unavailable. The structured jobs sections below still reflect the live data.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
