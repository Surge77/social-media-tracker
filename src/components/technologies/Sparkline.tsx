'use client'

import React from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  className?: string
  width?: number
  height?: number
  color?: string
}

export const Sparkline = React.forwardRef<HTMLDivElement, SparklineProps>(
  ({ data, className, width = 80, height = 24, color }, ref) => {
    if (!data || data.length === 0) {
      return (
        <div
          ref={ref}
          className={className}
          style={{ width, height }}
        >
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            --
          </div>
        </div>
      )
    }

    // Convert array to chart data format
    const chartData = data.map((value, index) => ({ value, index }))

    // Determine color based on trend (first vs last value)
    const trend = data[data.length - 1] - data[0]
    const strokeColor = color || (
      trend > 5 ? '#10B981' : // emerald-500
      trend < -5 ? '#EF4444' : // red-500
      '#64748B' // slate-500
    )

    return (
      <div ref={ref} className={className} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
)

Sparkline.displayName = 'Sparkline'
