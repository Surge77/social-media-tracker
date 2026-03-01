'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  GitBranch,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'
import { TechIcon } from '@/components/shared/TechIcon'
import type { CompareData } from '@/types'

interface CareerScorecardProps {
  compareData: CompareData
  className?: string
}

export function CareerScorecard({ compareData, className }: CareerScorecardProps) {
  const prefersReducedMotion = useReducedMotion()

  // Calculate career metrics for each technology
  const careerMetrics = compareData.technologies.map((tech) => {
    const jobScore = tech.jobs_score || 0
    const momentum = tech.momentum || 0
    const githubScore = tech.github_score || 0
    const communityScore = tech.community_score || 0

    // Demand trajectory based on momentum
    let demandTrend: 'growing' | 'stable' | 'declining'
    if (momentum > 5) demandTrend = 'growing'
    else if (momentum < -5) demandTrend = 'declining'
    else demandTrend = 'stable'

    // Time-to-hire estimate (simplified)
    let timeToHire: string
    if (jobScore > 60) timeToHire = '2-4 weeks'
    else if (jobScore > 40) timeToHire = '1-2 months'
    else if (jobScore > 20) timeToHire = '2-4 months'
    else timeToHire = '4+ months'

    // Skills adjacency (simplified - would use relationship data in real implementation)
    const skillsAdjacency = [
      tech.name === 'React' ? 'Next.js, React Native, Redux' :
      tech.name === 'Vue' ? 'Nuxt, Vuex, Pinia' :
      tech.name === 'Python' ? 'Django, FastAPI, NumPy' :
      tech.name === 'JavaScript' ? 'TypeScript, Node.js, React' :
      tech.name === 'TypeScript' ? 'JavaScript, Node.js, Angular' :
      'Related frameworks & libraries',
    ]

    // Market opportunity score (composite of job score + momentum)
    const opportunityScore = Math.round((jobScore * 0.7) + (Math.max(0, momentum + 10) * 1.5))

    return {
      ...tech,
      demandTrend,
      timeToHire,
      skillsAdjacency,
      opportunityScore: Math.min(100, opportunityScore),
      jobVolume: tech.job_postings || null,
    }
  })

  // Sort by opportunity score
  const sorted = [...careerMetrics].sort((a, b) => b.opportunityScore - a.opportunityScore)

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('rounded-xl border border-border bg-card/30 p-6', className)}
    >
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-foreground">Career Impact Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Job market outlook and career implications
        </p>
      </div>

      <div className="space-y-4">
        {sorted.map((tech, idx) => {
          const isTopChoice = idx === 0

          return (
            <motion.div
              key={tech.slug}
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={cn(
                'rounded-lg border p-4 transition-all',
                isTopChoice
                  ? 'border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md'
                  : 'border-border bg-card/50'
              )}
            >
              {/* Header */}
              <div className="mb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <TechIcon slug={tech.slug} name={tech.name} color={tech.color} size={22} />
                  <h4 className="text-sm font-semibold text-foreground">{tech.name}</h4>
                  {isTopChoice && (
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary whitespace-nowrap">
                      Best Opportunity
                    </span>
                  )}
                </div>

                {/* Opportunity Score */}
                <div className="text-left sm:text-right">
                  <div className="text-lg font-bold text-primary">{tech.opportunityScore}</div>
                  <div className="text-[10px] text-muted-foreground">Opportunity</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
                {/* Job Demand Score */}
                <div className="rounded-md border border-border bg-background/50 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase size={12} />
                    Job Demand
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {tech.jobs_score
                      ? `${Math.round(tech.jobs_score)}/100`
                      : 'N/A'}
                  </div>
                </div>

                {/* Demand Trend */}
                <div className="rounded-md border border-border bg-background/50 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp size={12} />
                    Demand Trend
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-semibold",
                    tech.demandTrend === 'growing' && "text-emerald-400",
                    tech.demandTrend === 'stable' && "text-blue-400",
                    tech.demandTrend === 'declining' && "text-red-400"
                  )}>
                    {tech.demandTrend === 'growing' && <TrendingUp size={14} />}
                    {tech.demandTrend === 'declining' && <TrendingDown size={14} />}
                    {tech.demandTrend === 'stable' && <span className="text-xs">—</span>}
                    <span className="capitalize">{tech.demandTrend}</span>
                  </div>
                </div>

                {/* Time to Hire */}
                <div className="rounded-md border border-border bg-background/50 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock size={12} />
                    Est. Time to Hire
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {tech.timeToHire}
                  </div>
                </div>

                {/* Community */}
                <div className="rounded-md border border-border bg-background/50 p-2.5">
                  <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users size={12} />
                    Community
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {tech.community_score ? `${tech.community_score.toFixed(0)}/100` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Skills Adjacency */}
              <div className="mt-3 rounded-md border border-border bg-background/50 p-2.5">
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GitBranch size={12} />
                  Related Skills (expand opportunities)
                </div>
                <div className="text-xs text-foreground">{tech.skillsAdjacency[0]}</div>
              </div>

              {/* Career Advice */}
              <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-2.5">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {tech.demandTrend === 'growing' && tech.opportunityScore > 60 && (
                    <>
                      <span className="font-semibold text-emerald-400">Strong opportunity.</span> High demand with growing trajectory. Great time to learn or switch.
                    </>
                  )}
                  {tech.demandTrend === 'stable' && tech.opportunityScore > 50 && (
                    <>
                      <span className="font-semibold text-blue-400">Safe bet.</span> Stable demand with good job availability. Reliable career choice.
                    </>
                  )}
                  {tech.demandTrend === 'declining' || tech.opportunityScore < 40 && (
                    <>
                      <span className="font-semibold text-amber-400">Proceed with caution.</span> Limited job opportunities or declining demand. Consider alternatives.
                    </>
                  )}
                  {tech.demandTrend === 'growing' && tech.opportunityScore < 60 && (
                    <>
                      <span className="font-semibold text-cyan-400">Emerging opportunity.</span> Growing but not yet widespread. Early adopter advantage possible.
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-5 rounded-lg border border-border bg-card/50 p-4">
        <p className="text-xs font-semibold text-foreground">💡 Overall Recommendation</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Based on current job market data, <span className="font-semibold text-primary">{sorted[0].name}</span> offers
          the strongest career opportunity with a job demand score of{' '}
          <span className="font-semibold text-primary">{sorted[0].jobs_score ? `${Math.round(sorted[0].jobs_score)}/100` : 'N/A'}</span> and{' '}
          {sorted[0].demandTrend} trajectory. {sorted.length > 1 && (
            <>Learning {sorted[0].skillsAdjacency[0]} alongside {sorted[0].name} maximizes career flexibility.</>
          )}
        </p>
      </div>
    </motion.div>
  )
}
