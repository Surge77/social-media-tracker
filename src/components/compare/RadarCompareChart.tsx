'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { CompareData } from '@/types'

interface RadarCompareChartProps {
  compareData: CompareData
  className?: string
}

export function RadarCompareChart({ compareData, className }: RadarCompareChartProps) {
  const prefersReducedMotion = useReducedMotion()

  // Prepare data for radar chart
  const radarData = [
    {
      dimension: 'GitHub',
      ...compareData.technologies.reduce((acc, tech) => {
        acc[tech.name] = tech.github_score || 0
        return acc
      }, {} as Record<string, number>),
    },
    {
      dimension: 'Community',
      ...compareData.technologies.reduce((acc, tech) => {
        acc[tech.name] = tech.community_score || 0
        return acc
      }, {} as Record<string, number>),
    },
    {
      dimension: 'Jobs',
      ...compareData.technologies.reduce((acc, tech) => {
        acc[tech.name] = tech.jobs_score || 0
        return acc
      }, {} as Record<string, number>),
    },
    {
      dimension: 'Ecosystem',
      ...compareData.technologies.reduce((acc, tech) => {
        acc[tech.name] = tech.ecosystem_score || 0
        return acc
      }, {} as Record<string, number>),
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="rounded-lg border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="mb-1.5 text-xs font-semibold text-foreground">
          {payload[0].payload.dimension}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.stroke }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}:</span>
              <span className="text-xs font-semibold text-foreground">
                {Math.round(entry.value)}/100
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border border-border bg-card/30 p-6', className)}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Dimension Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Visual breakdown across all four core metrics
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={6}
          />

          {compareData.technologies.map((tech, index) => (
            <Radar
              key={tech.slug}
              name={tech.name}
              dataKey={tech.name}
              stroke={tech.color}
              fill={tech.color}
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: tech.color,
                strokeWidth: 0,
              }}
              activeDot={{
                r: 6,
                fill: tech.color,
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={800}
              animationBegin={index * 150}
            />
          ))}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px',
              fontWeight: 500,
            }}
            iconType="circle"
            formatter={(value: string, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend explanation */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card/50 p-2.5">
          <p className="text-xs font-semibold text-foreground">What to look for:</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Larger area = stronger overall. Check for gaps between technologies.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card/50 p-2.5">
          <p className="text-xs font-semibold text-foreground">Overlapping areas:</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Show direct competition. Distinct shapes show different strengths.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
