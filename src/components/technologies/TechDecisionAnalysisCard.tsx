'use client'

import { AlertTriangle, CheckCircle2, Clock3, Compass, ShieldAlert, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { TechInsight } from '@/lib/ai/generators/tech-insight'

interface TechDecisionAnalysisCardProps {
  insight: TechInsight
  className?: string
}

function getEffortTone(effort?: 'low' | 'medium' | 'high') {
  if (effort === 'low') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (effort === 'high') return 'text-rose-400 border-rose-500/30 bg-rose-500/10'
  return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
}

export function TechDecisionAnalysisCard({ insight, className }: TechDecisionAnalysisCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const pros = Array.isArray(insight.pros) ? insight.pros.filter(Boolean).slice(0, 5) : []
  const cons = Array.isArray(insight.cons) ? insight.cons.filter(Boolean).slice(0, 5) : []
  const practical = insight.practicalAnalysis

  if (pros.length === 0 && cons.length === 0 && !practical) return null

  return (
    <motion.section
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { duration: 0.35 }}
      className={cn('rounded-xl border border-primary/20 bg-card/40 p-5', className)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Decision Analysis</h2>
        {practical?.effortEstimate && (
          <span
            className={cn(
              'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
              getEffortTone(practical.effortEstimate)
            )}
          >
            Effort: {practical.effortEstimate}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pros.length > 0 && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 size={14} />
              <p className="text-xs font-semibold uppercase tracking-wide">Pros</p>
            </div>
            <ul className="space-y-1.5">
              {pros.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  - {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cons.length > 0 && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-rose-300">
              <AlertTriangle size={14} />
              <p className="text-xs font-semibold uppercase tracking-wide">Cons</p>
            </div>
            <ul className="space-y-1.5">
              {cons.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  - {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {practical && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-primary/80">
              <Target size={13} />
              <p className="text-xs font-semibold uppercase tracking-wide">Best Fit</p>
            </div>
            <p className="text-sm text-muted-foreground">{practical.bestFitUseCases}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-primary/80">
              <Compass size={13} />
              <p className="text-xs font-semibold uppercase tracking-wide">Avoid If</p>
            </div>
            <p className="text-sm text-muted-foreground">{practical.avoidIf}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-primary/80">
              <ShieldAlert size={13} />
              <p className="text-xs font-semibold uppercase tracking-wide">Adoption Risks</p>
            </div>
            <p className="text-sm text-muted-foreground">{practical.adoptionRisks}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-primary/80">
              <Clock3 size={13} />
              <p className="text-xs font-semibold uppercase tracking-wide">90-Day Outlook</p>
            </div>
            <p className="text-sm text-muted-foreground">{practical.outlook90d}</p>
          </div>
        </div>
      )}
    </motion.section>
  )
}
