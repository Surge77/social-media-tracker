'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CATEGORY_LABELS, type TechnologyCategory } from '@/types'
import type { TechnologyWithScore } from '@/types'
import { cn } from '@/lib/utils'

interface MarketBubbleMapProps {
  technologies: TechnologyWithScore[]
}

interface BubbleDataPoint {
  x: number // jobs_score
  y: number // community_score
  z: number // bubble radius
  name: string
  slug: string
  color: string
  category: TechnologyCategory
  momentum: number
  composite_score: number
  github_score: number
  ecosystem_score: number
}

export function MarketBubbleMap({ technologies }: MarketBubbleMapProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)

  // Transform technologies into bubble data
  // AGGRESSIVE FILTERING: Only show top technologies with strong scores on BOTH dimensions
  const bubbleData: BubbleDataPoint[] = technologies
    .filter(t =>
      t.jobs_score !== null &&
      t.community_score !== null &&
      t.composite_score !== null &&
      (t.jobs_score ?? 0) > 35 &&        // Must have decent job demand
      (t.community_score ?? 0) > 35 &&   // Must have decent community buzz
      (t.composite_score ?? 0) > 40      // Must have good overall score
    )
    .map(tech => ({
      x: tech.jobs_score ?? 0,
      y: tech.community_score ?? 0,
      z: Math.max(12, ((tech.composite_score ?? 0) / 100) * 45), // 12-45px radius
      name: tech.name,
      slug: tech.slug,
      color: tech.color,
      category: tech.category,
      momentum: tech.momentum ?? 0,
      composite_score: tech.composite_score ?? 0,
      github_score: tech.github_score ?? 0,
      ecosystem_score: tech.ecosystem_score ?? 0,
    }))
    // Sort by composite score and take top 25
    .sort((a, b) => b.composite_score - a.composite_score)
    .slice(0, 25)

  // Calculate dynamic axis domains based on actual data
  const maxY = Math.max(...bubbleData.map(d => d.y), 100)
  const maxX = Math.max(...bubbleData.map(d => d.x), 100)
  const minY = Math.min(...bubbleData.map(d => d.y), 0)
  const minX = Math.min(...bubbleData.map(d => d.x), 0)

  // Use actual data range with padding
  const yDomain = [Math.max(0, minY - 5), Math.min(maxY + 10, 100)]
  const xDomain = [Math.max(0, minX - 5), Math.min(maxX + 10, 100)]

  const handleClick = useCallback((data: BubbleDataPoint) => {
    router.push(`/technologies/${data.slug}`)
  }, [router])

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload as BubbleDataPoint

    const getMomentumLabel = (momentum: number) => {
      if (momentum > 5) return 'Rising'
      if (momentum > 0) return 'Growing'
      if (momentum === 0) return 'Stable'
      if (momentum > -5) return 'Cooling'
      return 'Declining'
    }

    const momentumColor = data.momentum > 0 ? 'text-success' : data.momentum < 0 ? 'text-destructive' : 'text-muted-foreground'

    return (
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between gap-4">
          <span className="font-semibold" style={{ color: data.color }}>
            {data.name}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            ⭐ {data.composite_score.toFixed(0)}
          </span>
        </div>
        <div className="mb-2 space-y-1 border-t pt-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jobs:</span>
            <span className="font-medium">{data.x.toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Community:</span>
            <span className="font-medium">{data.y.toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">GitHub:</span>
            <span className="font-medium">{data.github_score.toFixed(0)}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ecosystem:</span>
            <span className="font-medium">{data.ecosystem_score.toFixed(0)}/100</span>
          </div>
        </div>
        <div className="border-t pt-2">
          <div className={cn('text-xs font-medium', momentumColor)}>
            📈 Momentum: {data.momentum > 0 ? '+' : ''}
            {data.momentum.toFixed(1)} ({getMomentumLabel(data.momentum)})
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Click to view details →
        </div>
      </div>
    )
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const data = payload as BubbleDataPoint
    const isHovered = hoveredTech === data.slug

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={isHovered ? data.z * 1.15 : data.z}
          fill={data.color}
          fillOpacity={isHovered ? 1 : 0.85}
          stroke={isHovered ? 'hsl(var(--primary))' : data.color}
          strokeWidth={isHovered ? 3 : 1}
          strokeOpacity={0.5}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={() => setHoveredTech(data.slug)}
          onMouseLeave={() => setHoveredTech(null)}
          onClick={() => handleClick(data)}
        />
        {/* Show label for ALL bubbles (we're only showing top 25) */}
        <text
          x={cx}
          y={cy - data.z - 8}
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontSize={isHovered ? "13" : "11"}
          fontWeight={isHovered ? "600" : "500"}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          {data.name}
        </text>
      </g>
    )
  }

  const excluded = technologies.length - bubbleData.length

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Top 25 Technologies: Market Position</h3>
          <p className="text-sm text-muted-foreground">
            Job Demand vs Community Buzz • Size = Overall Strength
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-primary">{bubbleData.length} shown</p>
          {excluded > 0 && (
            <p className="text-xs text-muted-foreground">
              {excluded} filtered out
            </p>
          )}
        </div>
      </div>

      <div className="relative rounded-lg border bg-card p-6">
        <ResponsiveContainer width="100%" height={600}>
          <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              name="Job Demand"
              unit="/100"
              domain={xDomain}
              stroke="hsl(var(--muted-foreground))"
              label={{
                value: 'Job Demand →',
                position: 'insideBottom',
                offset: -10,
                style: { fill: 'hsl(var(--foreground))' },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Community Buzz"
              unit="/100"
              domain={yDomain}
              stroke="hsl(var(--muted-foreground))"
              label={{
                value: '← Community Buzz',
                position: 'insideLeft',
                angle: -90,
                offset: 10,
                style: { fill: 'hsl(var(--foreground))' },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            {/* Quadrant dividers */}
            <ReferenceLine
              x={xDomain[1] / 2}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={yDomain[1] / 2}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />

            <Scatter
              data={bubbleData}
              shape={<CustomDot />}
              isAnimationActive={!prefersReducedMotion}
              animationDuration={800}
            />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant labels */}
        <div className="pointer-events-none absolute inset-0 p-6">
          <div className="relative h-full">
            {/* Top-left: Overhyped? */}
            <div className="absolute left-8 top-8 text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-60">
              Overhyped?
            </div>
            {/* Top-right: Safe Bet */}
            <div className="absolute right-8 top-8 text-xs font-medium uppercase tracking-wide text-success opacity-60">
              Safe Bet
            </div>
            {/* Bottom-left: Niche */}
            <div className="absolute bottom-8 left-8 text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-60">
              Niche
            </div>
            {/* Bottom-right: Hidden Gem */}
            <div className="absolute bottom-8 right-8 text-xs font-medium uppercase tracking-wide text-warning opacity-60">
              Hidden Gem
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const categoryTechs = bubbleData.filter(d => d.category === key)
          if (categoryTechs.length === 0) return null
          const color = categoryTechs[0]?.color ?? 'hsl(var(--muted-foreground))'

          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color, opacity: 0.7 }}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
