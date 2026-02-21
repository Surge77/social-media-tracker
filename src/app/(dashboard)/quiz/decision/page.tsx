'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GitCompare, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { DecisionResult } from '@/components/quiz/results/DecisionResult'
import { Button } from '@/components/ui/button'
import { Loading, LoadingSpinner } from '@/components/ui/loading'
import type { QuizQuestion as QuizQuestionType, QuizAnswer, QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'
import { generateTechnologyDecision } from '@/lib/quiz/decision-engine'
import { saveQuizResult } from '@/lib/quiz/storage'

const questions: QuizQuestionType[] = [
  {
    id: 'use-case',
    type: 'single-select',
    question: 'What are you building?',
    required: true,
    options: [
      { value: 'web-app', label: 'Web Application', icon: 'Globe', description: 'Interactive web app' },
      { value: 'mobile-app', label: 'Mobile App', icon: 'Smartphone', description: 'iOS/Android app' },
      { value: 'api', label: 'API/Backend', icon: 'Server', description: 'REST/GraphQL API' },
      { value: 'static-site', label: 'Static Site', icon: 'FileText', description: 'Blog, docs, landing page' },
      { value: 'fullstack', label: 'Full-Stack App', icon: 'Layers', description: 'Frontend + Backend' },
      { value: 'data-viz', label: 'Data Visualization', icon: 'BarChart', description: 'Charts, dashboards' }
    ]
  },
  {
    id: 'experience-level',
    type: 'single-select',
    question: 'Your experience level?',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner', description: 'New to web development' },
      { value: 'intermediate', label: 'Intermediate', description: 'Know the basics, ready to grow' },
      { value: 'expert', label: 'Expert', description: 'Want cutting-edge tech' }
    ]
  },
  {
    id: 'project-constraints',
    type: 'single-select',
    question: 'What\'s your main constraint?',
    required: true,
    options: [
      { value: 'time-to-market', label: 'Speed to Launch', icon: 'Zap', description: 'Ship fast' },
      { value: 'performance', label: 'Performance', icon: 'Gauge', description: 'Speed & efficiency' },
      { value: 'team-familiarity', label: 'Team Familiarity', icon: 'Users', description: 'Easy to hire for' },
      { value: 'balanced', label: 'Balanced', icon: 'Scale', description: 'No specific priority' }
    ]
  },
  {
    id: 'team-size',
    type: 'single-select',
    question: 'Team size?',
    required: true,
    options: [
      { value: 'solo', label: 'Solo', description: 'Just me' },
      { value: 'small', label: 'Small (2-5)', description: 'Small team' },
      { value: 'medium', label: 'Medium (6-15)', description: 'Growing team' },
      { value: 'large', label: 'Large (15+)', description: 'Large organization' }
    ]
  },
  {
    id: 'must-haves',
    type: 'multi-select',
    question: 'Must-have features? (Optional)',
    required: false,
    options: [
      { value: 'typescript', label: 'TypeScript', description: 'Type safety' },
      { value: 'ssr', label: 'Server-Side Rendering', description: 'SEO & performance' },
      { value: 'mobile', label: 'Mobile Support', description: 'iOS/Android' },
      { value: 'real-time', label: 'Real-time', description: 'WebSockets, live updates' },
      { value: 'static-export', label: 'Static Export', description: 'JAMstack' }
    ],
    min: 0,
    max: 5
  }
]

export default function DecisionQuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [technologies, setTechnologies] = useState<TechnologyWithScore[]>([])
  const [isLoadingTech, setIsLoadingTech] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)

  // Fetch technologies on mount
  useEffect(() => {
    async function fetchTechnologies() {
      try {
        const response = await fetch('/api/technologies')
        if (!response.ok) throw new Error('Failed to fetch technologies')
        const data = await response.json()
        setTechnologies(data.technologies || [])
      } catch (error) {
        console.error('Error fetching technologies:', error)
      } finally {
        setIsLoadingTech(false)
      }
    }

    fetchTechnologies()
  }, [])

  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1
  const canGoBack = currentStep > 0
  const canGoNext = validateCurrentAnswer()

  function validateCurrentAnswer(): boolean {
    const value = answers[currentQuestion.id]

    // Skip validation for optional questions
    if (!currentQuestion.required && !value) {
      return true
    }

    if (currentQuestion.required && !value) {
      return false
    }

    if (currentQuestion.validation && !currentQuestion.validation(value)) {
      return false
    }

    // Multi-select validation
    if (currentQuestion.type === 'multi-select' && Array.isArray(value)) {
      const min = currentQuestion.min || 0
      const max = currentQuestion.max || 999
      return value.length >= min && value.length <= max
    }

    return true
  }

  function handleAnswerChange(value: unknown) {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[currentQuestion.id]
      return newErrors
    })
  }

  function handleNext() {
    if (!canGoNext) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'Please complete this question'
      }))
      return
    }

    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  function handleBack() {
    if (canGoBack) {
      setCurrentStep(prev => prev - 1)
    }
  }

  async function handleSubmit() {
    setIsGenerating(true)

    try {
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: value as string | string[] | number
      }))

      const recommendation = await generateTechnologyDecision(
        quizAnswers,
        technologies
      )

      const quizResult: QuizResult = {
        quizType: 'decision',
        answers: quizAnswers,
        recommendation,
        completedAt: Date.now(),
        version: '1.0.0'
      }

      saveQuizResult(quizResult)
      setResult(quizResult)
    } catch (error) {
      console.error('Error generating recommendation:', error)
      setErrors({ submit: 'Failed to generate recommendation. Please try again.' })
    } finally {
      setIsGenerating(false)
    }
  }

  function handleRetake() {
    setCurrentStep(0)
    setAnswers({})
    setErrors({})
    setResult(null)
  }

  // Show result if available
  if (result) {
    return (
      <DecisionResult
        result={result}
        technologies={technologies}
        onRetake={handleRetake}
        onClose={() => router.push('/quiz')}
      />
    )
  }

  // Show loading state
  if (isLoadingTech) {
    return (
      <QuizContainer
        title="Which Framework Should I Pick?"
        description="Get a technology recommendation based on your specific needs"
        icon={<GitCompare className="w-6 h-6" />}
        gradient="from-orange-500 via-red-500 to-orange-400"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="md" text="Loading technologies..." />
        </div>
      </QuizContainer>
    )
  }

  return (
    <QuizContainer
      title="Which Framework Should I Pick?"
      description="Get a technology recommendation based on your specific needs"
      icon={<GitCompare className="w-6 h-6" />}
      gradient="from-orange-500 via-red-500 to-orange-400"
    >
      {/* Progress */}
      <div className="mb-8">
        <QuizProgress
          currentStep={currentStep + 1}
          totalSteps={questions.length}
        />
      </div>

      {/* Question */}
      <div className="mb-8">
        <QuizQuestion
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={handleAnswerChange}
          error={errors[currentQuestion.id]}
          onAutoAdvance={!isLastQuestion ? handleNext : undefined}
        />
      </div>

      {/* Error message */}
      {errors.submit && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={!canGoBack || isGenerating}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext || isGenerating}
          className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 text-white"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Analyzing...
            </>
          ) : isLastQuestion ? (
            'Get Recommendation'
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </QuizContainer>
  )
}
