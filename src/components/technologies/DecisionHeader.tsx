'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { DecisionSummary } from '@/lib/insights'

interface DecisionHeaderProps {
  decisionSummary: DecisionSummary
  techSlug: string
  techName: string
}

const CAREER_CONFIG = {
  'Learn Now': {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
    headerClass: 'text-emerald-400',
  },
  'Watch': {
    icon: <Clock className="h-4 w-4" />,
    className: 'border-amber-500/30 bg-amber-500/8 text-amber-400',
    headerClass: 'text-amber-400',
  },
  'Low Priority': {
    icon: <TrendingDown className="h-4 w-4" />,
    className: 'border-slate-500/30 bg-slate-500/8 text-slate-400',
    headerClass: 'text-slate-400',
  },
} as const

const STACK_CONFIG = {
  'Adopt': {
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
    headerClass: 'text-emerald-400',
  },
  'Pilot': {
    icon: <TrendingUp className="h-4 w-4" />,
    className: 'border-primary/30 bg-primary/8 text-primary',
    headerClass: 'text-primary',
  },
  'Wait': {
    icon: <Minus className="h-4 w-4" />,
    className: 'border-slate-500/30 bg-slate-500/8 text-slate-400',
    headerClass: 'text-slate-400',
  },
} as const

export function DecisionHeader({ decisionSummary, techSlug, techName }: DecisionHeaderProps) {
  const career = CAREER_CONFIG[decisionSummary.career.verdict]
  const stack = STACK_CONFIG[decisionSummary.stack.verdict]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Career Fit Card */}
      <div className={cn('rounded-xl border p-4', career.className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {career.icon}
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Career Fit</span>
          </div>
          <span className={cn('text-lg font-bold', career.headerClass)}>
            {decisionSummary.career.verdict}
          </span>
        </div>
        <ul className="space-y-1">
          {decisionSummary.career.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <span className="mt-0.5 shrink-0 opacity-50">·</span>
              {e}
            </li>
          ))}
        </ul>
        {decisionSummary.career.risks.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-current/10 pt-3">
            {decisionSummary.career.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs opacity-70">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stack Fit Card */}
      <div className={cn('rounded-xl border p-4', stack.className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stack.icon}
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Stack Fit</span>
          </div>
          <span className={cn('text-lg font-bold', stack.headerClass)}>
            {decisionSummary.stack.verdict}
          </span>
        </div>
        <ul className="space-y-1">
          {decisionSummary.stack.evidence.map((e, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
              <span className="mt-0.5 shrink-0 opacity-50">·</span>
              {e}
            </li>
          ))}
        </ul>
        {decisionSummary.stack.risks.length > 0 && (
          <div className="mt-3 space-y-1 border-t border-current/10 pt-3">
            {decisionSummary.stack.risks.map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs opacity-70">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 border-t border-current/10 pt-3">
          <Link
            href={`/compare?a=${techSlug}`}
            className="text-xs font-medium underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            Compare {techName} with alternatives →
          </Link>
        </div>
      </div>
    </div>
  )
}
