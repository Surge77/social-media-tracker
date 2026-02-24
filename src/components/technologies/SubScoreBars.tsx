'use client'

import React from 'react'

interface SubScoreBarsProps {
  github:    number | null
  community: number | null
  jobs:      number | null
  ecosystem: number | null
}

const BARS = [
  { key: 'github',    label: 'GH', color: '#8b5cf6' },
  { key: 'community', label: 'CO', color: '#06b6d4' },
  { key: 'jobs',      label: 'JB', color: '#10b981' },
  { key: 'ecosystem', label: 'EC', color: '#f59e0b' },
] as const

const TRACK_H  = 24 // total track height px
const BAR_W    = 10 // bar width px
const GAP      = 3  // gap between bars px

export function SubScoreBars({ github, community, jobs, ecosystem }: SubScoreBarsProps) {
  const values: Record<string, number | null> = { github, community, jobs, ecosystem }
  const hasAnyData = Object.values(values).some((v) => v !== null && v > 0)

  return (
    <div className="flex shrink-0 flex-col items-center gap-[3px]">
      {/* Bar tracks */}
      <div className="flex items-end" style={{ gap: GAP }}>
        {BARS.map(({ key, color }) => {
          const raw   = values[key]
          const score = raw ?? 0
          const fillH = hasAnyData
            ? Math.max(3, Math.round((score / 100) * TRACK_H))
            : 0

          return (
            <div
              key={key}
              className="relative overflow-hidden rounded-[2px]"
              style={{ width: BAR_W, height: TRACK_H, backgroundColor: `${color}18` }}
            >
              {/* Fill from bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-[2px]"
                style={{
                  height: fillH,
                  backgroundColor: color,
                  opacity: raw === null ? 0.3 : 0.85,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex" style={{ gap: GAP }}>
        {BARS.map(({ key, label, color }) => (
          <span
            key={key}
            className="text-center font-mono"
            style={{ width: BAR_W, fontSize: 7, lineHeight: '9px', color: `${color}99` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
