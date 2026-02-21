'use client'

import { useState } from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

interface MethodologyPanelProps {
  className?: string
}

interface WeightSegment {
  label: string
  value: number
  colorClass: string
  bgClass: string
}

const WEIGHTS: WeightSegment[] = [
  { label: 'GitHub',      value: 25, colorClass: 'text-blue-400',    bgClass: 'bg-blue-400'    },
  { label: 'Community',   value: 25, colorClass: 'text-purple-400',  bgClass: 'bg-purple-400'  },
  { label: 'Jobs',        value: 30, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-400' },
  { label: 'Ecosystem',   value: 20, colorClass: 'text-amber-400',   bgClass: 'bg-amber-400'   },
]

const DATA_SOURCES = [
  'GitHub API',
  'HackerNews',
  'Reddit',
  'Stack Overflow',
  'Adzuna',
  'JSearch',
  'npm',
  'PyPI',
  'Libraries.io',
]

export default function MethodologyPanel({ className }: MethodologyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <aside
      className={cn(
        'rounded-xl border border-border/50 bg-muted/30 text-muted-foreground',
        className,
      )}
    >
      {/* Always-visible header row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-foreground/80 shrink-0">
            📐 How We Score
          </span>
          {!isExpanded && (
            <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
              GitHub 25% · Community 25% · Jobs 30% · Ecosystem 20%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-3 flex items-center gap-0.5"
          aria-expanded={isExpanded}
          aria-controls="methodology-panel-body"
        >
          {isExpanded ? (
            <>▴ Hide</>
          ) : (
            <>▾ Show</>
          )}
        </button>
      </div>

      {/* Expandable body */}
      {isExpanded && (
        <div
          id="methodology-panel-body"
          className="border-t border-border/50 px-4 py-4 space-y-5"
        >
          {/* Weight breakdown bar */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-foreground/70 uppercase tracking-wider">
              Weight Breakdown
            </p>

            {/* Stacked bar */}
            <div className="flex h-2.5 w-full overflow-hidden rounded-full">
              {WEIGHTS.map((seg) => (
                <div
                  key={seg.label}
                  className={cn('h-full', seg.bgClass)}
                  style={{ width: `${seg.value}%` }}
                  title={`${seg.label}: ${seg.value}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {WEIGHTS.map((seg) => (
                <span
                  key={seg.label}
                  className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', seg.colorClass)}
                >
                  <span
                    className={cn('inline-block h-1.5 w-1.5 rounded-full', seg.bgClass)}
                    aria-hidden="true"
                  />
                  {seg.label} {seg.value}%
                </span>
              ))}
            </div>
          </div>

          {/* Data sources */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-foreground/70 uppercase tracking-wider">
              Data Sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DATA_SOURCES.map((source) => (
                <span
                  key={source}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-background/60 border border-border/60 text-muted-foreground"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] text-muted-foreground/70 italic">
              Updated daily via automated cron jobs.
            </p>
            <Link
              href="/methodology"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Full Methodology →
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
