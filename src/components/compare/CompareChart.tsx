'use client'

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompareChartProps {
  data: Array<Record<string, string | number>>
  technologies: Array<{ slug: string; name: string; color: string }>
  className?: string
}

const SCORE_ZONES = [
  { y1: 70, y2: 100, fill: '#10B981', label: 'Strong' },
  { y1: 40, y2: 70, fill: '#F59E0B', label: 'Moderate' },
  { y1: 0, y2: 40, fill: '#EF4444', label: 'Low' },
] as const

export const CompareChart = React.forwardRef<HTMLDivElement, CompareChartProps>(
  ({ data, technologies, className }, ref) => {
    // Compute period changes for each technology
    const periodChanges = useMemo(() => {
      if (!data || data.length < 2) return []
      const first = data[0]
      const last = data[data.length - 1]
      return technologies.map((tech) => {
        const startVal = Number(first[tech.slug]) || 0
        const endVal = Number(last[tech.slug]) || 0
        const change = Math.round((endVal - startVal) * 10) / 10
        return { name: tech.name, color: tech.color, change }
      })
    }, [data, technologies])

    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={className}
          style={{ width: '100%', height: 400 }}
        >
          <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No comparison data available</p>
          </div>
        </div>
      )
    }

    // Format date for display
    const formatDate = (dateStr: unknown) => {
      const date = new Date(String(dateStr))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: {
      active?: boolean
      payload?: Array<{ name: string; value: number; color: string }>
      label?: unknown
    }) => {
      if (!active || !payload || payload.length === 0) return null

      const dateStr = formatDate(label)
      // Sort by value descending in tooltip
      const sorted = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{dateStr}</p>
          <div className="space-y-1">
            {sorted.map((entry, i) => {
              const scoreLevel = entry.value >= 70 ? 'text-emerald-400' :
                entry.value >= 40 ? 'text-amber-400' : 'text-red-400'
              return (
                <div key={entry.name} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}
                    {i === 0 && sorted.length > 1 && (
                      <span className="text-[10px] text-amber-400/60">leading</span>
                    )}
                  </span>
                  <span className={cn('text-xs font-mono font-semibold', scoreLevel)}>
                    {Math.round(entry.value)}
                  </span>
                </div>
              )
            })}
          </div>
          {sorted.length >= 2 && (
            <div className="mt-1.5 border-t border-border pt-1.5">
              <span className="text-[10px] text-muted-foreground">
                Gap: {Math.round((sorted[0].value ?? 0) - (sorted[sorted.length - 1].value ?? 0))} pts
              </span>
            </div>
          )}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Period change pills */}
        {periodChanges.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-muted-foreground">30-day change:</span>
            {periodChanges.map((pc) => (
              <span
                key={pc.name}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
                  pc.change > 0 ? 'border-emerald-500/20 text-emerald-400' :
                  pc.change < 0 ? 'border-red-500/20 text-red-400' :
                  'border-border text-muted-foreground'
                )}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: pc.color }}
                />
                {pc.change > 0 ? (
                  <TrendingUp size={11} />
                ) : pc.change < 0 ? (
                  <TrendingDown size={11} />
                ) : (
                  <Minus size={11} />
                )}
                {pc.change > 0 ? '+' : ''}{pc.change}
              </span>
            ))}
            {/* Score zone legend */}
            <div className="ml-auto hidden items-center gap-3 sm:flex">
              {SCORE_ZONES.map((zone) => (
                <span key={zone.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span
                    className="inline-block h-2 w-4 rounded-sm"
                    style={{ backgroundColor: zone.fill, opacity: 0.15 }}
                  />
                  {zone.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              {/* Score zone backgrounds */}
              {SCORE_ZONES.map((zone) => (
                <ReferenceArea
                  key={zone.label}
                  y1={zone.y1}
                  y2={zone.y2}
                  fill={zone.fill}
                  fillOpacity={0.04}
                />
              ))}

              {/* Threshold reference lines */}
              <ReferenceLine y={70} stroke="#10B981" strokeOpacity={0.2} strokeDasharray="4 4" />
              <ReferenceLine y={40} stroke="#F59E0B" strokeOpacity={0.2} strokeDasharray="4 4" />

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
                iconType="circle"
                iconSize={8}
              />
              {technologies.map((tech, index) => (
                <Line
                  key={tech.slug}
                  type="monotone"
                  dataKey={tech.slug}
                  name={tech.name}
                  stroke={tech.color}
                  strokeWidth={index === 0 ? 2.5 : 2}
                  dot={false}
                  activeDot={{ r: index === 0 ? 5 : 4, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }
)

CompareChart.displayName = 'CompareChart'
