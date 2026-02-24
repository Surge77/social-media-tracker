'use client'

import React, { useId } from 'react'
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  className?: string
  width?: number
  height?: number
  color?: string
  showDelta?: boolean
}

export const Sparkline = React.forwardRef<HTMLDivElement, SparklineProps>(
  ({ data, className, width = 60, height = 24, color, showDelta = true }, ref) => {
    const rawId = useId()
    const gradientId = `sg${rawId.replace(/[^a-zA-Z0-9]/g, '')}`

    if (!data || data.length === 0) {
      return (
        <div ref={ref} className={className} style={{ width, height }}>
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            --
          </div>
        </div>
      )
    }

    const chartData = data.map((value, index) => ({ value, index }))

    // Trend direction
    const trend = data[data.length - 1] - data[0]
    const strokeColor = color || (
      trend > 3 ? '#10B981' :
        trend < -3 ? '#EF4444' :
          '#64748B'
    )

    // Dynamic Y-axis: scale to data's actual range so small variations are visible
    const dataMin = Math.min(...data)
    const dataMax = Math.max(...data)
    const dataRange = dataMax - dataMin
    // Ensure a minimum spread of 5 points so even flat data gets some visual padding
    const effectiveRange = Math.max(dataRange, 5)
    const padding = effectiveRange * 0.2 // 20% padding on each side
    const yMin = Math.max(0, Math.floor(dataMin - padding))
    const yMax = Math.min(100, Math.ceil(dataMax + padding))

    // Delta badge
    const first = data[0]
    const last = data[data.length - 1]
    const deltaAbs = last - first
    const deltaPercent = first > 0 ? (deltaAbs / first) * 100 : 0
    const isMeaningful = Math.abs(deltaAbs) >= 3
    const deltaStr = first > 0
      ? `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}%`
      : `${deltaAbs > 0 ? '+' : ''}${deltaAbs.toFixed(1)}`
    const deltaClass =
      trend > 3 ? 'text-emerald-500' :
        trend < -3 ? 'text-red-500' :
          'text-slate-500'

    return (
      <div ref={ref} className={`flex items-center gap-1.5 ${className ?? ''}`}>
        <div style={{ width, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={[yMin, yMax]} hide />
              <Area
                type="natural"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={(props: { cx?: number; cy?: number; index?: number }) => {
                  const { cx, cy, index } = props
                  if (index !== data.length - 1) return <g key={index} />
                  return (
                    <circle
                      key="end"
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill={strokeColor}
                      stroke="var(--background)"
                      strokeWidth={1}
                    />
                  )
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {showDelta && (
          <span
            className={`text-[10px] font-mono font-medium tabular-nums leading-none ${isMeaningful ? deltaClass : 'text-muted-foreground'
              }`}
          >
            {deltaStr}
          </span>
        )}
      </div>
    )
  }
)

Sparkline.displayName = 'Sparkline'
