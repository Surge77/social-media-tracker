'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Share2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'

interface LearnNextResultProps {
  result: QuizResult
  technologies: TechnologyWithScore[]
  onRetake: () => void
  onClose: () => void
}

export function LearnNextResult({
  result,
  technologies,
  onRetake,
  onClose
}: LearnNextResultProps) {
  const prefersReducedMotion = useReducedMotion()
  const { recommendation } = result

  // Find the recommended technology
  const primaryTech = technologies.find(
    t => t.slug === recommendation.primary.technology
  )

  const secondaryTech = recommendation.secondary?.technology
    ? technologies.find(t => t.slug === recommendation.secondary?.technology)
    : null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <QuizContainer
      title="Your Learning Recommendation"
      description="Based on your skills, goals, and available time"
      icon={<Target className="w-6 h-6" />}
      gradient="from-blue-500 via-indigo-500 to-blue-400"
      showBackButton={false}
      onClose={onClose}
    >
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? false : 'visible'}
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="space-y-6"
      >
        {/* Primary Recommendation */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card className="relative overflow-hidden border-2 border-primary/50 bg-primary/5">
            {/* Gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent" />

            <div className="relative p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      RECOMMENDED FOR YOU
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {recommendation.primary.action}
                  </h2>
                </div>

                {recommendation.primary.score && (
                  <div className="flex flex-col items-end">
                    <div className="text-3xl font-bold text-primary">
                      {recommendation.primary.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /100 SCORE
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {recommendation.primary.timeline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{recommendation.primary.timeline}</span>
                </div>
              )}

              {/* Reasoning */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Why This Makes Sense:
                </h3>
                <ul className="space-y-2">
                  {recommendation.primary.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="text-sm text-foreground/90">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technology metrics (if available) */}
              {primaryTech && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <MetricCard
                    label="Jobs"
                    value={primaryTech.jobs_score ?? 0}
                    trend={getTrend(primaryTech.momentum ?? 0)}
                  />
                  <MetricCard
                    label="Momentum"
                    value={normalizeMomentum(primaryTech.momentum ?? 0)}
                    trend={getTrend(primaryTech.momentum ?? 0)}
                  />
                  <MetricCard
                    label="Ecosystem"
                    value={primaryTech.ecosystem_score ?? 0}
                    trend={getTrend(primaryTech.momentum ?? 0)}
                  />
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Alternative (if available) */}
        {recommendation.secondary && secondaryTech && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border border-border/50 bg-card/50">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    ALTERNATIVE
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground">
                    {recommendation.secondary.action}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {recommendation.secondary.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span className="text-sm text-muted-foreground">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Warnings (if any) */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border-l-4 border-l-warning bg-warning/5">
              <div className="p-6 space-y-2">
                <h3 className="text-sm font-semibold text-warning uppercase tracking-wider">
                  Things to Know:
                </h3>
                <ul className="space-y-2">
                  {recommendation.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                      <span className="text-sm text-foreground/90">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Next Steps:
            </h3>
            <div className="grid gap-2">
              {recommendation.nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Related Links */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendation.relatedLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  'group flex items-center justify-between p-4 rounded-xl',
                  'border-2 border-border hover:border-primary/50',
                  'bg-card hover:bg-primary/5',
                  'transition-all'
                )}
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="flex flex-wrap items-center gap-3 pt-6 border-t border-border"
        >
          <Button
            onClick={onRetake}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>

          <Button
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={() => {
              // TODO: Implement save to favorites
              alert('Save feature coming soon!')
            }}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save Result
          </Button>

          <Button
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={() => {
              // TODO: Implement share
              alert('Share feature coming soon!')
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </motion.div>
    </QuizContainer>
  )
}

// Metric Card Component
function MetricCard({
  label,
  value,
  trend
}: {
  label: string
  value: number
  trend: 'up' | 'down' | 'neutral'
}) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-2xl font-bold text-foreground">
        {Math.round(value)}
      </div>
      <div className="flex items-center gap-1">
        <TrendIcon className={cn('w-3 h-3', trendColor)} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

// Helper: Get trend from momentum
function getTrend(momentum: number): 'up' | 'down' | 'neutral' {
  if (momentum > 3) return 'up'
  if (momentum < -3) return 'down'
  return 'neutral'
}

// Helper: Normalize momentum to 0-100
function normalizeMomentum(momentum: number): number {
  const normalized = ((momentum + 20) / 40) * 100
  return Math.max(0, Math.min(100, normalized))
}
