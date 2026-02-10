'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ChartDataPoint } from '@/types'

interface TrendChartProps {
  data: ChartDataPoint[]
  className?: string
}

export const TrendChart = React.forwardRef<HTMLDivElement, TrendChartProps>(
  ({ data, className }, ref) => {
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
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
      <div ref={ref} className={className} style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              }}
              labelFormatter={formatDate}
              formatter={(value: number) => [Math.round(value), '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '0.875rem' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="composite"
              name="Composite"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="github"
              name="GitHub"
              stroke="#8B5CF6"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="community"
              name="Community"
              stroke="#06B6D4"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="jobs"
              name="Jobs"
              stroke="#10B981"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="ecosystem"
              name="Ecosystem"
              stroke="#F59E0B"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
)

TrendChart.displayName = 'TrendChart'
