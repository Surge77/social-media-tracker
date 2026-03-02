'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WhatChanged, DimensionDelta } from '@/lib/insights'

interface WhatChangedPanelProps {
  whatChanged: WhatChanged
}

type Period = '7d' | '30d'

const PERIOD_TABS: Array<{ key: Period; label: string }> = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
]

function DeltaRow({ delta }: { delta: DimensionDelta }) {
  const isUp = delta.direction === 'up'
  const isDown = delta.direction === 'down'
  // Extract the human-readable name from the label (everything except the last token which is the delta)
  const parts = delta.label.split(' ')
  const deltaStr = parts[parts.length - 1]
  const name = parts.slice(0, -1).join(' ')

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{name}</span>
      <div
        className={cn(
          'flex items-center gap-1 text-sm font-medium tabular-nums',
          isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-muted-foreground'
        )}
      >
        {isUp ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : isDown ? (
          <TrendingDown className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
        {deltaStr}
      </div>
    </div>
  )
}

export function WhatChangedPanel({ whatChanged }: WhatChangedPanelProps) {
  const [period, setPeriod] = React.useState<Period>('7d')

  const deltas = period === '7d' ? whatChanged.period7d : whatChanged.period30d

  if (
    whatChanged.period7d.length === 0 &&
    whatChanged.period30d.length === 0 &&
    !whatChanged.topMover7d
  ) {
    return null
  }

  return (
    <div className="rounded-xl border border-border bg-card/30 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">What Changed</h3>
        <div className="flex gap-1">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPeriod(tab.key)}
              className={cn(
                'rounded px-2.5 py-0.5 text-xs font-medium transition-colors',
                period === tab.key
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {deltas.length === 0 ? (
        <p className="text-xs text-muted-foreground">Not enough data for this period.</p>
      ) : (
        <div className="divide-y divide-border/40">
          {deltas.map((d) => (
            <DeltaRow key={d.dimension} delta={d} />
          ))}
        </div>
      )}

      {period === '7d' && whatChanged.topMover7d && (
        <div className="mt-3 rounded-lg bg-muted/20 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Biggest mover:{' '}
            <span className="font-medium text-foreground">
              {whatChanged.topMover7d.label}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
