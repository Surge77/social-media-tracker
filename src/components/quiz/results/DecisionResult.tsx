'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  GitCompare,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Award,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ResultActions } from '@/components/quiz/ResultActions'
import { NextQuizCTA } from '@/components/quiz/NextQuizCTA'
import { MarketValidationBlock } from '@/components/quiz/MarketValidationBlock'
import { StarterKitBento } from '@/components/quiz/StarterKitBento'
import { CompanionSkills } from '@/components/quiz/CompanionSkills'
import { WeekendProjectCard } from '@/components/quiz/WeekendProjectCard'
import type { QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'

interface DecisionResultProps {
  result: QuizResult
  technologies: TechnologyWithScore[]
  onRetake: () => void
  onClose: () => void
}

export function DecisionResult({
  result,
  technologies,
  onRetake,
  onClose
}: DecisionResultProps) {
  const prefersReducedMotion = useReducedMotion()
  const { recommendation } = result

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
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <QuizContainer
      title="Your Technology Recommendation"
      description="Based on your project requirements and constraints"
      icon={<GitCompare className="w-6 h-6" />}
      gradient="from-orange-500 via-red-500 to-orange-400"
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
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-transparent" />

            <div className="relative p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      BEST CHOICE FOR YOUR PROJECT
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {recommendation.primary.action}
                  </h2>
                  {primaryTech && (
                    <Badge variant="outline" className="mt-2">
                      {primaryTech.category}
                    </Badge>
                  )}
                </div>

                {recommendation.primary.score && (
                  <div className="flex flex-col items-end">
                    <div className="text-3xl font-bold text-primary">
                      {recommendation.primary.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      FIT SCORE
                    </div>
                  </div>
                )}
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                {recommendation.primary.reasoning.map((reason, index) => (
                  <p key={index} className={cn(
                    'text-sm',
                    index === 0 ? 'text-foreground font-medium leading-relaxed' : 'text-foreground/90'
                  )}>
                    {reason}
                  </p>
                ))}
              </div>

              {/* Confidence signal */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>High confidence · Based on {result.answers.length} project requirements + live market data</span>
              </div>

              {/* Tech metrics */}
              {primaryTech && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <MetricCard
                    label="Jobs"
                    value={primaryTech.jobs_score ?? 0}
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                  <MetricCard
                    label="Community"
                    value={primaryTech.community_score ?? 0}
                    icon={<CheckCircle className="w-4 h-4" />}
                  />
                  <MetricCard
                    label="Ecosystem"
                    value={primaryTech.ecosystem_score ?? 0}
                    icon={<Award className="w-4 h-4" />}
                  />
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Market Validation */}
        {recommendation.primary.technology && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <MarketValidationBlock
              slug={recommendation.primary.technology}
              technologies={technologies}
            />
          </motion.div>
        )}

        {/* Starter Kit Bento */}
        {recommendation.primary.technology && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <StarterKitBento slug={recommendation.primary.technology} />
          </motion.div>
        )}

        {/* Companion Skills */}
        {recommendation.primary.technology && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <CompanionSkills
              slug={recommendation.primary.technology}
              technologies={technologies}
            />
          </motion.div>
        )}

        {/* Weekend Project */}
        {recommendation.primary.technology && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <WeekendProjectCard
              slug={recommendation.primary.technology}
              goal={result.answers.find(a => a.questionId === 'use-case')?.value as string}
              level={result.answers.find(a => a.questionId === 'experience-level')?.value as string}
            />
          </motion.div>
        )}

        {/* Alternative */}
        {recommendation.secondary && secondaryTech && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border border-border/50 bg-card/50">
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Badge variant="secondary" className="text-xs mb-2">
                      ALTERNATIVE
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground">
                      {recommendation.secondary.action}
                    </h3>
                  </div>
                  {secondaryTech.composite_score && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {Math.round(secondaryTech.composite_score)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        /100
                      </div>
                    </div>
                  )}
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

        {/* Warnings/Considerations */}
        {recommendation.warnings && recommendation.warnings.length > 0 && (
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <Card className="border-l-4 border-l-warning bg-warning/5">
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-warning uppercase tracking-wider">
                    Important Considerations:
                  </h3>
                </div>
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
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Context Summary */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <Card className="bg-secondary/30">
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Your Requirements:
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {result.answers.map((answer) => {
                  const question = getQuestionLabel(answer.questionId)
                  const value = Array.isArray(answer.value)
                    ? answer.value.join(', ')
                    : getAnswerLabel(answer.questionId, answer.value as string)

                  return (
                    <div key={answer.questionId}>
                      <div className="text-muted-foreground">{question}</div>
                      <div className="font-medium text-foreground">{value || 'None'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
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
          <NextQuizCTA currentQuiz="decision" />
        </motion.div>

        {/* Actions */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <ResultActions
            onRetake={onRetake}
            retakeLabel="Try Different Options"
            shareText={`My DevTrends framework recommendation: ${recommendation.primary.action}`}
          />
        </motion.div>
      </motion.div>
    </QuizContainer>
  )
}

// Metric Card Component
function MetricCard({
  label,
  value,
  icon
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {Math.round(value)}
      </div>
    </div>
  )
}

// Helper functions
function getQuestionLabel(questionId: string): string {
  const labels: Record<string, string> = {
    'use-case': 'Use Case',
    'experience-level': 'Experience',
    'project-constraints': 'Main Constraint',
    'team-size': 'Team Size',
    'must-haves': 'Must-Haves'
  }
  return labels[questionId] || questionId
}

function getAnswerLabel(questionId: string, value: string): string {
  const answerLabels: Record<string, Record<string, string>> = {
    'use-case': {
      'web-app': 'Web Application',
      'mobile-app': 'Mobile App',
      'api': 'API/Backend',
      'static-site': 'Static Site',
      'fullstack': 'Full-Stack App',
      'data-viz': 'Data Visualization'
    },
    'experience-level': {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'expert': 'Expert'
    },
    'project-constraints': {
      'time-to-market': 'Speed to Launch',
      'performance': 'Performance',
      'team-familiarity': 'Team Familiarity',
      'balanced': 'Balanced'
    },
    'team-size': {
      'solo': 'Solo',
      'small': 'Small (2-5)',
      'medium': 'Medium (6-15)',
      'large': 'Large (15+)'
    }
  }

  return answerLabels[questionId]?.[value] || value
}
