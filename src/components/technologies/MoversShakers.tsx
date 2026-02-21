'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Flame } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Sparkline } from './Sparkline'
import { cn } from '@/lib/utils'

interface MoverEntry {
  slug: string
  name: string
  color: string
  category: string
  current_score: number
  previous_score: number
  score_delta: number
  rank_change: number
  current_rank: number
  momentum: number
  primary_driver: string
  sparkline: number[]
}

interface MoversResponse {
  period: '7d' | '30d'
  risers: MoverEntry[]
  fallers: MoverEntry[]
  last_updated: string | null
}

export function MoversShakers() {
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')
  const [data, setData] = useState<MoversResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    async function fetchMovers() {
      setLoading(true)
      try {
        const res = await fetch(`/api/technologies/movers?period=${period}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error('Failed to fetch movers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovers()
  }, [period])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-semibold">This Week&apos;s Movers</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('7d')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              period === '7d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              period === '30d'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            30d
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-6"
            >
              <div className="mb-4 h-6 w-32 rounded bg-muted" />
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-16 rounded bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2"
          variants={prefersReducedMotion ? {} : containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Risers */}
          <motion.div
            className="rounded-lg border bg-card p-6"
            variants={prefersReducedMotion ? {} : itemVariants}
          >
            <div className="mb-4 flex items-center gap-2 text-success">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Rising</h3>
            </div>
            <div className="space-y-3">
              {data.risers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No significant risers this period
                </p>
              ) : (
                data.risers.map((mover, index) => (
                  <MoverRow
                    key={mover.slug}
                    mover={mover}
                    index={index}
                    type="riser"
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Fallers */}
          <motion.div
            className="rounded-lg border bg-card p-6"
            variants={prefersReducedMotion ? {} : itemVariants}
          >
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <TrendingDown className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Falling</h3>
            </div>
            <div className="space-y-3">
              {data.fallers.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No significant fallers this period
                </p>
              ) : (
                data.fallers.map((mover, index) => (
                  <MoverRow
                    key={mover.slug}
                    mover={mover}
                    index={index}
                    type="faller"
                  />
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </section>
  )
}

interface MoverRowProps {
  mover: MoverEntry
  index: number
  type: 'riser' | 'faller'
}

function MoverRow({ mover, index, type }: MoverRowProps) {
  const deltaColor = type === 'riser' ? 'text-success' : 'text-destructive'
  const rankChangeIcon = type === 'riser' ? '▲' : '▼'

  return (
    <Link
      href={`/technologies/${mover.slug}`}
      className="block rounded-md border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">
              {index + 1}.
            </span>
            <span className="font-semibold" style={{ color: mover.color }}>
              {mover.name}
            </span>
            <span className={cn('text-sm font-medium', deltaColor)}>
              {mover.score_delta > 0 ? '+' : ''}
              {mover.score_delta.toFixed(1)}
            </span>
            <span className={cn('text-xs font-medium', deltaColor)}>
              {rankChangeIcon}
              {Math.abs(mover.rank_change)}
            </span>
            {Math.abs(mover.score_delta) > 10 && (
              <span className="text-[10px] font-medium text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
                ⚡ Significant
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {mover.primary_driver}
          </p>
        </div>
        <div className="flex-shrink-0">
          <Sparkline
            data={mover.sparkline}
            width={60}
            height={24}
            color={type === 'riser' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
          />
        </div>
      </div>
    </Link>
  )
}
