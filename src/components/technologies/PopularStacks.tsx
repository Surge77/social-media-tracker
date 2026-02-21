import Link from 'next/link'

import { cn } from '@/lib/utils'
import type { TechStatsResponse } from '@/hooks/useTechStats'

interface PopularStacksProps {
  data: TechStatsResponse['popular_stacks'] | null
  isLoading: boolean
  isError: boolean
}

function StackCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-lg bg-muted" />
        <div className="h-5 w-32 rounded bg-muted" />
      </div>
      <div className="h-3 w-full rounded bg-muted mb-1.5" />
      <div className="h-3 w-4/5 rounded bg-muted mb-4" />
      <div className="flex gap-2 flex-wrap mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 rounded-full bg-muted" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-24 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function PopularStacks({ data, isLoading, isError }: PopularStacksProps) {
  if (isError) {
    return (
      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          👥 POPULAR STACKS
        </h2>
        <p className="text-sm text-muted-foreground">
          Stack data unavailable right now.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        👥 POPULAR STACKS
      </h2>

      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          'sm:grid-cols-2',
          'lg:grid-cols-3',
        )}
      >
        {isLoading
          ? [1, 2, 3].map((i) => <StackCardSkeleton key={i} />)
          : (data ?? []).map((stack) => {
              const techSlugs = stack.technologies.map((t) => t.slug).join(',')
              const compareHref = `/compare?techs=${encodeURIComponent(techSlugs)}`
              const scoreLabel = stack.avg_score.toFixed(1)

              return (
                <div
                  key={stack.name}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-border/80 hover:bg-card/80 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl leading-none"
                      role="img"
                      aria-label={stack.name}
                    >
                      {stack.emoji}
                    </span>
                    <h3 className="font-semibold text-foreground text-base leading-tight">
                      {stack.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {stack.description}
                  </p>

                  {/* Tech pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {stack.technologies.map((tech) => (
                      <span
                        key={tech.slug}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border border-border/60 bg-background text-foreground/80"
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tech.color }}
                          aria-hidden="true"
                        />
                        {tech.name}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Avg {scoreLabel}
                    </span>
                    <Link
                      href={compareHref}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Compare Stack →
                    </Link>
                  </div>
                </div>
              )
            })}
      </div>
    </section>
  )
}
