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
import type { ChartDataPoint } from '@/types'

interface TrendChartProps {
  data: ChartDataPoint[]
  className?: string
}

const SCORE_ZONES = [
  { y1: 70, y2: 100, fill: '#10B981', label: 'Strong' },
  { y1: 40, y2: 70, fill: '#F59E0B', label: 'Moderate' },
  { y1: 0, y2: 40, fill: '#EF4444', label: 'Low' },
] as const

export const TrendChart = React.forwardRef<HTMLDivElement, TrendChartProps>(
  ({ data, className }, ref) => {
    // Compute period change stats
    const periodStats = useMemo(() => {
      if (!data || data.length < 2) return null
      const first = data[0]
      const last = data[data.length - 1]
      const change = last.composite - first.composite
      const pctChange = first.composite > 0
        ? ((change / first.composite) * 100)
        : 0
      return { change: Math.round(change * 10) / 10, pctChange: Math.round(pctChange * 10) / 10 }
    }, [data])

    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={className}
          style={{ width: '100%', height: 400 }}
        >
          <div className="flex h-full items-center justify-center rounded-lg border border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No chart data available</p>
          </div>
        </div>
      )
    }

    // Format date for display
    const formatDate = (dateStr: unknown) => {
      const date = new Date(String(dateStr))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    // Custom tooltip with context
    const CustomTooltip = ({ active, payload, label }: {
      active?: boolean
      payload?: Array<{ name: string; value: number; color: string }>
      label?: unknown
    }) => {
      if (!active || !payload || payload.length === 0) return null

      const dateStr = formatDate(label)
      const composite = payload.find(p => p.name === 'Composite')?.value ?? 0
      const scoreLevel = composite >= 70 ? 'Strong' : composite >= 40 ? 'Moderate' : 'Low'
      const scoreColor = composite >= 70 ? 'text-emerald-400' : composite >= 40 ? 'text-amber-400' : 'text-red-400'

      return (
        <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{dateStr}</p>
          <div className="space-y-1">
            {payload.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-xs">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}
                </span>
                <span className={cn(
                  'text-xs font-mono font-semibold',
                  entry.name === 'Composite' ? scoreColor : 'text-foreground/70'
                )}>
                  {Math.round(entry.value)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-1.5 border-t border-border pt-1.5">
            <span className={cn('text-[10px] font-medium', scoreColor)}>
              {scoreLevel} overall position
            </span>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {/* Period change summary */}
        {periodStats && (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">30-day change:</span>
            <span className={cn(
              'inline-flex items-center gap-1 font-semibold',
              periodStats.change > 0 ? 'text-emerald-400' :
              periodStats.change < 0 ? 'text-red-400' : 'text-muted-foreground'
            )}>
              {periodStats.change > 0 ? (
                <TrendingUp size={13} />
              ) : periodStats.change < 0 ? (
                <TrendingDown size={13} />
              ) : (
                <Minus size={13} />
              )}
              {periodStats.change > 0 ? '+' : ''}{periodStats.change} pts
              ({periodStats.pctChange > 0 ? '+' : ''}{periodStats.pctChange}%)
            </span>
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
              <Line
                type="monotone"
                dataKey="composite"
                name="Composite"
                stroke="#F59E0B"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="github"
                name="GitHub"
                stroke="#8B5CF6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="community"
                name="Community"
                stroke="#06B6D4"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="jobs"
                name="Jobs"
                stroke="#10B981"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="ecosystem"
                name="Ecosystem"
                stroke="#F97316"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }
)

TrendChart.displayName = 'TrendChart'
