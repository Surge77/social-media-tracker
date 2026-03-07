'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Briefcase, Code, Lightbulb } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void
  disabled?: boolean
}

const SUGGESTED_QUESTIONS = [
  {
    icon: TrendingUp,
    question: "What's the fastest growing frontend framework?",
    category: 'Trends'
  },
  {
    icon: Code,
    question: 'Should I learn React if I already know Vue?',
    category: 'Learning'
  },
  {
    icon: Briefcase,
    question: 'Which backend framework has the best job market?',
    category: 'Career'
  },
  {
    icon: Lightbulb,
    question: 'Is TypeScript still worth learning in 2026?',
    category: 'Advice'
  }
]

export function SuggestedQuestions({ onSelectQuestion, disabled }: SuggestedQuestionsProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="app-section">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">
        Suggested Questions
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SUGGESTED_QUESTIONS.map((item, index) => {
          const Icon = item.icon

          return (
            <motion.button
              key={item.question}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { duration: 0.3, delay: index * 0.1 }}
              onClick={() => onSelectQuestion(item.question)}
              disabled={disabled}
              className="group text-left rounded-2xl border border-border/70 bg-card/45 p-4 transition-colors hover:border-primary/40 hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="w-4 h-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    {item.category}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {item.question}
                  </div>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
