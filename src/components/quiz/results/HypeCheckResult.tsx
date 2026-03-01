'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ResultActions } from '@/components/quiz/ResultActions'
import { NextQuizCTA } from '@/components/quiz/NextQuizCTA'
import { StarterKitBento } from '@/components/quiz/StarterKitBento'
import { getVideoIntent } from '@/lib/quiz/video-intent'
import type { QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'

interface HypeCheckResultProps {
  result: QuizResult
  technologies: TechnologyWithScore[]
  onRetake: () => void
  onClose: () => void
}

export function HypeCheckResult({
  result,
  technologies,
  onRetake,
  onClose
}: HypeCheckResultProps) {
  const prefersReducedMotion = useReducedMotion()
  const { recommendation } = result

  const techSlug = result.answers.find(a => a.questionId === 'technology')?.value as string
  const tech = technologies.find(t => t.slug === techSlug)

  if (!tech) {
    return (
      <QuizContainer
        title="Technology Not Found"
        description="The selected technology could not be found"
        icon={<Zap className="w-6 h-6" />}
        gradient="from-yellow-500 via-amber-500 to-yellow-400"
        showBackButton={false}
        onClose={onClose}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            We couldn't find data for this technology.
          </p>
          <Button onClick={onRetake}>Try Another Technology</Button>
        </div>
      </QuizContainer>
    )
  }

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

  const hypeGap = (tech.community_score ?? 0) - (tech.jobs_score ?? 0)
  const VerdictIcon = getVerdictIcon(recommendation.primary.action)
  const verdictColor = getVerdictColor(recommendation.primary.action)

  return (
    <QuizContainer
      title={`Hype Check: ${tech.name}`}
      description="Data-driven analysis of buzz vs reality"
      icon={<Zap className="w-6 h-6" />}
      gradient="from-yellow-500 via-amber-500 to-yellow-400"
      showBackButton={false}
      onClose={onClose}
    >
      <motion.div
        initial={prefersReducedMotion ? false : 'hidden'}
        animate={prefersReducedMotion ? false : 'visible'}
        variants={prefersReducedMotion ? undefined : containerVariants}
        className="space-y-6"
      >
        {/* Verdict */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card className={cn('relative overflow-hidden border-2', `border-${verdictColor}/50 bg-${verdictColor}/5`)}>
            <div className={cn('absolute inset-0', `bg-gradient-to-br from-${verdictColor}/10 to-transparent`)} />

            <div className="relative p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${verdictColor}/20`)}>
                  <VerdictIcon className={cn('w-6 h-6', `text-${verdictColor}`)} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {recommendation.primary.action}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tech.name} Analysis
                  </p>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                {recommendation.primary.reasoning.slice(4).map((reason, index) => (
                  <p key={index} className="text-sm text-foreground/90">
                    {reason}
                  </p>
                ))}
              </div>

              {/* Confidence signal */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>High confidence · Live market data analysis</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Data Breakdown */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                The Data Says:
              </h3>

              <div className="grid gap-4">
                {/* Community Buzz */}
                <MetricBar
                  label="Community Buzz"
                  value={tech.community_score ?? 0}
                  color="primary"
                  emoji="🔥"
                />

                {/* Job Demand */}
                <MetricBar
                  label="Job Demand"
                  value={tech.jobs_score ?? 0}
                  color="success"
                  emoji="💼"
                />

                {/* GitHub Activity */}
                <MetricBar
                  label="GitHub Activity"
                  value={tech.github_score ?? 0}
                  color="secondary"
                  emoji="⭐"
                />

                {/* Ecosystem */}
                <MetricBar
                  label="Ecosystem"
                  value={tech.ecosystem_score ?? 0}
                  color="warning"
                  emoji="🌐"
                />
              </div>

              {/* Hype Gap */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">
                    HYPE GAP:
                  </span>
                  <span className={cn('text-2xl font-bold', hypeGap > 20 ? 'text-warning' : 'text-foreground')}>
                    {Math.abs(hypeGap)} points
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hypeGap > 0
                    ? `Community buzz is ${Math.abs(hypeGap)} points higher than job demand`
                    : `Job demand is ${Math.abs(hypeGap)} points higher than community buzz`}
                  {Math.abs(hypeGap) > 40 && ' — One of the largest gaps we track'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Momentum & Score */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <div className="grid grid-cols-2 gap-4">
            {/* Momentum */}
            <Card>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {getMomentumIcon(tech.momentum ?? 0)}
                  <h4 className="text-sm font-semibold text-foreground">
                    MOMENTUM
                  </h4>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatMomentum(tech.momentum)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getMomentumLabel(tech.momentum ?? 0)}
                </p>
              </div>
            </Card>

            {/* Overall Score */}
            <Card>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-semibold text-foreground">
                    OVERALL
                  </h4>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(tech.composite_score ?? 0)}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  Composite score
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* The Honest Take (AI-generated) */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card className="border-l-4 border-l-primary bg-primary/5">
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                The Honest Take:
              </h3>
              <p className="text-foreground leading-relaxed">
                {recommendation.nextSteps[0]}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Context-aware video — intent matches the hype verdict */}
        {techSlug && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <StarterKitBento
              slug={techSlug}
              videoIntent={getVideoIntent({
                quizType: 'hype-check',
                hypeVerdict: recommendation.primary.action,
              })}
            />
          </motion.div>
        )}

        {/* Warnings */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border-l-4 border-l-warning bg-warning/5">
              <div className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-warning uppercase tracking-wider">
                    Important:
                  </h3>
                </div>
                <ul className="space-y-1">
                  {recommendation.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                      <span className="text-warning">•</span>
                      <span>{warning}</span>
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
              What To Do:
            </h3>
            <div className="grid gap-2">
              {recommendation.nextSteps.slice(1, 4).map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
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

        {/* Next quiz suggestion */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <NextQuizCTA currentQuiz="hype-check" />
        </motion.div>

        {/* Actions */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <ResultActions
            onRetake={onRetake}
            retakeLabel="Check Another"
            shareText={`I just ran a hype check on ${tech.name}: ${recommendation.primary.action} — DevTrends`}
          />
        </motion.div>
      </motion.div>
    </QuizContainer>
  )
}

// Metric Bar Component
function MetricBar({
  label,
  value,
  color,
  emoji
}: {
  label: string
  value: number
  color: 'primary' | 'success' | 'warning' | 'secondary'
  emoji: string
}) {
  const colorMap = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    secondary: 'bg-secondary'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {emoji} {label}
        </span>
        <span className="text-sm font-bold text-foreground">
          {Math.round(value)}/100
        </span>
      </div>
      <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all', colorMap[color])}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// Helper functions
function getVerdictIcon(action: string) {
  if (action.includes('REAL DEAL')) return CheckCircle
  if (action.includes('EARLY')) return Clock
  if (action.includes('OVERHYPED')) return AlertCircle
  if (action.includes('FADING')) return TrendingDown
  return Zap
}

function getVerdictColor(action: string) {
  if (action.includes('REAL DEAL')) return 'success'
  if (action.includes('EARLY')) return 'primary'
  if (action.includes('OVERHYPED')) return 'warning'
  if (action.includes('FADING')) return 'destructive'
  return 'primary'
}

function getMomentumIcon(momentum: number) {
  if (momentum > 5) return <TrendingUp className="w-4 h-4 text-success" />
  if (momentum < -5) return <TrendingDown className="w-4 h-4 text-destructive" />
  return <Minus className="w-4 h-4 text-muted-foreground" />
}

function formatMomentum(momentum: number | null | undefined): string {
  if (momentum === null || momentum === undefined) return 'N/A'
  return momentum > 0 ? `+${momentum.toFixed(1)}` : momentum.toFixed(1)
}

function getMomentumLabel(momentum: number): string {
  if (momentum > 10) return 'Exploding'
  if (momentum > 5) return 'Rising Fast'
  if (momentum > 0) return 'Growing'
  if (momentum > -5) return 'Declining'
  return 'Rapid Decline'
}
