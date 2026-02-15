'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ArrowLeft, ArrowRight } from 'lucide-react'
import { Loading, LoadingSpinner } from '@/components/ui/loading'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { TechMultiSelect } from '@/components/quiz/TechMultiSelect'
import { StackHealthResult } from '@/components/quiz/results/StackHealthResult'
import { Button } from '@/components/ui/button'
import type { QuizQuestion as QuizQuestionType, QuizAnswer, QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'
import { calculateStackHealth } from '@/lib/quiz/stack-health-engine'
import { saveQuizResult } from '@/lib/quiz/storage'

const questions: QuizQuestionType[] = [
  {
    id: 'daily-stack',
    type: 'tech-select',
    question: 'What technologies do you use daily?',
    description: 'Select 3-8 technologies from your current stack',
    required: true,
    min: 3,
    max: 8
  },
  {
    id: 'experience-years',
    type: 'single-select',
    question: 'How long have you been using this stack?',
    required: true,
    options: [
      { value: '<1', label: '< 1 year', description: 'Still learning the ropes' },
      { value: '1-3', label: '1-3 years', description: 'Getting comfortable' },
      { value: '3-5', label: '3-5 years', description: 'Experienced' },
      { value: '5+', label: '5+ years', description: 'Very experienced' }
    ]
  }
]

export default function StackHealthQuizPage() {
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

    if (currentQuestion.required && !value) {
      return false
    }

    if (currentQuestion.validation && !currentQuestion.validation(value)) {
      return false
    }

    // Tech select validation
    if (currentQuestion.type === 'tech-select' && Array.isArray(value)) {
      const min = currentQuestion.min || 1
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

      const recommendation = await calculateStackHealth(
        quizAnswers,
        technologies
      )

      const quizResult: QuizResult = {
        quizType: 'stack-health',
        answers: quizAnswers,
        recommendation,
        completedAt: Date.now(),
        version: '1.0.0'
      }

      saveQuizResult(quizResult)
      setResult(quizResult)
    } catch (error) {
      console.error('Error calculating stack health:', error)
      setErrors({ submit: 'Failed to analyze your stack. Please try again.' })
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
      <StackHealthResult
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
        title="Is My Stack Still Relevant?"
        description="Check if your tech stack is keeping up with market trends"
        icon={<Activity className="w-6 h-6" />}
        gradient="from-green-500 via-emerald-500 to-green-400"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="md" text="Loading technologies..." />
        </div>
      </QuizContainer>
    )
  }

  return (
    <QuizContainer
      title="Is My Stack Still Relevant?"
      description="Check if your tech stack is keeping up with market trends"
      icon={<Activity className="w-6 h-6" />}
      gradient="from-green-500 via-emerald-500 to-green-400"
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
        {currentQuestion.type === 'tech-select' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                {currentQuestion.question}
                {currentQuestion.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </h2>
              {currentQuestion.description && (
                <p className="text-sm text-muted-foreground">
                  {currentQuestion.description}
                </p>
              )}
            </div>
            <TechMultiSelect
              technologies={technologies.map(t => ({
                slug: t.slug,
                name: t.name,
                category: t.category
              }))}
              value={(answers[currentQuestion.id] as string[]) || []}
              onChange={handleAnswerChange}
              min={currentQuestion.min}
              max={currentQuestion.max}
            />
          </div>
        ) : (
          <QuizQuestion
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={handleAnswerChange}
            error={errors[currentQuestion.id]}
          />
        )}
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
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 text-white"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Analyzing...
            </>
          ) : isLastQuestion ? (
            'Check Stack Health'
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
