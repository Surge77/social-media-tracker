'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Crown,
  TrendingUp,
  Briefcase,
  Rocket,
  Shield,
  Zap,
  Trophy,
  Target,
  ChevronRight,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import type { TechnologyWithScore } from '@/types'

interface StrategicOverviewProps {
  technologies: TechnologyWithScore[]
}

export function StrategicOverview({ technologies }: StrategicOverviewProps) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()

  // Filter out techs without scores
  const validTechs = technologies.filter((t) => t.composite_score !== null)

  // Category: Overall Champion (highest composite score)
  const overallChampion = [...validTechs].sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0))[0]

  // Category: Rising Stars (high momentum + good score)
  const risingStars = [...validTechs]
    .filter((t) => (t.momentum || 0) > 5 && (t.composite_score || 0) > 40)
    .sort((a, b) => (b.momentum || 0) - (a.momentum || 0))
    .slice(0, 3)

  // Category: Job Market Leaders (highest jobs score)
  const jobLeaders = [...validTechs]
    .sort((a, b) => (b.jobs_score || 0) - (a.jobs_score || 0))
    .slice(0, 3)

  // Category: Safe Bets (high score + low/positive momentum)
  const safeBets = [...validTechs]
    .filter((t) => (t.composite_score || 0) > 65 && (t.momentum || 0) >= -2)
    .sort((a, b) => (b.composite_score || 0) - (a.composite_score || 0))
    .slice(0, 3)

  // Category: Ecosystem Giants (highest ecosystem score)
  const ecosystemGiants = [...validTechs]
    .sort((a, b) => (b.ecosystem_score || 0) - (a.ecosystem_score || 0))
    .slice(0, 3)

  // Category: Avoid These (low score + declining)
  const riskZone = [...validTechs]
    .filter((t) => (t.composite_score || 0) < 35 || (t.momentum || 0) < -5)
    .sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0))
    .slice(0, 3)

  const TechChip = ({ tech, showMomentum = false, showScore = true }: {
    tech: TechnologyWithScore
    showMomentum?: boolean
    showScore?: boolean
  }) => (
    <motion.button
      whileHover={prefersReducedMotion ? {} : { x: 4 }}
      onClick={() => router.push(`/technologies/${tech.slug}`)}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: tech.color }}
        />
        <span className="text-sm font-medium text-foreground truncate">{tech.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showScore && (
          <span className={cn(
            "text-xs font-bold tabular-nums",
            (tech.composite_score || 0) >= 70 ? "text-emerald-400" :
            (tech.composite_score || 0) >= 40 ? "text-amber-400" : "text-red-400"
          )}>
            {tech.composite_score?.toFixed(0)}
          </span>
        )}
        {showMomentum && tech.momentum !== null && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold",
            tech.momentum > 0 ? "text-emerald-400" : tech.momentum < 0 ? "text-red-400" : "text-muted-foreground"
          )}>
            <TrendingUp className="h-3 w-3" />
            {tech.momentum > 0 ? '+' : ''}{tech.momentum.toFixed(0)}
          </span>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </motion.button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Strategic Overview</h3>
        <p className="text-sm text-muted-foreground">
          Cut through the noise — see what actually matters for your career
        </p>
      </div>

      {/* Overall Champion - Big Feature */}
      {overallChampion && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="group relative overflow-hidden rounded-xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/20 p-3 shrink-0">
              <Crown className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Overall Champion
                </span>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: overallChampion.color }}
                />
              </div>
              <h4 className="text-2xl font-bold text-foreground">{overallChampion.name}</h4>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {overallChampion.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-muted-foreground">Score</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {overallChampion.composite_score?.toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">Jobs</span>
                  <span className="text-sm font-bold text-blue-400">
                    {overallChampion.jobs_score?.toFixed(0)}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-muted-foreground">Momentum</span>
                  <span className="text-sm font-bold text-amber-400">
                    {overallChampion.momentum !== null ? (overallChampion.momentum > 0 ? '+' : '') + overallChampion.momentum.toFixed(0) : 'N/A'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/technologies/${overallChampion.slug}`)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                View Full Analysis
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Grid of Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rising Stars */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card/30 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Rocket className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Rising Stars</h4>
              <p className="text-xs text-muted-foreground">High momentum + solid scores</p>
            </div>
          </div>
          <div className="space-y-2">
            {risingStars.length > 0 ? (
              risingStars.map((tech, idx) => (
                <motion.div
                  key={tech.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 + idx * 0.05 }}
                >
                  <TechChip tech={tech} showMomentum />
                </motion.div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No rising stars match criteria</p>
            )}
          </div>
        </motion.div>

        {/* Job Market Leaders */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border bg-card/30 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Job Market Leaders</h4>
              <p className="text-xs text-muted-foreground">Most career opportunities</p>
            </div>
          </div>
          <div className="space-y-2">
            {jobLeaders.map((tech, idx) => (
              <motion.div
                key={tech.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.15 + idx * 0.05 }}
              >
                <TechChip tech={tech} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Safe Bets */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card/30 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Shield className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Safe Bets</h4>
              <p className="text-xs text-muted-foreground">Mature, stable, reliable</p>
            </div>
          </div>
          <div className="space-y-2">
            {safeBets.map((tech, idx) => (
              <motion.div
                key={tech.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 + idx * 0.05 }}
              >
                <TechChip tech={tech} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ecosystem Giants */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-border bg-card/30 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Ecosystem Giants</h4>
              <p className="text-xs text-muted-foreground">Most tools & libraries</p>
            </div>
          </div>
          <div className="space-y-2">
            {ecosystemGiants.map((tech, idx) => (
              <motion.div
                key={tech.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.25 + idx * 0.05 }}
              >
                <TechChip tech={tech} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Risk Zone (Optional - only show if there are risky techs) */}
      {riskZone.length > 0 && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl border border-red-500/30 bg-red-500/5 p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-500/10 p-2">
              <Zap className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Proceed with Caution</h4>
              <p className="text-xs text-muted-foreground">Low scores or declining momentum</p>
            </div>
          </div>
          <div className="space-y-2">
            {riskZone.map((tech, idx) => (
              <motion.div
                key={tech.id}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + idx * 0.05 }}
              >
                <TechChip tech={tech} showMomentum />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary Insight */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="rounded-lg border border-primary/20 bg-primary/5 p-4"
      >
        <p className="text-xs font-semibold text-foreground">💡 Quick Takeaway</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Looking for safety? Check <span className="font-semibold text-foreground">Safe Bets</span>.
          Want to ride the wave? Go with <span className="font-semibold text-foreground">Rising Stars</span>.
          Need a job now? Focus on <span className="font-semibold text-foreground">Job Market Leaders</span>.
          {overallChampion && (
            <> Can't decide? <span className="font-semibold text-foreground">{overallChampion.name}</span> dominates overall.</>
          )}
        </p>
      </motion.div>
    </div>
  )
}
