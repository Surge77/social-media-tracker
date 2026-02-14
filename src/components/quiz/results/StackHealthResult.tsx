'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  RotateCcw,
  Bookmark,
  Share2
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
import { getMomentumInsight } from '@/lib/quiz/stack-health-engine'

interface StackHealthResultProps {
  result: QuizResult
  technologies: TechnologyWithScore[]
  onRetake: () => void
  onClose: () => void
}

export function StackHealthResult({
  result,
  technologies,
  onRetake,
  onClose
}: StackHealthResultProps) {
  const prefersReducedMotion = useReducedMotion()
  const { recommendation } = result

  // Get user's stack
  const stackSlugs = result.answers.find(a => a.questionId === 'daily-stack')?.value as string[] || []
  const stackTechs = technologies.filter(t => stackSlugs.includes(t.slug))

  // Categorize technologies
  const categorized = stackTechs.map(tech => ({
    tech,
    status: categorizeTechHealth(tech)
  }))

  const strong = categorized.filter(c => c.status === 'strong')
  const watch = categorized.filter(c => c.status === 'watch')
  const risk = categorized.filter(c => c.status === 'risk')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <QuizContainer
      title="Your Stack Health Report"
      description="Analysis of your current technology stack"
      icon={<Activity className="w-6 h-6" />}
      gradient="from-green-500 via-emerald-500 to-green-400"
      showBackButton={false}
      onClose={onClose}
    >
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? false : 'visible'}
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="space-y-6"
      >
        {/* Overall Health Score */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card className="relative overflow-hidden border-2 border-primary/50 bg-primary/5">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent" />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {recommendation.primary.action}
                  </h2>
                  <div className="text-lg text-muted-foreground">
                    {getHealthLabel(recommendation.primary.score ?? 0)}
                  </div>
                </div>

                {recommendation.primary.score !== undefined && (
                  <div className="flex flex-col items-end">
                    <div
                      className={cn(
                        'text-4xl font-bold',
                        getScoreColor(recommendation.primary.score)
                      )}
                    >
                      {recommendation.primary.score}
                    </div>
                    <div className="text-xs text-muted-foreground">/100</div>
                  </div>
                )}
              </div>

              {/* AI Summary */}
              <div className="space-y-3">
                {recommendation.primary.reasoning.map((reason, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-sm',
                      index === 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {reason}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Strong Technologies */}
        {strong.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-foreground">
                  Strong Technologies ({strong.length})
                </h3>
              </div>
              <div className="grid gap-3">
                {strong.map(({ tech }) => (
                  <TechStatusCard
                    key={tech.slug}
                    tech={tech}
                    status="strong"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Watch Closely */}
        {watch.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-foreground">
                  Watch Closely ({watch.length})
                </h3>
              </div>
              <div className="grid gap-3">
                {watch.map(({ tech }) => (
                  <TechStatusCard
                    key={tech.slug}
                    tech={tech}
                    status="watch"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Area */}
        {risk.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">
                  Risk Area ({risk.length})
                </h3>
              </div>
              <div className="grid gap-3">
                {risk.map(({ tech }) => (
                  <TechStatusCard
                    key={tech.slug}
                    tech={tech}
                    status="risk"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Warnings */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border-l-4 border-l-warning bg-warning/5">
              <div className="p-6 space-y-3">
                <h3 className="text-sm font-semibold text-warning uppercase tracking-wider">
                  Important Considerations:
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
              Recommended Actions:
            </h3>
            <div className="grid gap-2">
              {recommendation.nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
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
            Check Again
          </Button>

          <Button
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={() => alert('Save feature coming soon!')}
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Save Report
          </Button>

          <Button
            variant="ghost"
            className="flex-1 sm:flex-none"
            onClick={() => alert('Share feature coming soon!')}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </motion.div>
      </motion.div>
    </QuizContainer>
  )
}

// Tech Status Card Component
function TechStatusCard({
  tech,
  status
}: {
  tech: TechnologyWithScore
  status: 'strong' | 'watch' | 'risk'
}) {
  const TrendIcon = getTrendIcon(tech.momentum ?? 0)
  const statusConfig = {
    strong: {
      bg: 'bg-success/5',
      border: 'border-success/20',
      textColor: 'text-success'
    },
    watch: {
      bg: 'bg-warning/5',
      border: 'border-warning/20',
      textColor: 'text-warning'
    },
    risk: {
      bg: 'bg-destructive/5',
      border: 'border-destructive/20',
      textColor: 'text-destructive'
    }
  }

  const config = statusConfig[status]

  return (
    <Card className={cn('border-l-4', config.border, config.bg)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{tech.name}</h4>
              <Badge variant="outline" className="text-xs">
                {tech.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendIcon className={cn('w-3 h-3', config.textColor)} />
                <span>{getMomentumInsight(tech.momentum)}</span>
              </div>
              <span>Jobs: {tech.jobs_score?.toFixed(0) ?? 'N/A'}/100</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {tech.composite_score?.toFixed(0) ?? 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">/100</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Helper: Categorize tech health
function categorizeTechHealth(tech: TechnologyWithScore): 'strong' | 'watch' | 'risk' {
  const score = tech.composite_score ?? 0
  const momentum = tech.momentum ?? 0

  if (score >= 60 && momentum > -3) return 'strong'
  if (score >= 40 && momentum > -8) return 'watch'
  return 'risk'
}

// Helper: Get health label
function getHealthLabel(score: number): string {
  if (score >= 80) return 'Excellent - Top tier stack'
  if (score >= 70) return 'Very Good - Solid foundation'
  if (score >= 60) return 'Good - Competitive stack'
  if (score >= 50) return 'Fair - Room for improvement'
  if (score >= 40) return 'Needs Attention - Plan upgrades'
  return 'Critical - Urgent action needed'
}

// Helper: Get score color
function getScoreColor(score: number): string {
  if (score >= 70) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-destructive'
}

// Helper: Get trend icon
function getTrendIcon(momentum: number) {
  if (momentum > 3) return TrendingUp
  if (momentum < -3) return TrendingDown
  return Minus
}
