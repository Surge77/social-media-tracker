'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Map, Activity, Target, GitCompare, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizType } from '@/lib/quiz/types'

interface NextQuizConfig {
  label: string
  description: string
  href: string
  icon: React.ElementType
  gradient: string
}

const NEXT_QUIZ_MAP: Record<QuizType, NextQuizConfig> = {
  'learn-next': {
    label: 'Build Your Career Roadmap',
    description: 'Turn your recommendation into a full step-by-step learning plan',
    href: '/quiz/roadmap',
    icon: Map,
    gradient: 'from-teal-500 to-cyan-500',
  },
  'hype-check': {
    label: 'Check Your Full Stack',
    description: 'Is the rest of your stack keeping up with the market?',
    href: '/quiz/stack-health',
    icon: Activity,
    gradient: 'from-green-500 to-emerald-500',
  },
  'stack-health': {
    label: 'See What to Learn Next',
    description: 'Find out what to add based on where your stack is weak',
    href: '/quiz/learn-next',
    icon: Target,
    gradient: 'from-blue-500 to-indigo-500',
  },
  'decision': {
    label: 'Build a Learning Roadmap',
    description: 'Get a step-by-step plan to master your chosen technology',
    href: '/quiz/roadmap',
    icon: Map,
    gradient: 'from-teal-500 to-cyan-500',
  },
  'roadmap': {
    label: 'Check Your Stack Health',
    description: 'See how your current technologies rank in the market',
    href: '/quiz/stack-health',
    icon: Activity,
    gradient: 'from-green-500 to-emerald-500',
  },
  'salary': {
    label: 'See What to Learn Next',
    description: 'What to learn based on where job demand is actually growing',
    href: '/quiz/learn-next',
    icon: Target,
    gradient: 'from-blue-500 to-indigo-500',
  },
  'future-proof': {
    label: 'Build Your Career Roadmap',
    description: 'Turn your plan into a step-by-step learning path',
    href: '/quiz/roadmap',
    icon: Map,
    gradient: 'from-teal-500 to-cyan-500',
  },
}

interface NextQuizCTAProps {
  currentQuiz: QuizType
}

export function NextQuizCTA({ currentQuiz }: NextQuizCTAProps) {
  const next = NEXT_QUIZ_MAP[currentQuiz]
  if (!next) return null

  const Icon = next.icon

  return (
    <div className="rounded-lg border border-border bg-card/50 p-1">
      <p className="px-4 pt-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        What's next for you
      </p>
      <Link
        href={next.href}
        className={cn(
          'group flex items-center justify-between gap-4 rounded-md p-4 transition-all',
          'hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm',
              next.gradient
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {next.label}
            </p>
            <p className="text-sm text-muted-foreground">{next.description}</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  )
}
