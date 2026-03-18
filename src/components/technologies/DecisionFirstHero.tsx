'use client'

import Link from 'next/link'
import { ArrowRight, Compass, MoveRight, Sparkles, Target, TrendingUp, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DecisionFirstSummary } from '@/lib/insights'

interface DecisionFirstHeroProps {
  summary: DecisionFirstSummary
  className?: string
}

function SectionCard({
  title,
  icon,
  items,
  toneClassName,
}: {
  title: string
  icon: React.ReactNode
  items: string[]
  toneClassName?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border/50 bg-card/70 p-4 shadow-[var(--shadow-card)]', toneClassName)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary/80">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-foreground/80">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DecisionFirstHero({ summary, className }: DecisionFirstHeroProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card/90 to-card/80 p-5 shadow-[var(--shadow-card)]">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Verdict</span>
        </div>
        <p className="max-w-3xl text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {summary.verdict}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Best For"
          icon={<Target className="h-4 w-4" />}
          items={summary.bestFor}
          toneClassName="border-emerald-500/20 bg-emerald-500/5"
        />
        <SectionCard
          title="Not Ideal For"
          icon={<XCircle className="h-4 w-4" />}
          items={summary.notIdealFor}
          toneClassName="border-amber-500/20 bg-amber-500/5"
        />
      </div>

      <SectionCard
        title="Why This Is Moving"
        icon={<TrendingUp className="h-4 w-4" />}
        items={summary.whyThisIsMoving}
      />

      <div className="rounded-xl border border-border/50 bg-background/70 p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary/80" />
          <h3 className="text-sm font-semibold text-foreground">What To Do Next</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.nextActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                index === 0
                  ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15'
                  : 'border-border bg-card/70 text-foreground/80 hover:bg-muted/30'
              )}
            >
              {action.label}
              {index === 0 ? <ArrowRight className="h-3.5 w-3.5" /> : <MoveRight className="h-3.5 w-3.5" />}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
