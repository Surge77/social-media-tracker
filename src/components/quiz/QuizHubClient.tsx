'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Target, Activity, Zap, GitCompare, Map, Link2,
  Clock, HelpCircle, ArrowRight, Users, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { MagicCard } from '@/components/ui/magic-card'
import { getQuizResults } from '@/lib/quiz/storage'
import type { QuizType } from '@/lib/quiz/types'

// ─── Static quiz data ─────────────────────────────────────────────────────────

interface QuizMeta {
  id: QuizType
  title: string
  description: string
  icon: React.ElementType
  duration: string
  questionCount: number
  gradient: string
  href: string
  audience: string
  isNew?: boolean
}

const ACTIVE_QUIZZES: QuizMeta[] = [
  {
    id: 'hype-check',
    title: 'Hype or Real?',
    description: 'Cut through the noise — is a trending technology actually worth your time?',
    icon: Zap,
    duration: '10 sec',
    questionCount: 1,
    gradient: 'from-yellow-500 via-amber-500 to-yellow-400',
    href: '/quiz/hype-check',
    audience: 'All levels',
    isNew: false,
  },
  {
    id: 'learn-next',
    title: 'What Should I Learn Next?',
    description: 'Get personalized recommendations based on your skills, goals, and available time.',
    icon: Target,
    duration: '30 sec',
    questionCount: 4,
    gradient: 'from-blue-500 via-indigo-500 to-blue-400',
    href: '/quiz/learn-next',
    audience: 'All levels',
  },
  {
    id: 'stack-health',
    title: 'Is My Stack Still Relevant?',
    description: 'Check if your current tech stack is keeping up with market trends.',
    icon: Activity,
    duration: '20 sec',
    questionCount: 2,
    gradient: 'from-green-500 via-emerald-500 to-green-400',
    href: '/quiz/stack-health',
    audience: 'Working devs',
  },
  {
    id: 'decision',
    title: 'Which Framework Should I Pick?',
    description: 'Compare technologies in context and get a clear recommendation for your project.',
    icon: GitCompare,
    duration: '30 sec',
    questionCount: 5,
    gradient: 'from-orange-500 via-red-500 to-orange-400',
    href: '/quiz/decision',
    audience: 'All levels',
  },
  {
    id: 'roadmap',
    title: 'Build My Career Roadmap',
    description: 'Get a personalized, data-backed learning roadmap from where you are to where you want to be.',
    icon: Map,
    duration: '45 sec',
    questionCount: 6,
    gradient: 'from-teal-500 via-cyan-500 to-teal-400',
    href: '/quiz/roadmap',
    audience: 'All levels',
  },
  {
    id: 'web3-path',
    title: 'Find Your Web3 Path',
    description: 'Which blockchain, language, and toolchain matches your background and goals?',
    icon: Link2,
    duration: '30 sec',
    questionCount: 5,
    gradient: 'from-violet-600 via-purple-500 to-indigo-500',
    href: '/quiz/web3-path',
    audience: 'Web3 curious',
    isNew: true,
  },
]

const COMING_SOON: string[] = ['Future-Proof My Career', 'Am I Underpaid?']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (weeks === 1) return '1 week ago'
  return `${weeks} weeks ago`
}

// ─── Quiz Card ────────────────────────────────────────────────────────────────

function QuizCard({ quiz, lastTaken }: { quiz: QuizMeta; lastTaken?: number }) {
  const Icon = quiz.icon

  return (
    <Link href={quiz.href} className="group block h-full">
      <MagicCard className="h-full rounded-xl border-2 border-border hover:border-primary/50 transition-all hover:shadow-xl bg-card">
        {/* Gradient background */}
        <div
          className={cn(
            'absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br rounded-[inherit]',
            quiz.gradient
          )}
        />

        <div className="relative flex h-full flex-col p-6">
          {/* Icon + badges row */}
          <div className="mb-4 flex items-start justify-between gap-2">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                quiz.gradient
              )}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div className="flex flex-col items-end gap-1.5">
              {lastTaken && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Taken {timeAgo(lastTaken)}
                </span>
              )}
              {quiz.isNew && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  NEW
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {quiz.title}
          </h3>

          {/* Description */}
          <p className="mb-4 flex-1 text-sm text-muted-foreground">{quiz.description}</p>

          {/* Meta row */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{quiz.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              <span>{quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{quiz.audience}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary group-hover:underline underline-offset-2">
              Start Quiz
            </span>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </MagicCard>
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function QuizHubClient() {
  const [takenMap, setTakenMap] = useState<Partial<Record<QuizType, number>>>({})

  useEffect(() => {
    try {
      const results = getQuizResults()
      const map: Partial<Record<QuizType, number>> = {}
      for (const [type, result] of Object.entries(results)) {
        if (result) map[type as QuizType] = result.completedAt
      }
      setTakenMap(map)
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Career Quizzes</h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Make informed decisions in 30 seconds. Powered by real market data, not hype.
          </p>
        </div>

        {/* Start Here banner */}
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-5 py-4">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">New here?</span>{' '}
            Start with{' '}
            <Link
              href="/quiz/hype-check"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Hype or Real?
            </Link>{' '}
            — it takes 10 seconds and instantly shows if a technology is worth your time.
          </p>
        </div>

        {/* Quiz grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ACTIVE_QUIZZES.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              lastTaken={takenMap[quiz.id]}
            />
          ))}
        </div>

        {/* Coming soon — compact */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Coming soon:</span>{' '}
            {COMING_SOON.join(', ')}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            All recommendations are based on real market data, not hype. Powered by AI.
          </p>
        </div>
      </div>
    </div>
  )
}
