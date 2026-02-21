'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Target, ArrowLeft, ArrowRight } from 'lucide-react'
import { Loading, LoadingSpinner } from '@/components/ui/loading'
import { QuizContainer } from '@/components/quiz/QuizContainer'
import { QuizProgress } from '@/components/quiz/QuizProgress'
import { QuizQuestion } from '@/components/quiz/QuizQuestion'
import { TechMultiSelect } from '@/components/quiz/TechMultiSelect'
import { LearnNextResult } from '@/components/quiz/results/LearnNextResult'
import { Button } from '@/components/ui/button'
import type { QuizQuestion as QuizQuestionType, QuizAnswer, QuizResult } from '@/lib/quiz/types'
import type { TechnologyWithScore } from '@/types'
import { generateLearnNextRecommendation } from '@/lib/quiz/learn-next-engine'
import { saveQuizResult } from '@/lib/quiz/storage'

const questions: QuizQuestionType[] = [
  {
    id: 'current-skills',
    type: 'tech-select',
    question: 'What do you already know?',
    description: 'Select 1-8 technologies you\'re comfortable with',
    required: true,
    min: 1,
    max: 8
  },
  {
    id: 'goal',
    type: 'single-select',
    question: 'What\'s your goal?',
    required: true,
    options: [
      { value: 'get-job', label: 'Get a job', icon: 'Briefcase', description: 'Find my first developer role' },
      { value: 'better-job', label: 'Get a better job', icon: 'TrendingUp', description: 'Level up my career' },
      { value: 'side-project', label: 'Build a side project', icon: 'Rocket', description: 'Create something cool' },
      { value: 'stay-relevant', label: 'Stay relevant', icon: 'Shield', description: 'Keep my skills fresh' },
      { value: 'switch-fields', label: 'Switch fields', icon: 'ArrowRightLeft', description: 'Try a new specialty' }
    ]
  },
  {
    id: 'time-commitment',
    type: 'single-select',
    question: 'How much time can you invest?',
    required: true,
    options: [
      { value: '2hrs', label: '2 hrs/week', description: 'Casual learning' },
      { value: '5hrs', label: '5 hrs/week', description: 'Steady progress' },
      { value: '10hrs', label: '10 hrs/week', description: 'Serious commitment' },
      { value: 'fulltime', label: 'Full-time', description: 'Bootcamp mode' }
    ]
  },
  {
    id: 'interest-area',
    type: 'single-select',
    question: 'What type of work interests you?',
    required: true,
    options: [
      { value: 'frontend', label: 'Build UIs', icon: 'Layout', description: 'React, Vue, CSS' },
      { value: 'backend', label: 'Build APIs', icon: 'Server', description: 'Node, Python, databases' },
      { value: 'data', label: 'Work with data', icon: 'Database', description: 'Analytics, databases' },
      { value: 'mobile', label: 'Build mobile apps', icon: 'Smartphone', description: 'iOS, Android, React Native' },
      { value: 'devops', label: 'DevOps/Infrastructure', icon: 'Cloud', description: 'Docker, K8s, CI/CD' },
      { value: 'ai-ml', label: 'AI/ML', icon: 'Brain', description: 'Machine learning, AI' }
    ]
  }
]

export default function LearnNextQuizPage() {
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
    // Clear error for this question
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
      // Convert answers to QuizAnswer format
      const quizAnswers: QuizAnswer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value: value as string | string[] | number
      }))

      // Generate recommendation
      const recommendation = await generateLearnNextRecommendation(
        quizAnswers,
        technologies
      )

      // Save result
      const quizResult: QuizResult = {
        quizType: 'learn-next',
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
      <LearnNextResult
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
        title="What Should I Learn Next?"
        description="Get personalized recommendations based on your skills and goals"
        icon={<Target className="w-6 h-6" />}
        gradient="from-blue-500 via-indigo-500 to-blue-400"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="md" text="Loading technologies..." />
        </div>
      </QuizContainer>
    )
  }

  return (
    <QuizContainer
      title="What Should I Learn Next?"
      description="Get personalized recommendations based on your skills and goals"
      icon={<Target className="w-6 h-6" />}
      gradient="from-blue-500 via-indigo-500 to-blue-400"
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
            onAutoAdvance={!isLastQuestion ? handleNext : undefined}
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
          className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 text-white"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Generating...
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
