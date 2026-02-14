import React from 'react'
import Link from 'next/link'
import {
  Target,
  Activity,
  Zap,
  Shield,
  GitCompare,
  Map,
  DollarSign,
  ArrowRight,
  Clock,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { QuizMetadata } from '@/lib/quiz/types'

const quizzes: QuizMetadata[] = [
  {
    id: 'learn-next',
    title: 'What Should I Learn Next?',
    description: 'Get personalized technology recommendations based on your skills, goals, and available time.',
    icon: 'Target',
    duration: '30 seconds',
    questionCount: 4,
    gradient: 'from-blue-500 via-indigo-500 to-blue-400',
    href: '/quiz/learn-next',
    priority: 1,
    enabled: true
  },
  {
    id: 'stack-health',
    title: 'Is My Stack Still Relevant?',
    description: 'Check if your current tech stack is keeping up with market trends and identify skill gaps.',
    icon: 'Activity',
    duration: '20 seconds',
    questionCount: 2,
    gradient: 'from-green-500 via-emerald-500 to-green-400',
    href: '/quiz/stack-health',
    priority: 2,
    enabled: true
  },
  {
    id: 'hype-check',
    title: 'Hype or Real?',
    description: 'Cut through the noise and find out if a trending technology is worth your time.',
    icon: 'Zap',
    duration: '10 seconds',
    questionCount: 1,
    gradient: 'from-yellow-500 via-amber-500 to-yellow-400',
    href: '/quiz/hype-check',
    priority: 3,
    enabled: true
  },
  {
    id: 'future-proof',
    title: 'Future-Proof My Career',
    description: 'Analyze your skills for the next 3 years and get a strategic action plan.',
    icon: 'Shield',
    duration: '20 seconds',
    questionCount: 3,
    gradient: 'from-purple-500 via-violet-500 to-purple-400',
    href: '/quiz/future-proof',
    priority: 4,
    enabled: false
  },
  {
    id: 'decision',
    title: 'Which Framework Should I Pick?',
    description: 'Compare technologies with context and get a clear recommendation for your situation.',
    icon: 'GitCompare',
    duration: '30 seconds',
    questionCount: 5,
    gradient: 'from-orange-500 via-red-500 to-orange-400',
    href: '/quiz/decision',
    priority: 5,
    enabled: true,
    comingSoon: false
  },
  {
    id: 'roadmap',
    title: 'Build My Career Roadmap',
    description: 'Get a personalized, data-backed learning roadmap from where you are to where you want to be.',
    icon: 'Map',
    duration: '45 seconds',
    questionCount: 6,
    gradient: 'from-teal-500 via-cyan-500 to-teal-400',
    href: '/quiz/roadmap',
    priority: 1,  // Make it first priority
    enabled: true  // ✅ NOW ENABLED!
  },
  {
    id: 'salary',
    title: 'Am I Underpaid?',
    description: 'Find out if your salary matches your skills and experience level.',
    icon: 'DollarSign',
    duration: '30 seconds',
    questionCount: 4,
    gradient: 'from-pink-500 via-rose-500 to-pink-400',
    href: '/quiz/salary',
    priority: 7,
    enabled: false,
    comingSoon: true
  }
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Activity,
  Zap,
  Shield,
  GitCompare,
  Map,
  DollarSign
}

export const metadata = {
  title: 'Career Quizzes | DevTrends',
  description: 'Make informed career decisions in 30 seconds with personalized technology recommendations.'
}

export default function QuizHubPage() {
  const enabledQuizzes = quizzes.filter(q => q.enabled)
  const comingSoonQuizzes = quizzes.filter(q => !q.enabled)

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Career Quizzes
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions in 30 seconds. Get personalized recommendations based on real market data.
          </p>
        </div>

        {/* Enabled Quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {enabledQuizzes.map((quiz, index) => {
            const Icon = iconMap[quiz.icon]

            return (
              <Link
                key={quiz.id}
                href={quiz.href}
                className="group block"
              >
                <Card className="relative h-full overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg">
                  {/* Gradient background */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity',
                      `bg-gradient-to-br ${quiz.gradient}`
                    )}
                  />

                  <div className="relative p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                        'bg-gradient-to-br',
                        quiz.gradient,
                        'text-white shadow-lg'
                      )}
                    >
                      {Icon && <Icon className="w-6 h-6" />}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {quiz.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{quiz.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>{quiz.questionCount} questions</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Start Quiz
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Coming Soon */}
        {comingSoonQuizzes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonQuizzes.map((quiz) => {
                const Icon = iconMap[quiz.icon]

                return (
                  <Card
                    key={quiz.id}
                    className="relative h-full overflow-hidden border-2 border-dashed border-border opacity-60"
                  >
                    {/* Gradient background */}
                    <div
                      className={cn(
                        'absolute inset-0 opacity-5',
                        `bg-gradient-to-br ${quiz.gradient}`
                      )}
                    />

                    <div className="relative p-6 flex flex-col h-full">
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                          'bg-gradient-to-br',
                          quiz.gradient,
                          'text-white shadow-lg'
                        )}
                      >
                        {Icon && <Icon className="w-6 h-6" />}
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">
                          {quiz.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Soon
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {quiz.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{quiz.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>{quiz.questionCount} questions</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All recommendations are based on real market data, not hype.
            <br />
            Powered by AI for personalized insights.
          </p>
        </div>
      </div>
    </div>
  )
}
