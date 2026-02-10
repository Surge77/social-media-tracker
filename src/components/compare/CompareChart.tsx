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

interface CompareChartProps {
  data: Array<Record<string, string | number>>
  technologies: Array<{ slug: string; name: string; color: string }>
  className?: string
}

export const CompareChart = React.forwardRef<HTMLDivElement, CompareChartProps>(
  ({ data, technologies, className }, ref) => {
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
            {technologies.map((tech, index) => (
              <Line
                key={tech.slug}
                type="monotone"
                dataKey={tech.slug}
                name={tech.name}
                stroke={tech.color}
                strokeWidth={index === 0 ? 2.5 : 2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }
)

CompareChart.displayName = 'CompareChart'
