'use client'

// src/app/(dashboard)/quiz/roadmap/page.tsx
// Career Roadmap Quiz Page

import React, { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GroupedTechSelect } from '@/components/quiz/GroupedTechSelect'
import { RoadmapSkeleton } from '@/components/quiz/roadmap/RoadmapSkeleton'
import { roadmapQuestions, validateRoadmapAnswers } from '@/lib/quiz/roadmap-questions'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

// Lazy load RoadmapResult to reduce initial bundle size
const RoadmapResult = lazy(() => import('@/components/quiz/roadmap/RoadmapResult').then(m => ({ default: m.RoadmapResult })))

export default function RoadmapQuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [showResults, setShowResults] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const questionRef = React.useRef<HTMLHeadingElement>(null)

  const currentQuestion = roadmapQuestions[currentStep]
  const progress = ((currentStep + 1) / roadmapQuestions.length) * 100
  const isFirstQuestion = currentStep === 0
  const isLastQuestion = currentStep === roadmapQuestions.length - 1

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      const validation = validateRoadmapAnswers(answers)
      if (validation.valid) {
        setShowResults(true)
      } else {
        alert(validation.errors.join('\n'))
      }
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id]
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    return !!answer
  }

  // Focus management for accessibility
  React.useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus()
    }
  }, [currentStep])

  if (showResults) {
    return (
      <Suspense fallback={<RoadmapSkeleton />}>
        <RoadmapResult
          answers={answers}
          onRestart={() => {
            setShowResults(false)
            setCurrentStep(0)
            setAnswers({})
          }}
        />
      </Suspense>
    )
  }

  return (
    <main className="container mx-auto max-w-4xl py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">🗺️ Build Your Career Roadmap</h1>
        <p className="mt-2 text-muted-foreground">
          Answer 6 quick questions to get a personalized, data-backed learning path
        </p>
      </header>

      {/* Screen reader announcement for question changes */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Question {currentStep + 1} of {roadmapQuestions.length}: {currentQuestion.question}
      </div>

      {/* Progress bar */}
      <div className="mb-8" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz progress">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentStep + 1} of {roadmapQuestions.length}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-8" role="form" aria-label={`Question ${currentStep + 1}: ${currentQuestion.question}`}>
            {/* Question */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary" aria-hidden="true">Q{currentStep + 1}</Badge>
                <h2
                  ref={questionRef}
                  id={`question-${currentStep}`}
                  className="text-2xl font-bold outline-none"
                  tabIndex={-1}
                >
                  {currentQuestion.question}
                </h2>
              </div>
              {currentQuestion.description && (
                <p className="text-muted-foreground" id={`question-desc-${currentStep}`}>{currentQuestion.description}</p>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3" role="group" aria-labelledby={`question-${currentStep}`} aria-describedby={currentQuestion.description ? `question-desc-${currentStep}` : undefined}>
              {currentQuestion.type === 'single-select' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map(option => (
                    <Button
                      key={option.value}
                      variant={answers[currentQuestion.id] === option.value ? 'default' : 'outline'}
                      className="h-auto w-full justify-start p-4 text-left"
                      onClick={() => handleAnswer(currentQuestion.id, option.value)}
                      disabled={option.disabled}
                      role="radio"
                      aria-checked={answers[currentQuestion.id] === option.value}
                      aria-label={`${option.label}${option.description ? `: ${option.description}` : ''}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{option.label}</span>
                          {option.disabled && option.disabledMessage && (
                            <Badge variant="secondary" className="text-xs">
                              {option.disabledMessage}
                            </Badge>
                          )}
                        </div>
                        {option.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'tech-select' && (
                <GroupedTechSelect
                  value={(answers[currentQuestion.id] as string[]) ?? []}
                  onChange={(value) => handleAnswer(currentQuestion.id, value)}
                />
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <nav className="mt-8 flex items-center justify-between" aria-label="Quiz navigation">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={isFirstQuestion}
          className={cn(isFirstQuestion && 'invisible')}
          aria-label="Go to previous question"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isCurrentQuestionAnswered()}
          size="lg"
          aria-label={isLastQuestion ? 'Generate your personalized roadmap' : 'Go to next question'}
          aria-disabled={!isCurrentQuestionAnswered()}
        >
          {isLastQuestion ? (
            <>
              Generate My Roadmap
              <Sparkles className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </nav>
    </main>
  )
}
